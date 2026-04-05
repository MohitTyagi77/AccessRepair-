import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../api/api';

export default function ChatPanel({ scanContext }) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm your AccessRepair AI assistant. I can help you understand and fix the accessibility issues found on **${scanContext?.url || 'your website'}**.\n\nTry asking me:\n• "What are the most critical issues?"\n• "How do I fix the button accessibility?"\n• "Explain WCAG 2.1 AA compliance"\n• "Fix all form labels"`,
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Build message history for API (exclude initial greeting)
            const chatHistory = [...messages.slice(1), userMessage]
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }));

            const reply = await sendChatMessage(chatHistory, scanContext);
            setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sorry, I encountered an error: ${error.message}. Make sure the AI API key is configured.`,
            }]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    // Quick action buttons
    const quickActions = [
        'What are the most critical issues?',
        'How do I improve my score?',
        'Explain the top violation',
        'Generate fix for all buttons',
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxHeight: '700px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>AI Chat Assistant</h2>
            </div>

            {/* Messages Area */}
            <div style={{
                flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem',
                padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)', marginBottom: '1rem',
            }}>
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex', gap: '0.75rem',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            animation: 'slideIn 0.3s ease',
                        }}
                    >
                        {/* Avatar */}
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                                : 'var(--bg-secondary)',
                            border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                        }}>
                            {msg.role === 'user' ? <User size={16} color="white" /> : <Bot size={16} style={{ color: 'var(--accent-primary)' }} />}
                        </div>

                        {/* Message Bubble */}
                        <div style={{
                            maxWidth: '75%', padding: '0.875rem 1rem',
                            background: msg.role === 'user' ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-secondary)',
                            borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                            color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                            fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div style={{ display: 'flex', gap: '0.75rem', animation: 'slideIn 0.3s ease' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        }}>
                            <Bot size={16} style={{ color: 'var(--accent-primary)' }} />
                        </div>
                        <div style={{
                            padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '1rem 1rem 1rem 0.25rem',
                            display: 'flex', gap: '0.375rem', alignItems: 'center',
                        }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: 'var(--accent-primary)',
                                    animation: `pulse-glow 1s ease-in-out ${i * 0.2}s infinite`,
                                    opacity: 0.5,
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div style={{
                    display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap',
                }}>
                    {quickActions.map(action => (
                        <button
                            key={action}
                            onClick={() => {
                                setInput(action);
                                inputRef.current?.focus();
                            }}
                            style={{
                                padding: '0.375rem 0.75rem', background: 'var(--bg-card)',
                                border: '1px solid var(--border)', borderRadius: '9999px',
                                color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
                                fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.color = 'var(--accent-primary)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                            }}
                        >
                            {action}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <form onSubmit={handleSend} style={{
                display: 'flex', gap: '0.75rem', padding: '0.5rem',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
            }}>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about accessibility issues..."
                    disabled={isLoading}
                    style={{
                        flex: 1, padding: '0.75rem', background: 'transparent',
                        border: 'none', outline: 'none', color: 'var(--text-primary)',
                        fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
                    }}
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    style={{
                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: input.trim() ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'var(--bg-secondary)',
                        border: 'none', borderRadius: 'var(--radius-md)', cursor: input.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Send size={18} color={input.trim() ? 'white' : 'var(--text-muted)'} />
                </button>
            </form>
        </div>
    );
}
