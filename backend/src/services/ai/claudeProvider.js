/**
 * AccessRepair - Claude (Anthropic) Provider
 * Supports Claude 3.5 Sonnet, Claude 3 Opus, etc.
 *
 * Requires: npm install @anthropic-ai/sdk
 * Env vars: ANTHROPIC_API_KEY, CLAUDE_MODEL (default: claude-sonnet-4-20250514)
 */
const { AIProvider, withTimeout } = require('./aiProvider');

class ClaudeProvider extends AIProvider {
    constructor() {
        super();
        this.apiKey = process.env.ANTHROPIC_API_KEY;
        this.model = process.env.CLAUDE_MODEL || 'claude-sonnet-4-20250514';
        this.client = null;

        if (this.apiKey) {
            try {
                const Anthropic = require('@anthropic-ai/sdk');
                this.client = new Anthropic({ apiKey: this.apiKey });
            } catch (err) {
                console.warn('⚠️  @anthropic-ai/sdk package not installed. Run: npm install @anthropic-ai/sdk');
            }
        } else {
            console.warn('⚠️  ANTHROPIC_API_KEY not set — Claude provider unavailable');
        }
    }

    async generateFixes(violations) {
        if (!this.client || violations.length === 0) {
            return this._placeholderFixes(violations);
        }

        try {
            const prompt = this.buildFixPrompt(violations);

            const message = await withTimeout(this.client.messages.create({
                model: this.model,
                max_tokens: 4096,
                system: 'You are an expert web accessibility specialist. Return only valid JSON.',
                messages: [{ role: 'user', content: prompt }],
            }), 30000, 'Claude fix generation');

            const responseText = message.content[0]?.text || '[]';
            return this.parseFixes(responseText, violations.length);
        } catch (error) {
            console.error('Claude fix generation error:', error.message);
            return this._placeholderFixes(violations);
        }
    }

    async chat(messages, scanContext = null) {
        if (!this.client) {
            return 'Claude chat is not available. Please set ANTHROPIC_API_KEY and install @anthropic-ai/sdk.';
        }

        try {
            const systemPrompt = this.buildChatSystemPrompt(scanContext);

            const message = await withTimeout(this.client.messages.create({
                model: this.model,
                max_tokens: 2048,
                system: systemPrompt,
                messages: messages.map(m => ({ role: m.role, content: m.content })),
            }), 30000, 'Claude chat');

            return message.content[0]?.text || 'No response generated.';
        } catch (error) {
            console.error('Claude chat error:', error.message);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }

    _placeholderFixes(violations) {
        return violations.map(v => ({
            fixedHtml: v.html,
            explanation: 'AI fix unavailable — configure ANTHROPIC_API_KEY to enable.',
            confidence: 0,
            rootCause: v.description,
            affectedUsers: 'Unable to determine without AI analysis',
        }));
    }
}

module.exports = ClaudeProvider;
