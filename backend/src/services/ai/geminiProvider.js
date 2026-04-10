/**
 * AccessRepair - Gemini AI Provider
 * Uses Google's Generative AI SDK (@google/generative-ai)
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { AIProvider, withTimeout } = require('./aiProvider');

// Simple in-memory cache for AI responses
const fixCache = new Map();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

async function retryWithBackoff(fn, retries = 5, baseDelay = 10000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (error.status === 429 || error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Retry')) {
                const delay = baseDelay * Math.pow(2, i);
                console.log(`\n    ⏳ API Rate limit hit. Retrying in ${delay / 1000}s...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                throw error;
            }
        }
    }
    throw new Error('Max retries exceeded for API call');
}

class GeminiProvider extends AIProvider {
    constructor() {
        super();
        this.apiKey = process.env.GEMINI_API_KEY;
        this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

        if (this.apiKey && this.apiKey !== 'your_gemini_api_key_here') {
            this.genAI = new GoogleGenerativeAI(this.apiKey);
        } else {
            this.genAI = null;
            console.warn('⚠️  GEMINI_API_KEY not set — AI features will return placeholder responses');
        }
    }

    /**
     * Generate fixes for accessibility violations using Gemini
     */
    async generateFixes(violations) {
        if (!this.genAI || violations.length === 0) {
            return this._placeholderFixes(violations);
        }

        // Check cache (skip if in QA mode)
        const cacheKey = violations.map(v => `${v.description}|${v.html}`).join('::');
        if (process.env.QA_MODE !== 'true') {
            const cached = fixCache.get(cacheKey);
            if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
                return cached.data;
            }
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const prompt = this.buildFixPrompt(violations);

            const result = await withTimeout(retryWithBackoff(() => model.generateContent(prompt)), 45000, 'Gemini fix generation');
            const responseText = result.response.text();
            const fixes = this.parseFixes(responseText, violations.length);

            // Cache the result
            fixCache.set(cacheKey, { data: fixes, timestamp: Date.now() });

            return fixes;
        } catch (error) {
            console.error('Gemini fix generation error:', error.message);
            return this._placeholderFixes(violations, `AI Generation failed: ${error.message}`);
        }
    }

    /**
     * Chat about accessibility using Gemini
     */
    async chat(messages, scanContext = null) {
        if (!this.genAI) {
            return 'AI chat is not available. Please set the GEMINI_API_KEY environment variable.';
        }

        try {
            const model = this.genAI.getGenerativeModel({ model: this.model });
            const systemPrompt = this.buildChatSystemPrompt(scanContext);

            // Build chat history for Gemini format
            const chatHistory = messages.slice(0, -1).map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

            const chat = model.startChat({
                history: chatHistory,
                systemInstruction: systemPrompt,
            });

            const lastMessage = messages[messages.length - 1];
            const result = await withTimeout(retryWithBackoff(() => chat.sendMessage(lastMessage.content)), 45000, 'Gemini chat');
            return result.response.text();
        } catch (error) {
            console.error('Gemini chat error:', error.message);
            return `Sorry, I encountered an error: ${error.message}`;
        }
    }

    /** Return placeholder fixes when API is unavailable or an error occurs */
    _placeholderFixes(violations, errorMessage = 'AI fix unavailable — configure GEMINI_API_KEY to enable.') {
        return violations.map(v => ({
            fixedHtml: v.html,
            explanation: errorMessage,
            confidence: 0,
            rootCause: v.description,
            affectedUsers: 'Unable to determine without AI analysis',
        }));
    }
}

module.exports = GeminiProvider;
