/**
 * AccessRepair - AI Provider Interface (Adapter Layer)
 *
 * Abstract provider that all AI backends must implement.
 * Supports: Gemini, OpenAI, Claude — switchable via AI_PROVIDER env var.
 */

class AIProvider {
    /**
     * Generate accessibility fixes for violations
     * @param {Array<{description: string, html: string, selector: string}>} violations
     * @returns {Promise<Array<{fixedHtml: string, explanation: string, confidence: number, rootCause: string, affectedUsers: string}>>}
     */
    async generateFixes(violations) {
        throw new Error('generateFixes() must be implemented by provider');
    }

    /**
     * Chat with AI about accessibility issues
     * @param {Array<{role: string, content: string}>} messages - Chat history
     * @param {Object|null} scanContext - Current scan results for context
     * @returns {Promise<string>} - AI response text
     */
    async chat(messages, scanContext = null) {
        throw new Error('chat() must be implemented by provider');
    }

    /**
     * Build the system prompt for fix generation
     * @param {Array} violations
     * @returns {string}
     */
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
        } catch (e) {
            console.error('Failed to read basePrompt.txt:', e.message);
            // Fallback
            basePrompt = `You are an expert... Violations:\n{{VIOLATIONS}}`;
        }

        return basePrompt.replace('{{VIOLATIONS}}', violationDescriptions);
    }

    /**
     * Build the system prompt for chat
     * @param {Object|null} scanContext
     * @returns {string}
     */
    buildChatSystemPrompt(scanContext) {
        let prompt = `You are AccessRepair AI, an expert accessibility assistant. Help users understand and fix web accessibility issues. Be concise and actionable.`;

        if (scanContext) {
            prompt += `\n\nCurrent scan context:
- URL: ${scanContext.url}
- Score: ${scanContext.score}/100
- Total violations: ${scanContext.violationCount}
- Critical: ${scanContext.critical}, Serious: ${scanContext.serious}, Moderate: ${scanContext.moderate}, Minor: ${scanContext.minor}`;
        }

        return prompt;
    }

    /**
     * Parse the AI fix response into structured data
     * @param {string} responseText
     * @param {number} expectedCount
     * @returns {Array}
     */
    parseFixes(responseText, expectedCount) {
        try {
            // Strip markdown code fences if present
            let cleaned = responseText.trim();
            cleaned = cleaned.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '');

            const parsed = JSON.parse(cleaned);
            const fixes = Array.isArray(parsed) ? parsed : [parsed];

            return fixes.map(fix => ({
                fixedHtml: fix.fixedHtml || fix.fixed_html || '',
                explanation: fix.explanation || '',
                confidence: Math.max(0, Math.min(1, parseFloat(fix.confidence) || 0.5)),
                rootCause: fix.rootCause || fix.root_cause || 'Unknown',
                affectedUsers: fix.affectedUsers || fix.affected_users || 'General users',
            }));
        } catch (err) {
            console.warn('Failed to parse AI fix response:', err.message);
            // Return empty fixes for each violation
            return Array.from({ length: expectedCount }, () => ({
                fixedHtml: '',
                explanation: 'AI could not generate a fix for this violation.',
                confidence: 0,
                rootCause: 'Parse error',
                affectedUsers: 'Unknown',
            }));
        }
    }
}

/**
 * Factory: get the configured AI provider instance
 * Set AI_PROVIDER env var to: 'gemini' (default), 'openai', or 'claude'
 */
function getAIProvider() {
    const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    switch (providerName) {
        case 'openai':
            const OpenAIProvider = require('./openaiProvider');
            return new OpenAIProvider();
        case 'claude':
            const ClaudeProvider = require('./claudeProvider');
            return new ClaudeProvider();
        case 'gemini':
        default:
            const GeminiProvider = require('./geminiProvider');
            return new GeminiProvider();
    }
}

module.exports = { AIProvider, getAIProvider };
