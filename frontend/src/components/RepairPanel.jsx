import { useState } from 'react';
import { Copy, Check, Wrench } from 'lucide-react';

export default function RepairPanel({ violation }) {
    const [copied, setCopied] = useState(false);

    if (!violation) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <Wrench size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Select a violation from the Violations tab to see the repair view.</p>
            </div>
        );
    }

    const hasAiFix = violation.fixedHtml && violation.fixedHtml.length > 0 && violation.confidence > 0;

    const handleCopy = async () => {
        if (!violation.fixedHtml) return;
        try {
            await navigator.clipboard.writeText(violation.fixedHtml);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = violation.fixedHtml;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const confidencePercent = Math.round((violation.confidence || 0) * 100);
    const confidenceColor = confidencePercent >= 80 ? 'var(--success)' : confidencePercent >= 50 ? 'var(--warning)' : 'var(--error)';

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    <Wrench size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                    Repair View
                </h2>
                {hasAiFix && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{
                            fontSize: '0.8rem', fontWeight: 600, color: confidenceColor,
                            padding: '0.25rem 0.75rem', background: `${confidenceColor}15`,
                            border: `1px solid ${confidenceColor}30`, borderRadius: '9999px',
                        }}>
                            {confidencePercent}% confidence
                        </span>
                    </div>
                )}
            </div>

            {/* Description */}
            <div style={{
                padding: '0.75rem 1rem', marginBottom: '1.5rem',
                background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
            }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{violation.description}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Selector: <code style={{ color: 'var(--accent-primary)' }}>{violation.selector}</code>
                </p>
            </div>

            {/* Split View */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Broken HTML (Left) */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--error)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--error)' }}>Original (Broken)</span>
                    </div>
                    <div className="code-block code-broken" style={{ minHeight: '200px' }}>
                        {violation.html || 'No HTML snippet available'}
                    </div>
                </div>

                {/* Fixed HTML (Right) */}
                <div>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--success)' }}>Fixed (AI-Generated)</span>
                        </div>
                        {hasAiFix && (
                            <button
                                onClick={handleCopy}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.375rem 0.75rem', background: 'var(--bg-card)',
                                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                                    color: copied ? 'var(--success)' : 'var(--text-secondary)',
                                    cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'var(--font-sans)',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        )}
                    </div>
                    <div className="code-block code-fixed" style={{ minHeight: '200px' }}>
                        {hasAiFix ? violation.fixedHtml : 'AI fix not available — configure API key to enable'}
                    </div>
                </div>
            </div>

            {/* Explanation */}
            {violation.explanation && (
                <div style={{
                    marginTop: '1.5rem', padding: '1rem',
                    background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: 'var(--radius-md)',
                }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                        💡 Explanation
                    </h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {violation.explanation}
                    </p>
                </div>
            )}
        </div>
    );
}
