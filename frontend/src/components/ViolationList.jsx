import { useMemo } from 'react';
import { ChevronRight, AlertCircle, AlertTriangle, Info, CircleDot } from 'lucide-react';

const severityIcons = {
    critical: <AlertCircle size={16} />,
    serious: <AlertTriangle size={16} />,
    moderate: <Info size={16} />,
    minor: <CircleDot size={16} />,
};

const severityOrder = ['critical', 'serious', 'moderate', 'minor'];

export default function ViolationList({ violations, selected, onSelect }) {
    const grouped = useMemo(() => {
        if (!violations) return {};
        const groups = {};
        for (const v of violations) {
            const sev = v.severity || 'minor';
            if (!groups[sev]) groups[sev] = [];
            groups[sev].push(v);
        }
        return groups;
    }, [violations]);

    if (!violations || violations.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>🎉 No violations found!</p>
                <p style={{ fontSize: '0.9rem' }}>This page has great accessibility.</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    Accessibility Violations
                    <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                        ({violations.length} issues)
                    </span>
                </h2>
            </div>

            {severityOrder.map(severity => {
                const items = grouped[severity];
                if (!items || items.length === 0) return null;

                return (
                    <div key={severity} style={{ marginBottom: '1.5rem' }}>
                        {/* Severity Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem',
                            padding: '0.5rem 0',
                        }}>
                            <span className={`severity-badge severity-${severity}`}>
                                {severityIcons[severity]}
                                <span style={{ marginLeft: '0.375rem' }}>{severity}</span>
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                ({items.length} {items.length === 1 ? 'issue' : 'issues'})
                            </span>
                        </div>

                        {/* Violation Cards */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {items.map((violation) => {
                                const isSelected = selected?.id === violation.id;
                                return (
                                    <button
                                        key={violation.id}
                                        onClick={() => onSelect(violation)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                                            width: '100%', textAlign: 'left', padding: '0.875rem 1rem',
                                            background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                                            border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                                            borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                            transition: 'all 0.2s ease', fontFamily: 'var(--font-sans)',
                                            color: 'var(--text-primary)',
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-hover)';
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                                                {violation.description}
                                            </p>
                                            <p style={{
                                                fontSize: '0.8rem', color: 'var(--text-muted)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                maxWidth: '500px',
                                            }}>
                                                {violation.selector}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                            <span style={{
                                                fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600,
                                                padding: '0.125rem 0.5rem', background: 'rgba(99, 102, 241, 0.1)',
                                                borderRadius: '9999px',
                                            }}>
                                                P{Math.round(violation.priorityScore)}
                                            </span>
                                            <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
