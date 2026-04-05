import { Users, Search, AlertTriangle, Target } from 'lucide-react';

export default function InsightsPanel({ violation, violations }) {
    if (!violation) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <Search size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>Select a violation to see AI insights.</p>
            </div>
        );
    }

    // Find similar violations (same ruleId)
    const similar = violations?.filter(v => v.ruleId === violation.ruleId && v.id !== violation.id) || [];

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                🧠 AI Insights
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {/* Root Cause */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Target size={18} style={{ color: 'var(--error)' }} />
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Root Cause</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {violation.rootCause || 'Root cause analysis not available — configure AI API key.'}
                    </p>
                </div>

                {/* Affected Users */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Users size={18} style={{ color: 'var(--warning)' }} />
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Affected Users</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {violation.affectedUsers || 'Unable to determine affected users without AI analysis.'}
                    </p>
                </div>

                {/* Explanation */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <AlertTriangle size={18} style={{ color: 'var(--accent-primary)' }} />
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>What Went Wrong</h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {violation.explanation || violation.description}
                    </p>
                </div>
            </div>

            {/* Similar Violations */}
            {similar.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                        🔗 Similar Issues ({similar.length})
                        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                            Fix once, apply everywhere
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {similar.slice(0, 5).map(v => (
                            <div key={v.id} style={{
                                padding: '0.75rem', background: 'var(--bg-card)',
                                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                fontSize: '0.85rem', color: 'var(--text-secondary)',
                            }}>
                                <code style={{ color: 'var(--accent-primary)', fontSize: '0.8rem' }}>{v.selector}</code>
                            </div>
                        ))}
                        {similar.length > 5 && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
                                ...and {similar.length - 5} more
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Violation Details */}
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                    Technical Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.375rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Rule ID:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{violation.ruleId}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Severity:</span>
                    <span className={`severity-badge severity-${violation.severity}`} style={{ width: 'fit-content' }}>{violation.severity}</span>
                    <span style={{ color: 'var(--text-muted)' }}>Priority:</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{Math.round(violation.priorityScore)}/100</span>
                    <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
                    <span style={{ color: violation.confidence > 0.7 ? 'var(--success)' : 'var(--warning)' }}>
                        {Math.round(violation.confidence * 100)}%
                    </span>
                    {violation.helpUrl && (
                        <>
                            <span style={{ color: 'var(--text-muted)' }}>Learn more:</span>
                            <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>
                                axe-core docs ↗
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
