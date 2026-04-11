/**
 * AccessRepair - Scan Service
 * Launches Playwright, navigates to URL, runs axe-core analysis.
 */
const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');
const { validateScanUrl } = require('../utils/urlSafety');
const logger = require('../utils/logger');

/** @typedef {(stage: string, message: string, progress: number) => void} ProgressCallback */

/**
 * Scan a URL for accessibility violations using Playwright + axe-core.
 *
 * Key decisions:
 * - Keep browser/context/page explicit to ensure deterministic cleanup.
 * - Validate the final URL after navigation to guard against redirects to internal hosts.
 *
 * @param {string} url
 * @param {ProgressCallback} [onProgress]
 * @returns {Promise<{violations: Array, passes: number, incomplete: number, totalElements: number}>}
 */
async function scanUrl(url, onProgress = () => { }) {
    let browser = null;
    let context = null;
    let page = null;

    try {
        onProgress('LAUNCHING', 'Launching browser...', 10);
        browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        context = await browser.newContext({
            viewport: { width: 1280, height: 720 },
            userAgent: 'AccessRepair/1.0 Accessibility Scanner',
        });

        page = await context.newPage();
        onProgress('NAVIGATING', `Navigating to ${url}...`, 20);

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Prevent scanning if navigation redirects into blocked/private ranges.
        const finalUrl = page.url();
        const redirectValidation = await validateScanUrl(finalUrl);
        if (!redirectValidation.valid) {
            throw new Error(`Navigation blocked by URL safety policy: ${redirectValidation.reason}`);
        }

        onProgress('WAITING', 'Waiting for page to stabilize...', 40);
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => null);
        await page.waitForTimeout(1000);

        onProgress('SCANNING', 'Running accessibility analysis...', 50);
        const results = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
            .analyze();

        onProgress('SCANNING', 'Analysis complete', 70);

        return {
            violations: results.violations.map(v => ({
                ruleId: v.id,
                severity: v.impact || 'minor',
                description: v.description,
                help: v.help,
                helpUrl: v.helpUrl,
                nodes: v.nodes.map(n => ({
                    html: n.html,
                    selector: n.target.join(', '),
                    failureSummary: n.failureSummary || '',
                })),
            })),
            passes: results.passes.length,
            incomplete: results.incomplete.length,
            totalElements:
                results.passes.length +
                results.violations.reduce((acc, v) => acc + v.nodes.length, 0) +
                results.incomplete.length,
        };
    } catch (error) {
        logger.error('Scan execution failed', { url, error: error.message });

        if (error.message.includes('ERR_NAME_NOT_RESOLVED')) {
            throw new Error(`Could not resolve URL: ${url}. Please check the URL and try again.`);
        }
        if (error.message.includes('Timeout')) {
            throw new Error(`Page took too long to load: ${url}. The site may be slow or blocking automated access.`);
        }
        if (error.message.includes('ERR_CONNECTION_REFUSED')) {
            throw new Error(`Connection refused for ${url}. The site may be down.`);
        }

        throw new Error(`Scan failed: ${error.message}`);
    } finally {
        if (page) await page.close().catch(() => null);
        if (context) await context.close().catch(() => null);
        if (browser) await browser.close().catch(() => null);
    }
}

module.exports = { scanUrl };
