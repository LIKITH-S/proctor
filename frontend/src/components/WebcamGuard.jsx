import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';

const WebcamGuard = forwardRef(({ token }, ref) => {
    const webcamRef = useRef(null);

    // Provide immediate capture capability to the parent (for violation triggers)
    useImperativeHandle(ref, () => ({
        capture: () => {
            sendSnapshot();
        }
    }));

    const sendSnapshot = async () => {
        if (!webcamRef.current) return;
        
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        try {
            await fetch('http://localhost:8000/api/proctor/snapshot/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ image: imageSrc })
            });
        } catch (error) {
            console.error("Failed to upload snapshot", error);
        }
    };

    // 5-second aggressive interval
    useEffect(() => {
        const interval = setInterval(() => {
            sendSnapshot();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

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
