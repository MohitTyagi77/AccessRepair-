/**
 * AccessRepair - useScan Hook
 * Manages scan state with SSE progress streaming
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { startScanSimple } from '../api/api';

export function useScan() {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState({ stage: '', message: '', progress: 0 });
    const [error, setError] = useState(null);

    const scan = useCallback(async (url) => {
        setIsScanning(true);
        setError(null);
        setProgress({ stage: 'LAUNCHING', message: 'Starting scan...', progress: 5 });

        try {
            // Try SSE streaming first, fallback to simple POST
            let result;
            try {
                const response = await fetch('/api/scan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/event-stream',
                    },
                    body: JSON.stringify({ url }),
                });

                if (!response.ok) {
                    const err = await response.json().catch(() => ({ error: 'Scan failed' }));
                    throw new Error(err.error || 'Scan failed');
                }

                const contentType = response.headers.get('content-type');

                if (contentType && contentType.includes('text/event-stream')) {
                    // Handle SSE stream
                    result = await new Promise((resolve, reject) => {
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        let buffer = '';

                        (async () => {
                            try {
                                while (true) {
                                    const { done, value } = await reader.read();
                                    if (done) break;

                                    buffer += decoder.decode(value, { stream: true });
                                    const lines = buffer.split('\n\n');
                                    buffer = lines.pop() || '';

                                    for (const line of lines) {
                                        if (!line.startsWith('data: ')) continue;
                                        const data = JSON.parse(line.slice(6));
                                        if (data.type === 'progress') {
                                            setProgress(data);
                                        } else if (data.type === 'result') {
                                            resolve(data.data);
                                        } else if (data.type === 'error') {
                                            reject(new Error(data.message));
                                        }
                                    }
                                }
                            } catch (e) {
                                reject(e);
                            }
                        })();
                    });
                } else {
                    result = await response.json();
                }
            } catch (sseErr) {
                // Fallback to simple request
                result = await startScanSimple(url);
            }

            setProgress({ stage: 'COMPLETE', message: 'Scan complete!', progress: 100 });
            // Navigate to dashboard
            navigate(`/dashboard/${result.id}`);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsScanning(false);
        }
    }, [navigate]);

    return { scan, isScanning, progress, error };
}
