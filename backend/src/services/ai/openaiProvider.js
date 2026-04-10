/**
 * AccessRepair - OpenAI Provider
 * Supports GPT-4o, GPT-4, GPT-3.5-turbo via OpenAI API
 *
 * Requires: npm install openai
 * Env vars: OPENAI_API_KEY, OPENAI_MODEL (default: gpt-4o)
 */
const { AIProvider, withTimeout } = require('./aiProvider');

class OpenAIProvider extends AIProvider {
    constructor() {
        super();
        this.apiKey = process.env.OPENAI_API_KEY;
        this.model = process.env.OPENAI_MODEL || 'gpt-4o';
        this.client = null;

        if (this.apiKey) {
            try {
                const OpenAI = require('openai');
                this.client = new OpenAI({ apiKey: this.apiKey });
            } catch (err) {
                console.warn('⚠️  openai package not installed. Run: npm install openai');
            }
        } else {
            console.warn('⚠️  OPENAI_API_KEY not set — OpenAI provider unavailable');
        }
    }

    async generateFixes(violations) {
        if (!this.client || violations.length === 0) {
            return this._placeholderFixes(violations);
        }

        try {
            const prompt = this.buildFixPrompt(violations);

            const completion = await withTimeout(this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: 'You are an expert web accessibility specialist. Return only valid JSON.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.3,
                max_tokens: 4096,
            }), 30000, 'OpenAI fix generation');

            const responseText = completion.choices[0]?.message?.content || '[]';
            return this.parseFixes(responseText, violations.length);
        } catch (error) {
            console.error('OpenAI fix generation error:', error.message);
            return this._placeholderFixes(violations);
        }
    }

    async chat(messages, scanContext = null) {
        if (!this.client) {
            return 'OpenAI chat is not available. Please set OPENAI_API_KEY and install the openai package.';
        }

        try {
            const systemPrompt = this.buildChatSystemPrompt(scanContext);

            const completion = await withTimeout(this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages.map(m => ({ role: m.role, content: m.content })),
                ],
                temperature: 0.7,
                max_tokens: 2048,
            }), 30000, 'OpenAI chat');

            return completion.choices[0]?.message?.content || 'No response generated.';
        } catch (error) {
            console.error('OpenAI chat error:', error.message);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }

    _placeholderFixes(violations) {
        return violations.map(v => ({
            fixedHtml: v.html,
            explanation: 'AI fix unavailable — configure OPENAI_API_KEY to enable.',
            confidence: 0,
            rootCause: v.description,
            affectedUsers: 'Unable to determine without AI analysis',
        }));
    }
}

module.exports = OpenAIProvider;
