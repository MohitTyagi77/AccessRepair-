import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function ScorePanel({ score, violations, url }) {
    const stats = useMemo(() => {
        if (!violations) return { critical: 0, serious: 0, moderate: 0, minor: 0, total: 0 };
        return {
            critical: violations.filter(v => v.severity === 'critical').length,
            serious: violations.filter(v => v.severity === 'serious').length,
            moderate: violations.filter(v => v.severity === 'moderate').length,
            minor: violations.filter(v => v.severity === 'minor').length,
            total: violations.length,
        };
    }, [violations]);

    // Score color
    const scoreColor = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--error)';
    const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'Needs Work' : 'Poor';

    // SVG circle math
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (score / 100) * circumference;

    return (
        <div>
            {/* Circular Score */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
                    <svg width="180" height="180" style={{ transform: 'rotate(-90deg)' }}>
                        {/* Background circle */}
                        <circle cx="90" cy="90" r={radius} stroke="var(--bg-card)" strokeWidth="10" fill="none" />
                        {/* Score circle */}
                        <circle
                            cx="90" cy="90" r={radius}
                            stroke={scoreColor}
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 1.5s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor }}>{score}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>/ 100</span>
                    </div>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    marginTop: '0.75rem', padding: '0.375rem 0.75rem',
                    background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`,
                    borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, color: scoreColor,
                }}>
                    {score >= 80 ? <TrendingUp size={14} /> : score >= 50 ? <Minus size={14} /> : <TrendingDown size={14} />}
                    {scoreLabel}
                </div>
            </div>

            {/* Severity Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Issues Found ({stats.total})
                </h3>

                {[
                    { label: 'Critical', count: stats.critical, color: 'var(--severity-critical)', icon: <AlertCircle size={14} /> },
                    { label: 'Serious', count: stats.serious, color: 'var(--severity-serious)', icon: <AlertTriangle size={14} /> },
                    { label: 'Moderate', count: stats.moderate, color: 'var(--severity-moderate)', icon: <Info size={14} /> },
                    { label: 'Minor', count: stats.minor, color: 'var(--severity-minor)', icon: <CheckCircle size={14} /> },
                ].map(item => (
                    <div
                        key={item.label}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.625rem 0.75rem', background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.color }}>
                            {item.icon}
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</span>
                        </div>
                        <span style={{
                            padding: '0.125rem 0.5rem', background: `${item.color}15`,
                            borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, color: item.color,
                        }}>
                            {item.count}
                        </span>
                    </div>
                ))}
            </div>

            {/* Scanned URL */}
            <div style={{ marginTop: '2rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Scanned URL</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', wordBreak: 'break-all' }}>{url}</p>
            </div>
        </div>
    );
}
