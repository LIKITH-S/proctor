import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../services/api';

const WebcamGuard = forwardRef(({ token }, ref) => {
    const webcamRef = useRef(null);
    const tokenRef = useRef(token);
    const [permissionError, setPermissionError] = React.useState(false);

    // Keep the ref in sync with the prop
    useEffect(() => {
        tokenRef.current = token;
    }, [token]);

    // Provide immediate capture capability to the parent (for violation triggers)
    useImperativeHandle(ref, () => ({
        capture: () => {
            sendSnapshot();
        }
    }));

    const sendSnapshot = useCallback(async () => {
        const currentToken = tokenRef.current || localStorage.getItem('candidate_token');
        if (!webcamRef.current || !currentToken || permissionError) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        try {
            await api.post('/proctor/snapshot/', 
                { image: imageSrc },
                { headers: { Authorization: `Bearer ${currentToken}` } }
            );
        } catch (error) {
            console.error("Failed to upload snapshot.", error?.response?.status, error?.response?.data);
        }
    }, [permissionError]); // Skip if we have a permission error

    // 5-second aggressive interval
    useEffect(() => {
        if (!token || permissionError) return; 
        const interval = setInterval(() => {
            sendSnapshot();
        }, 5000);

        return () => clearInterval(interval);
    }, [token, sendSnapshot, permissionError]);

    if (permissionError) {
        return (
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                zIndex: 10000, color: 'white', textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷🚫</div>
                <h2 style={{ color: '#ef4444' }}>Camera Access Blocked</h2>
                <p style={{ maxWidth: '400px', margin: '1rem 0', lineHeight: '1.6', color: '#ccc' }}>
                    You previously blocked camera access for this site. 
                    The browser will not ask again automatically. 
                </p>
                <div style={{ 
                    background: '#1f2937', 
                    padding: '1.5rem', 
                    borderRadius: '8px', 
                    textAlign: 'left',
                    border: '1px solid #374151'
                }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>To Fix This:</p>
                    <ol style={{ paddingLeft: '1.2rem', color: '#fff' }}>
                        <li>Click the <b>Lock (🔒)</b> or <b>Settings</b> icon in your address bar (top left).</li>
                        <li>Toggle <b>Camera</b> on OR click <b>'Reset Permission'</b>.</li>
                        <li><b>Refresh the page</b> to start your test.</li>
                    </ol>
                </div>
                <button 
                   onClick={() => window.location.reload()}
                   style={{ marginTop: '2rem', background: '#3b82f6', padding: '0.75rem 2rem' }}
                >
                    I've fixed it, Reload Page
                </button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '180px',
            height: '135px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.1)',
            zIndex: 9999,
            backgroundColor: '#111'
        }}>
            <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={() => setPermissionError(true)}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,0,0,0.7)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                color: '#10b981',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
            }}>
                <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    animation: 'pulse 2s infinite'
                }}></div>
                PROCTORING ACTIVE
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.3; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
});

export default WebcamGuard;
