import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Qibla, Coordinates } from 'adhan';
import { getUserLocation } from '../services/prayerTimesService';
import './QiblaFinder.css';

const QiblaFinder = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('compass'); // 'compass' or 'camera'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [deviceHeading, setDeviceHeading] = useState(0);
    const [location, setLocation] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Calculate Qibla direction based on location
    const calculateQibla = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const loc = await getUserLocation();
            setLocation(loc);

            const coordinates = new Coordinates(loc.latitude, loc.longitude);
            const qibla = Qibla(coordinates);
            setQiblaDirection(Math.round(qibla * 10) / 10);
            console.log('🧭 Qibla direction:', qibla, '° from North');
        } catch (err) {
            console.error('Error getting location:', err);
            setError('Unable to get location. Please enable location access.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Request device orientation permission (required on iOS)
    const requestOrientationPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    setPermissionGranted(true);
                    return true;
                } else {
                    setError('Compass permission denied. Please allow access to use the Qibla finder.');
                    return false;
                }
            } catch (err) {
                console.error('Error requesting orientation permission:', err);
                setError('Could not request compass permission.');
                return false;
            }
        } else {
            // Not iOS or permission not required
            setPermissionGranted(true);
            return true;
        }
    };

    // Handle device orientation
    useEffect(() => {
        if (!isOpen || !permissionGranted) return;

        const handleOrientation = (event) => {
            let heading = 0;

            if (event.webkitCompassHeading !== undefined) {
                // iOS Safari
                heading = event.webkitCompassHeading;
            } else if (event.alpha !== null) {
                // Android/Chrome - alpha is the compass heading
                heading = 360 - event.alpha;
            }

            setDeviceHeading(Math.round(heading));
        };

        window.addEventListener('deviceorientation', handleOrientation, true);

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [isOpen, permissionGranted]);

    // Initialize on open
    useEffect(() => {
        if (isOpen) {
            calculateQibla();
            requestOrientationPermission();
        } else {
            // Cleanup camera when closing
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    }, [isOpen, calculateQibla]);

    // Camera mode
    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
            setError('Unable to access camera. Please enable camera permission.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    // Handle mode switch
    useEffect(() => {
        if (mode === 'camera') {
            startCamera();
        } else {
            stopCamera();
        }
    }, [mode]);

    // Calculate rotation angle for compass needle
    const getCompassRotation = () => {
        if (qiblaDirection === null) return 0;
        // Rotate the qibla marker based on device heading
        return qiblaDirection - deviceHeading;
    };

    if (!isOpen) return null;

    return (
        <div className="qibla-overlay" onClick={onClose}>
            <div className="qibla-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="qibla-header">
                    <div className="qibla-header-content">
                        <h2 className="qibla-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="12,2 15,10 12,8 9,10" fill="currentColor" />
                                <line x1="12" y1="12" x2="12" y2="16" />
                            </svg>
                            Qibla Finder
                        </h2>
                        {location && (
                            <p className="qibla-location">
                                📍 {location.city}, {location.country}
                            </p>
                        )}
                    </div>
                    <button className="qibla-close" onClick={onClose}>✕</button>
                </div>

                {/* Mode Toggle */}
                <div className="qibla-mode-toggle">
                    <button
                        className={`qibla-mode-btn ${mode === 'compass' ? 'active' : ''}`}
                        onClick={() => setMode('compass')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
                        </svg>
                        Compass
                    </button>
                    <button
                        className={`qibla-mode-btn ${mode === 'camera' ? 'active' : ''}`}
                        onClick={() => setMode('camera')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        Camera AR
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="qibla-loading">
                        <div className="qibla-spinner"></div>
                        <p>Finding your location...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="qibla-error">
                        <span>⚠️</span>
                        <p>{error}</p>
                        <button onClick={() => { setError(null); calculateQibla(); }}>Try Again</button>
                    </div>
                )}

                {/* Permission Request */}
                {!loading && !error && !permissionGranted && (
                    <div className="qibla-permission">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
                        </svg>
                        <p>Enable compass access to find the Qibla direction</p>
                        <button onClick={requestOrientationPermission}>Enable Compass</button>
                    </div>
                )}

                {/* Compass Mode */}
                {!loading && !error && permissionGranted && mode === 'compass' && qiblaDirection !== null && (
                    <div className="qibla-compass-container">
                        <div className="qibla-compass">
                            <div
                                className="qibla-compass-dial"
                                style={{ transform: `rotate(${-deviceHeading}deg)` }}
                            >
                                {/* Compass markings */}
                                <span className="qibla-compass-n">N</span>
                                <span className="qibla-compass-e">E</span>
                                <span className="qibla-compass-s">S</span>
                                <span className="qibla-compass-w">W</span>

                                {/* Degree markings */}
                                {[...Array(36)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`qibla-compass-tick ${i % 3 === 0 ? 'major' : ''}`}
                                        style={{ transform: `rotate(${i * 10}deg)` }}
                                    />
                                ))}
                            </div>

                            {/* Qibla direction indicator (fixed) */}
                            <div
                                className="qibla-arrow"
                                style={{ transform: `rotate(${getCompassRotation()}deg)` }}
                            >
                                <svg viewBox="0 0 24 50" fill="none">
                                    <path
                                        d="M12 0L20 18H4L12 0Z"
                                        fill="url(#qiblaGradient)"
                                    />
                                    <defs>
                                        <linearGradient id="qiblaGradient" x1="12" y1="0" x2="12" y2="18">
                                            <stop offset="0%" stopColor="#c9a961" />
                                            <stop offset="100%" stopColor="#b8943f" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>

                            {/* Center Kaaba icon */}
                            <div className="qibla-kaaba">🕋</div>
                        </div>

                        <div className="qibla-info">
                            <p className="qibla-degrees">
                                {qiblaDirection}° from North
                            </p>
                            <p className="qibla-heading">
                                Your heading: {deviceHeading}°
                            </p>
                        </div>

                        <div className="qibla-instruction">
                            {Math.abs(getCompassRotation()) < 10 ? (
                                <p className="qibla-aligned">✓ You are facing the Qibla!</p>
                            ) : (
                                <p>Rotate your device until the arrow points up</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Camera AR Mode */}
                {!loading && !error && permissionGranted && mode === 'camera' && qiblaDirection !== null && (
                    <div className="qibla-camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="qibla-camera-video"
                        />
                        <div className="qibla-camera-overlay">
                            {/* Directional arrow overlay */}
                            <div
                                className="qibla-camera-arrow"
                                style={{ transform: `rotate(${getCompassRotation()}deg)` }}
                            >
                                <svg viewBox="0 0 100 100" fill="none">
                                    <defs>
                                        <filter id="glow">
                                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                            <feMerge>
                                                <feMergeNode in="coloredBlur" />
                                                <feMergeNode in="SourceGraphic" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <polygon
                                        points="50,5 60,40 50,35 40,40"
                                        fill="#c9a961"
                                        filter="url(#glow)"
                                    />
                                    <text x="50" y="70" textAnchor="middle" fill="#c9a961" fontSize="12" fontWeight="bold">
                                        QIBLA
                                    </text>
                                </svg>
                            </div>

                            {/* Crosshair */}
                            <div className="qibla-crosshair">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
                                    <line x1="50" y1="25" x2="50" y2="35" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                    <line x1="50" y1="65" x2="50" y2="75" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                    <line x1="25" y1="50" x2="35" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                    <line x1="65" y1="50" x2="75" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                                </svg>
                            </div>

                            {/* Info overlay */}
                            <div className="qibla-camera-info">
                                <p>Qibla: {qiblaDirection}°</p>
                                <p>Heading: {deviceHeading}°</p>
                            </div>

                            {Math.abs(getCompassRotation()) < 15 && (
                                <div className="qibla-camera-aligned">
                                    ✓ Pointing to Qibla
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QiblaFinder;
