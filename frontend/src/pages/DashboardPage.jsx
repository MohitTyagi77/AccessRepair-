import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Shield, ArrowLeft, Download } from 'lucide-react';
import { getScan, getHistory } from '../api/api';
import ScorePanel from '../components/ScorePanel';
import ViolationList from '../components/ViolationList';
import RepairPanel from '../components/RepairPanel';
import InsightsPanel from '../components/InsightsPanel';
import SimulationPanel from '../components/SimulationPanel';
import TimelinePanel from '../components/TimelinePanel';
import ChatPanel from '../components/ChatPanel';

export default function DashboardPage() {
    const { scanId } = useParams();
    const navigate = useNavigate();
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [activeTab, setActiveTab] = useState('violations');

    // Get latest scan if 'latest' is requested
    const historyQuery = useQuery({
        queryKey: ['history'],
        queryFn: getHistory,
        enabled: scanId === 'latest',
    });

    const resolvedId = scanId === 'latest'
        ? historyQuery.data?.[0]?.id
        : parseInt(scanId);

    const scanQuery = useQuery({
        queryKey: ['scan', resolvedId],
        queryFn: () => getScan(resolvedId),
        enabled: !!resolvedId,
    });

    const scan = scanQuery.data;

    // Auto-select first violation
    useEffect(() => {
        if (scan?.violations?.length > 0 && !selectedViolation) {
            setSelectedViolation(scan.violations[0]);
        }
    }, [scan, selectedViolation]);

    // Handle no data
    if (scanId === 'latest' && historyQuery.isSuccess && (!historyQuery.data || historyQuery.data.length === 0)) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No scans yet. Go scan a website!</p>
                <Link to="/" className="btn-primary"><span>← Back to Scanner</span></Link>
            </div>
        );
    }

    if (scanQuery.isLoading || historyQuery.isLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid var(--bg-card)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-secondary)' }}>Loading scan results...</p>
                </div>
            </div>
        );
    }

    if (scanQuery.isError) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <p style={{ color: 'var(--error)' }}>Failed to load scan results.</p>
                <Link to="/" className="btn-primary"><span>← Back to Scanner</span></Link>
            </div>
        );
    }

    if (!scan) return null;

    // Build scan context for AI chat
    const scanContext = {
        url: scan.url,
        score: scan.score,
        violationCount: scan.violations?.length || 0,
        critical: scan.violations?.filter(v => v.severity === 'critical').length || 0,
        serious: scan.violations?.filter(v => v.severity === 'serious').length || 0,
        moderate: scan.violations?.filter(v => v.severity === 'moderate').length || 0,
        minor: scan.violations?.filter(v => v.severity === 'minor').length || 0,
    };

    const tabs = [
        { id: 'violations', label: 'Violations' },
        { id: 'repair', label: 'Repair' },
        { id: 'insights', label: 'AI Insights' },
        { id: 'simulation', label: 'Simulation' },
        { id: 'timeline', label: 'Timeline' },
        { id: 'chat', label: 'AI Chat' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
            {/* Top Bar */}
            <header style={{
                padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'var(--font-sans)',
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div style={{ width: '1px', height: '24px', background: 'var(--border)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={20} style={{ color: 'var(--accent-primary)' }} />
                        <span style={{ fontWeight: 600 }} className="gradient-text">AccessRepair</span>
                    </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Scanned:</span>{' '}
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{scan.url}</span>
                </div>
            </header>

            <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)' }}>
                {/* Score Sidebar */}
                <aside style={{
                    width: '280px', padding: '1.5rem', borderRight: '1px solid var(--border)',
                    background: 'var(--bg-secondary)', flexShrink: 0, overflowY: 'auto',
                }}>
                    <ScorePanel score={scan.score} violations={scan.violations} url={scan.url} />
                </aside>

                {/* Main Content */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tab Navigation */}
                    <div style={{
                        display: 'flex', gap: '0', borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-secondary)', padding: '0 1.5rem',
                    }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
                        {activeTab === 'violations' && (
                            <ViolationList
                                violations={scan.violations}
                                selected={selectedViolation}
                                onSelect={(v) => {
                                    setSelectedViolation(v);
                                    setActiveTab('repair');
                                }}
                            />
                        )}

                        {activeTab === 'repair' && (
                            <RepairPanel violation={selectedViolation} />
                        )}

                        {activeTab === 'insights' && (
                            <InsightsPanel violation={selectedViolation} violations={scan.violations} />
                        )}

                        {activeTab === 'simulation' && (
                            <SimulationPanel url={scan.url} violations={scan.violations} />
                        )}

                        {activeTab === 'timeline' && (
                            <TimelinePanel currentScanUrl={scan.url} />
                        )}

                        {activeTab === 'chat' && (
                            <ChatPanel scanContext={scanContext} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
