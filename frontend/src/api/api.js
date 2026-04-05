/**
 * AccessRepair - API Client
 */
const API_BASE = '/api';

/**
 * Start a scan with SSE streaming for progress updates
 * @param {string} url - URL to scan
 * @param {function} onProgress - Progress callback ({stage, message, progress})
 * @returns {Promise<Object>} - Scan result
 */
export async function startScan(url, onProgress = () => { }) {
    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`${API_BASE}/scan?url=${encodeURIComponent(url)}`);

        // Use fetch with SSE for POST requests
        fetch(`${API_BASE}/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
            },
            body: JSON.stringify({ url }),
        })
            .then(async (response) => {
                if (!response.ok) {
                    const err = await response.json().catch(() => ({ error: 'Scan failed' }));
                    throw new Error(err.error || 'Scan failed');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (!line.startsWith('data: ')) continue;
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'progress') {
                                onProgress(data);
                            } else if (data.type === 'result') {
                                resolve(data.data);
                            } else if (data.type === 'error') {
                                reject(new Error(data.message));
                            }
                        } catch (e) {
                            // Skip malformed SSE data
                        }
                    }
                }
            })
            .catch(reject);
    });
}

/**
 * Start a scan without SSE (simple POST)
 */
export async function startScanSimple(url) {
    const response = await fetch(`${API_BASE}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Scan failed' }));
        throw new Error(err.error || 'Scan failed');
    }

    return response.json();
}

/**
 * Get scan history
 */
export async function getHistory() {
    const response = await fetch(`${API_BASE}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
}

/**
 * Get a specific scan by ID
 */
export async function getScan(id) {
    const response = await fetch(`${API_BASE}/scan/${id}`);
    if (!response.ok) throw new Error('Failed to fetch scan');
    return response.json();
}

/**
 * Send a chat message
 */
export async function sendChatMessage(messages, scanContext = null) {
    const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, scanContext }),
    });

    if (!response.ok) throw new Error('Chat failed');
    const data = await response.json();
    return data.reply;
}
