/**
 * AccessRepair - Scan Controller
 * Orchestrates the full scan pipeline: scan → score → prioritize → AI fix → save
 */
const { scanUrl } = require('../services/scanService');
const { calculateScore } = require('../services/scoring');
const { prioritizeViolations } = require('../services/priorityEngine');
const { getAIProvider } = require('../services/ai/aiProvider');
const { sanitize } = require('../utils/htmlSanitizer');
const { validateScanUrl } = require('../utils/urlSafety');
const logger = require('../utils/logger');
const { SCAN_STAGES } = require('../../../shared/constants');

/**
 * Handle POST /api/scan
 * Supports SSE streaming for real-time progress updates
 */
async function handleScan(req, res) {
    const { url } = req.body || {};

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    let safeUrl;
    try {
        const validation = await validateScanUrl(url.trim());
        if (!validation.valid) {
            logger.warn('Rejected scan URL', { reason: validation.reason, url });
            return res.status(400).json({ error: validation.reason });
        }

        safeUrl = validation.normalizedUrl;
    } catch (error) {
        logger.error('Unexpected URL validation failure', { error: error.message });
        return res.status(500).json({ error: 'URL validation failed' });
    }

    const acceptHeader = req.headers.accept || '';
    const useSSE = acceptHeader.includes('text/event-stream');

    if (useSSE) {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        });

        const sendProgress = (stage, message, progress) => {
            res.write(`data: ${JSON.stringify({ type: 'progress', stage, message, progress })}\n\n`);
        };

        try {
            await runScanPipeline(req, safeUrl, sendProgress, (result) => {
                res.write(`data: ${JSON.stringify({ type: 'result', data: result })}\n\n`);
                res.end();
            });
        } catch (error) {
            logger.error('SSE scan pipeline failed', { url: safeUrl, error: error.message });
            res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
            res.end();
        }
        return;
    }

    try {
        const result = await runScanPipeline(req, safeUrl);
        res.json(result);
    } catch (error) {
        logger.error('Scan pipeline failed', { url: safeUrl, error: error.message });
        res.status(500).json({ error: error.message });
    }
}

/**
 * Core scan pipeline
 */
async function runScanPipeline(req, url, onProgress = () => { }, onComplete = null) {
    const prisma = req.app.locals.prisma;

    onProgress('LAUNCHING', SCAN_STAGES.LAUNCHING, 5);
    const scanResults = await scanUrl(url, onProgress);

    onProgress('SCORING', SCAN_STAGES.SCORING, 70);
    const flatViolations = [];

    for (const violation of scanResults.violations) {
        for (const node of violation.nodes) {
            flatViolations.push({
                ruleId: violation.ruleId,
                severity: violation.severity,
                description: violation.description,
                help: violation.help,
                helpUrl: violation.helpUrl,
                html: node.html,
                selector: node.selector,
                failureSummary: node.failureSummary,
            });
        }
    }

    const { score, breakdown } = calculateScore(
        flatViolations.map(v => ({ severity: v.severity, nodeCount: 1 })),
        scanResults.totalElements
    );

    onProgress('PRIORITIZING', SCAN_STAGES.PRIORITIZING, 75);
    const prioritized = prioritizeViolations(flatViolations);

    onProgress('AI_FIXING', SCAN_STAGES.AI_FIXING, 80);
    const aiProvider = getAIProvider();
    const topViolations = prioritized.slice(0, 10);
    const sanitizedForAI = topViolations.map(v => ({
        description: v.description,
        html: sanitize(v.html),
        selector: v.selector,
    }));

    let fixes = [];

    try {
        fixes = await aiProvider.generateFixes(sanitizedForAI);
    } catch (error) {
        logger.error('AI fix generation failed, returning placeholders', { error: error.message });
        fixes = topViolations.map(() => ({
            fixedHtml: '',
            explanation: 'AI service unavailable',
            confidence: 0,
            rootCause: 'Unknown',
            affectedUsers: 'Unknown',
        }));
    }

    const violationsWithFixes = prioritized.map((violation, index) => ({
        ...violation,
        fix: fixes[index] || null,
    }));

    onProgress('SAVING', SCAN_STAGES.SAVING, 90);
    const savedScan = await prisma.scan.create({
        data: {
            url,
            score,
            totalElements: scanResults.totalElements,
            violations: {
                create: violationsWithFixes.map(v => ({
                    ruleId: v.ruleId,
                    severity: v.severity,
                    description: v.description,
                    html: v.html,
                    selector: v.selector,
                    helpUrl: v.helpUrl || '',
                    priorityScore: v.priorityScore,
                    fixedHtml: v.fix?.fixedHtml || '',
                    explanation: v.fix?.explanation || '',
                    confidence: v.fix?.confidence || 0,
                    rootCause: v.fix?.rootCause || '',
                    affectedUsers: v.fix?.affectedUsers || '',
                })),
            },
        },
        include: { violations: true },
    });

    onProgress('COMPLETE', SCAN_STAGES.COMPLETE, 100);

    const result = {
        id: savedScan.id,
        url: savedScan.url,
        score,
        breakdown,
        totalElements: scanResults.totalElements,
        violationCount: violationsWithFixes.length,
        violations: savedScan.violations,
        passes: scanResults.passes,
        incomplete: scanResults.incomplete,
        createdAt: savedScan.createdAt,
    };

    if (onComplete) onComplete(result);

    return result;
}

async function handleHistory(req, res) {
    try {
        const prisma = req.app.locals.prisma;
        const scans = await prisma.scan.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: { violations: { orderBy: { priorityScore: 'desc' } } },
        });

        res.json(scans);
    } catch (error) {
        logger.error('History endpoint failed', { error: error.message });
        res.status(500).json({ error: 'Failed to fetch scan history' });
    }
}

async function handleGetScan(req, res) {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(id) || id <= 0) {
        return res.status(400).json({ error: 'Scan id must be a positive integer' });
    }

    try {
        const prisma = req.app.locals.prisma;
        const scan = await prisma.scan.findUnique({
            where: { id },
            include: { violations: { orderBy: { priorityScore: 'desc' } } },
        });

        if (!scan) {
            return res.status(404).json({ error: 'Scan not found' });
        }

        res.json(scan);
    } catch (error) {
        logger.error('Scan lookup failed', { id, error: error.message });
        res.status(500).json({ error: 'Failed to fetch scan' });
    }
}

async function handleChat(req, res) {
    const { messages, scanContext } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required' });
    }

    try {
        const aiProvider = getAIProvider();
        const reply = await aiProvider.chat(messages, scanContext || null);
        res.json({ reply });
    } catch (error) {
        logger.error('Chat endpoint failed', { error: error.message });
        res.status(500).json({ error: `AI chat failed: ${error.message}` });
    }
}

module.exports = { handleScan, handleHistory, handleGetScan, handleChat };
