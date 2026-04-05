import { useState } from 'react';
import { Eye, EyeOff, Monitor, Keyboard, Palette } from 'lucide-react';

const SIMULATION_MODES = [
    {
        id: 'none',
        label: 'Normal View',
        icon: <Monitor size={18} />,
        description: 'Standard rendering',
        filter: '',
    },
    {
        id: 'screen-reader',
        label: 'Screen Reader',
        icon: <EyeOff size={18} />,
        description: 'Text-only rendering — simulates what a screen reader user hears',
        filter: 'screen-reader',
    },
    {
        id: 'low-vision',
        label: 'Low Vision',
        icon: <Eye size={18} />,
        description: 'Blurred rendering — simulates users with visual impairments',
        filter: 'blur(3px)',
    },
    {
        id: 'protanopia',
        label: 'Protanopia',
        icon: <Palette size={18} />,
        description: 'Red-blind color vision deficiency',
        filter: 'url(#protanopia)',
    },
    {
        id: 'deuteranopia',
        label: 'Deuteranopia',
        icon: <Palette size={18} />,
        description: 'Green-blind color vision deficiency',
        filter: 'url(#deuteranopia)',
    },
    {
        id: 'tritanopia',
        label: 'Tritanopia',
        icon: <Palette size={18} />,
        description: 'Blue-blind color vision deficiency',
        filter: 'url(#tritanopia)',
    },
    {
        id: 'keyboard',
        label: 'Keyboard Navigation',
        icon: <Keyboard size={18} />,
        description: 'Highlights interactive elements and tab order',
        filter: 'keyboard',
    },
];

export default function SimulationPanel({ url, violations }) {
    const [activeMode, setActiveMode] = useState('none');

    // Build a simplified DOM representation for simulation
    const renderSimulatedContent = () => {
        if (activeMode === 'screen-reader') {
            return (
                <div style={{ padding: '1.5rem', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: 2, color: 'var(--text-primary)' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        🔊 Screen Reader Simulation — This shows what your content reads like to assistive technology:
                    </p>
                    <div style={{ borderLeft: '3px solid var(--accent-primary)', paddingLeft: '1rem' }}>
                        <p style={{ marginBottom: '0.5rem' }}>[Page: {url}]</p>
                        {violations?.slice(0, 10).map((v, i) => (
                            <div key={i} style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-sm)' }}>
                                <p style={{ color: 'var(--error)', fontSize: '0.8rem' }}>⚠ Issue: {v.description}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Element: {v.selector}</p>
                                {v.severity === 'critical' && (
                                    <p style={{ color: 'var(--severity-critical)', fontSize: '0.8rem' }}>🚫 This element would be invisible or confusing to screen reader users</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeMode === 'keyboard') {
            return (
                <div style={{ padding: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                        ⌨️ Keyboard Navigation — Interactive elements and their tab order:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {violations?.filter(v => {
                            const tag = v.html.match(/^<(\w+)/)?.[1]?.toLowerCase() || '';
                            return ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
                        }).slice(0, 15).map((v, i) => {
                            const tag = v.html.match(/^<(\w+)/)?.[1] || 'element';
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.75rem', background: 'var(--bg-card)',
                                    border: '2px dashed var(--accent-primary)', borderRadius: 'var(--radius-sm)',
                                }}>
                                    <span style={{
                                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--accent-primary)', color: 'white', borderRadius: '50%',
                                        fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                    }}>
                                        {i + 1}
                                    </span>
                                    <div>
                                        <code style={{ fontSize: '0.85rem', color: 'var(--accent-primary)' }}>&lt;{tag}&gt;</code>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{v.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {violations?.filter(v => {
                            const tag = v.html.match(/^<(\w+)/)?.[1]?.toLowerCase() || '';
                            return ['button', 'a', 'input', 'select', 'textarea'].includes(tag);
                        }).length === 0 && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    No interactive element violations found.
                                </p>
                            )}
                    </div>
                </div>
            );
        }

        // Visual simulation modes (low vision, color blindness)
        const filterStyle = {};
        if (activeMode === 'low-vision') {
            filterStyle.filter = 'blur(3px)';
        }

        return (
            <div style={{ ...filterStyle, padding: '1.5rem' }}>
                <div style={{
                    padding: '1.5rem', background: 'white', borderRadius: 'var(--radius-md)',
                    color: '#333', minHeight: '300px',
                }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111' }}>
                        Simulated Page Preview
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#555', lineHeight: 1.6 }}>
                        This is a simplified preview of the scanned page with the {SIMULATION_MODES.find(m => m.id === activeMode)?.label} filter applied.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <button style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px' }}>Button</button>
                        <input placeholder="Text input" style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', borderRadius: '6px' }} />
                        <a href="#" style={{ color: '#6366f1', textDecoration: 'underline', alignSelf: 'center' }}>Sample Link</a>
                    </div>
                    <img
                        alt=""
                        style={{ width: '200px', height: '100px', background: '#e5e7eb', borderRadius: '6px', display: 'block', objectFit: 'cover' }}
                    />
                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#999' }}>
                        ↑ Image without alt text (accessibility violation)
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                👁️ Accessibility Simulation
            </h2>

            {/* SVG Color Blindness Filters */}
            <svg style={{ position: 'absolute', width: 0, height: 0 }}>
                <defs>
                    <filter id="protanopia">
                        <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="deuteranopia">
                        <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                    <filter id="tritanopia">
                        <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" />
                    </filter>
                </defs>
            </svg>

            {/* Mode Selector */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '0.75rem', marginBottom: '1.5rem',
            }}>
                {SIMULATION_MODES.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => setActiveMode(mode.id)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            padding: '1rem', background: activeMode === mode.id ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                            border: activeMode === mode.id ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)', cursor: 'pointer',
                            color: activeMode === mode.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            transition: 'all 0.2s ease', fontFamily: 'var(--font-sans)',
                        }}
                    >
                        {mode.icon}
                        <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{mode.label}</span>
                    </button>
                ))}
            </div>

            {/* Description */}
            <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem',
                padding: '0.5rem 0.75rem', background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
            }}>
                {SIMULATION_MODES.find(m => m.id === activeMode)?.description}
            </p>

            {/* Simulated Content */}
            <div style={{
                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                overflow: 'hidden', background: 'var(--bg-card)',
                ...(activeMode !== 'none' && activeMode !== 'screen-reader' && activeMode !== 'keyboard'
                    ? { filter: SIMULATION_MODES.find(m => m.id === activeMode)?.filter === 'blur(3px)' ? 'blur(3px)' : SIMULATION_MODES.find(m => m.id === activeMode)?.filter }
                    : {}),
            }}>
                {renderSimulatedContent()}
            </div>
        </div>
    );
}
