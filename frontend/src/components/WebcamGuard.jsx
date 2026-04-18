import React, { useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../services/api';

const WebcamGuard = forwardRef(({ token }, ref) => {
    const webcamRef = useRef(null);
    const tokenRef = useRef(token);

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
        if (!webcamRef.current || !currentToken) return;
        
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
    }, []); // No dependencies — always reads from refs

    // 5-second aggressive interval
    useEffect(() => {
        if (!token) return; // Don't start timer if we don't have a token yet
        const interval = setInterval(() => {
            sendSnapshot();
        }, 5000);

        return () => clearInterval(interval);
    }, [token, sendSnapshot]);

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
                onUserMediaError={() => {
                    alert("FATAL ERROR: Camera access was denied. You must allow camera access to take this test.");
                    localStorage.clear();
                    window.location.href = '/';
                }}
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
