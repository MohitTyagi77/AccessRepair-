/**
 * AccessRepair - AI Provider Interface (Adapter Layer)
 */
const logger = require('../../utils/logger');

/**
 * @typedef {{
 *   fixedHtml: string,
 *   explanation: string,
 *   confidence: number,
 *   rootCause: string,
 *   affectedUsers: string
 * }} AIFix
 */

class AIProvider {
    /** @param {Array<{description: string, html: string, selector: string}>} violations */
    async generateFixes(violations) {
        throw new Error('generateFixes() must be implemented by provider');
    }

    /** @param {Array<{role: string, content: string}>} messages */
    async chat(messages, scanContext = null) {
        throw new Error('chat() must be implemented by provider');
    }

    buildFixPrompt(violations) {
        const fs = require('fs');
        const path = require('path');

        const violationDescriptions = violations.map((v, i) =>
            `Violation ${i + 1}:\n- Description: ${v.description}\n- HTML: ${v.html}\n- Selector: ${v.selector}`
        ).join('\n\n');

        const promptPath = path.join(__dirname, 'basePrompt.txt');
        let basePrompt = '';

        try {
            basePrompt = fs.readFileSync(promptPath, 'utf8');
        } catch (error) {
            logger.error('Failed to read basePrompt.txt, using fallback prompt', { error: error.message });
            basePrompt = 'You are an expert accessibility engineer. Return strict JSON. Violations:\n{{VIOLATIONS}}';
        }

        return basePrompt.replace('{{VIOLATIONS}}', violationDescriptions);
    }

    buildChatSystemPrompt(scanContext) {
        let prompt = 'You are AccessRepair AI, an expert accessibility assistant. Help users fix issues with precise, practical steps.';

        if (scanContext) {
            prompt += `\n\nCurrent scan context:\n- URL: ${scanContext.url}\n- Score: ${scanContext.score}/100\n- Total violations: ${scanContext.violationCount}\n- Critical: ${scanContext.critical}, Serious: ${scanContext.serious}, Moderate: ${scanContext.moderate}, Minor: ${scanContext.minor}`;
        }

        return prompt;
    }

    /**
     * Parse and normalize model output.
     * Always returns exactly `expectedCount` records.
     *
     * @param {string} responseText
     * @param {number} expectedCount
     * @returns {AIFix[]}
     */
    parseFixes(responseText, expectedCount) {
        const fallback = () => ({
            fixedHtml: '',
            explanation: 'AI could not generate a fix for this violation.',
            confidence: 0,
            rootCause: 'Parse error',
            affectedUsers: 'Unknown',
        });

        try {
            let cleaned = (responseText || '').trim();
            cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

            const parsed = JSON.parse(cleaned);
            const items = Array.isArray(parsed) ? parsed : [parsed];

            /** @type {AIFix[]} */
            const normalized = items.slice(0, expectedCount).map((item) => {
                const safeItem = item && typeof item === 'object' ? item : {};
                return {
                    fixedHtml: String(safeItem.fixedHtml || safeItem.fixed_html || '').slice(0, 20000),
                    explanation: String(safeItem.explanation || '').slice(0, 4000),
                    confidence: Math.max(0, Math.min(1, Number.parseFloat(safeItem.confidence) || 0.5)),
                    rootCause: String(safeItem.rootCause || safeItem.root_cause || 'Unknown').slice(0, 500),
                    affectedUsers: String(safeItem.affectedUsers || safeItem.affected_users || 'General users').slice(0, 500),
                };
            });

            while (normalized.length < expectedCount) {
                normalized.push({
                    fixedHtml: '',
                    explanation: 'AI did not return a fix for this violation.',
                    confidence: 0,
                    rootCause: 'Missing response item',
                    affectedUsers: 'Unknown',
                });
            }

            return normalized;
        } catch (error) {
            logger.warn('Failed to parse AI fix response', { error: error.message });
            return Array.from({ length: expectedCount }, fallback);
        }
    }
}

function withTimeout(promise, timeoutMs, label = 'operation') {
    let timer;

    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function getAIProvider() {
    const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    switch (providerName) {
        case 'openai': {
            const OpenAIProvider = require('./openaiProvider');
            return new OpenAIProvider();
        }
        case 'claude': {
            const ClaudeProvider = require('./claudeProvider');
            return new ClaudeProvider();
        }
        case 'gemini':
        default: {
            const GeminiProvider = require('./geminiProvider');
            return new GeminiProvider();
        }
    }
}

module.exports = { AIProvider, getAIProvider, withTimeout };
