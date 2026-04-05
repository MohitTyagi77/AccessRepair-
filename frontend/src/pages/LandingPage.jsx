import { useState } from 'react';
import { Shield, Zap, Brain, Eye, ArrowRight, Sparkles, History } from 'lucide-react';
import { useScan } from '../hooks/useScan';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const [url, setUrl] = useState('');
    const { scan, isScanning, progress, error } = useScan();
    const navigate = useNavigate();

    const handleScan = async (e) => {
        e.preventDefault();
        if (!url.trim()) return;

        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = 'https://' + targetUrl;
        }

        try {
            await scan(targetUrl);
        } catch (err) {
            // Error handled in useScan
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background Orbs */}
            <div className="bg-orb bg-orb-1" />
            <div className="bg-orb bg-orb-2" />
            <div className="bg-orb bg-orb-3" />

            {/* Navigation */}
            <nav className="relative z-10" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Shield size={28} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }} className="gradient-text">AccessRepair</span>
                </div>
                <button
                    onClick={() => navigate('/dashboard/latest')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'var(--bg-card)',
                        border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem',
                        fontFamily: 'var(--font-sans)', transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <History size={16} />
                    Scan History
                </button>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10" style={{ maxWidth: '800px', margin: '0 auto', padding: '4rem 2rem 2rem', textAlign: 'center' }}>
                {/* Badge */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', marginBottom: '2rem' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 1rem', background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '9999px',
                        color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 500,
                    }}>
                        <Sparkles size={14} />
                        AI-Powered Accessibility Auditor
                    </span>
                </div>

                {/* Heading */}
                <h1 className="animate-fade-in-up" style={{ animationDelay: '0.2s', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
                    Fix Accessibility{' '}
                    <span className="gradient-text">Intelligently</span>
                </h1>

                <p className="animate-fade-in-up" style={{ animationDelay: '0.3s', fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                    Scan any website, detect violations, and get AI-generated fixes instantly.
                    Your copilot for WCAG compliance.
                </p>

                {/* URL Input Form */}
                <form onSubmit={handleScan} className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="glass-card animate-pulse-glow" style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem',
                        maxWidth: '600px', margin: '0 auto',
                    }}>
                        <input
                            id="url-input"
                            type="text"
                            placeholder="Enter website URL (e.g., example.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isScanning}
                            style={{
                                flex: 1, padding: '0.875rem 1rem', background: 'transparent',
                                border: 'none', outline: 'none', color: 'var(--text-primary)',
                                fontSize: '1rem', fontFamily: 'var(--font-sans)',
                            }}
                        />
                        <button
                            id="scan-button"
                            type="submit"
                            disabled={isScanning || !url.trim()}
                            className="btn-primary"
                            style={{ flexShrink: 0 }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isScanning ? (
                                    <>
                                        <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                        Scanning...
                                    </>
                                ) : (
                                    <>
                                        <Zap size={18} />
                                        Scan Website
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </form>

                {/* Progress Bar */}
                {isScanning && (
                    <div style={{ maxWidth: '600px', margin: '1.5rem auto 0' }} className="animate-fade-in-up">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{progress.message}</span>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{progress.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '4px', background: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${progress.progress}%`, height: '100%',
                                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                    borderRadius: '2px', transition: 'width 0.5s ease',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div style={{
                        maxWidth: '600px', margin: '1.5rem auto 0', padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)', color: 'var(--error)', fontSize: '0.9rem',
                    }}>
                        {error}
                    </div>
                )}

                {/* Features Grid */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.5rem', marginTop: '5rem',
                }}>
                    {[
                        { icon: <Shield size={24} />, title: 'Deep Scanning', desc: 'WCAG 2.1 AA compliance via Playwright + axe-core' },
                        { icon: <Brain size={24} />, title: 'AI Auto-Fix', desc: 'Gemini-powered HTML fixes with root cause analysis' },
                        { icon: <Zap size={24} />, title: 'Smart Priority', desc: 'Fix what matters most — ranked by severity & impact' },
                        { icon: <Eye size={24} />, title: 'User Simulation', desc: 'See your site through screen reader & low vision modes' },
                    ].map((feature, i) => (
                        <div
                            key={feature.title}
                            className="glass-card animate-fade-in-up"
                            style={{ animationDelay: `${0.5 + i * 0.1}s`, padding: '1.5rem', textAlign: 'left' }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--accent-primary)', marginBottom: '1rem',
                            }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            {/* Footer */}
            <footer style={{
                position: 'relative', zIndex: 10, textAlign: 'center', padding: '3rem 2rem',
                color: 'var(--text-muted)', fontSize: '0.8rem',
            }}>
                AccessRepair © {new Date().getFullYear()} — AI-powered accessibility for everyone
            </footer>
        </div>
    );
}
