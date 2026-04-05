import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { getHistory } from '../api/api';

export default function TimelinePanel({ currentScanUrl }) {
    const historyQuery = useQuery({
        queryKey: ['history'],
        queryFn: getHistory,
    });

    const history = historyQuery.data || [];

    // Filter to same URL for trend and take last 20
    const urlHistory = history
        .filter(s => s.url === currentScanUrl)
        .slice(0, 20)
        .reverse();

    // All scan history for overview
    const allHistory = history.slice(0, 30).reverse();

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '0.75rem', fontSize: '0.85rem',
            }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ color: 'var(--accent-primary)' }}>Score: {payload[0]?.value}</p>
                {payload[0]?.payload?.url && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', maxWidth: '200px', wordBreak: 'break-all' }}>
                        {payload[0].payload.url}
                    </p>
                )}
            </div>
        );
    };

    if (historyQuery.isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                Loading history...
            </div>
        );
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                📈 Score Timeline
            </h2>

            {/* URL-specific Timeline */}
            {urlHistory.length > 1 ? (
                <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
                        Score History for this URL
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={urlHistory.map(s => ({
                            date: formatDate(s.createdAt),
                            time: formatTime(s.createdAt),
                            score: s.score,
                            url: s.url,
                        }))}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} />
                            <YAxis domain={[0, 100]} stroke="var(--text-muted)" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone" dataKey="score"
                                stroke="var(--accent-primary)" strokeWidth={2}
                                fill="url(#scoreGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div style={{
                    padding: '2rem', textAlign: 'center',
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)', marginBottom: '2rem',
                }}>
                    <Calendar size={32} style={{ margin: '0 auto 0.75rem', color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Scan this URL multiple times to see score trends over time.
                    </p>
                </div>
            )}

            {/* All Scans Overview */}
            {allHistory.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
                        Recent Scan History
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {history.slice(0, 10).map(scan => {
                            const scoreColor = scan.score >= 80 ? 'var(--success)' : scan.score >= 50 ? 'var(--warning)' : 'var(--error)';
                            return (
                                <div key={scan.id} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '0.75rem', background: 'var(--bg-card)',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                                }}>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {scan.url}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(scan.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span style={{
                                        fontSize: '1.1rem', fontWeight: 700, color: scoreColor,
                                        minWidth: '40px', textAlign: 'right',
                                    }}>
                                        {scan.score}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
