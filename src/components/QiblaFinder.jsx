import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Qibla, Coordinates } from 'adhan';
import geomagnetism from 'geomagnetism';
import { getUserLocation } from '../services/prayerTimesService';
import './QiblaFinder.css';

const KAABA_COORDS = { lat: 21.422487, lng: 39.826206 };

const QiblaFinder = ({ isOpen, onClose }) => {
    // Modes: 'landing', 'compass', 'camera'
    const [mode, setMode] = useState('landing');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [qiblaDirection, setQiblaDirection] = useState(null);
    const [distanceKm, setDistanceKm] = useState(null);
    const [declination, setDeclination] = useState(0);
    const [isAligned, setIsAligned] = useState(false);

    // UI State
    const [smoothedHeading, setSmoothedHeading] = useState(0);

    // Refs for stable logic
    const headingRef = useRef(0);
    const smoothedHeadingRef = useRef(0);
    const lastDisplayedHeadingRef = useRef(0);
    const requestRef = useRef(null);
    const mountedRef = useRef(true);

    const [location, setLocation] = useState(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Haptic feedback limiter
    const lastVibrateRef = useRef(0);

    // Haversine Distance Calculation
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    // Physics State (Spring Model)
    // We use refs for physics state to avoid React render loop overhead
    const physicsState = useRef({
        position: 0,
        velocity: 0,
        target: 0
    });

    // Spring Config
    const SPRING_CONFIG = {
        stiffness: 0.08, // Higher = snaps faster
        damping: 0.82,   // Lower = more oscillation, Higher = less oscillation (0-1)
        mass: 1.0
    };

    // Calculate shortest distance between two angles (for spring target)
    const getShortestAngleDiff = (from, to) => {
        const diff = (to - from + 180) % 360 - 180;
        return (diff + 360) % 360 - 180;
    };

    // Physics Loop
    const loopRef = useRef();
    loopRef.current = () => {
        if (!mountedRef.current) return;

        const { stiffness, damping, mass } = SPRING_CONFIG;
        let { position, velocity, target } = physicsState.current;

        // 1. Calculate Force (Spring)
        // Find shortest path to target
        const error = getShortestAngleDiff(position, target);

        // 2. Apply Spring Force
        const force = error * stiffness;

        // 3. Apply Damping (Friction)
        const acceleration = (force / mass);
        velocity = (velocity + acceleration) * damping;

        // 4. Update Position
        position += velocity;

        // Save state
        physicsState.current = { position, velocity, target };

        // Normalize position for display (0-360) 
        // We keep physics continuous, but normalized for alignment checks
        const normalizedPos = ((position % 360) + 360) % 360;

        // Check Alignment (Tolerance 3 degrees)
        if (qiblaDirection !== null) {
            const angleToQibla = Math.abs(getShortestAngleDiff(normalizedPos, qiblaDirection));
            const aligned = angleToQibla < 3;

            if (aligned !== isAligned) setIsAligned(aligned);

            // Haptic
            if (aligned && Date.now() - lastVibrateRef.current > 1000) {
                if (navigator.vibrate) navigator.vibrate(50);
                lastVibrateRef.current = Date.now();
            }
        }

        // 5. Update UI
        // We check if change is significant to trigger React Render
        if (Math.abs(position - lastDisplayedHeadingRef.current) > 0.1) {
            setSmoothedHeading(position); // Keep simulated position
            lastDisplayedHeadingRef.current = position;
        }

        requestRef.current = requestAnimationFrame(loopRef.current);
    };

    // Initialize: Get Location & Calculate Data
    const initData = useCallback(async () => {
        // Don't block UI with loading state completely
        // Just show inline loader
        setLoading(true);
        setError(null);
        try {
            const loc = await getUserLocation();
            if (!mountedRef.current) return;

            setLocation(loc);

            // 1. Calculate Declination
            const magneticModel = geomagnetism.model();
            const geoInfo = magneticModel.point([loc.latitude, loc.longitude]);
            const decl = geoInfo.declination || 0;
            setDeclination(decl);

            // 2. Calculate Qibla
            const coordinates = new Coordinates(loc.latitude, loc.longitude);
            const qibla = Qibla(coordinates);
            setQiblaDirection(qibla); // This is True Heading to Qibla

            // 3. Calculate Distance
            const dist = calculateDistance(loc.latitude, loc.longitude, KAABA_COORDS.lat, KAABA_COORDS.lng);
            setDistanceKm(dist);

        } catch (err) {
            console.error('Data error:', err);
            if (mountedRef.current) setError('Unable to get location.');
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    const requestPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceOrientationEvent.requestPermission();
                if (permission === 'granted') {
                    setPermissionGranted(true);
                    return true;
                } else {
                    setError('Compass permission denied.');
                    return false;
                }
            } catch (err) {
                setError('Could not request compass permission.');
                return false;
            }
        } else {
            setPermissionGranted(true);
            return true;
        }
    };

    // Activate Mode
    const enterMode = async (targetMode) => {
        const permitted = await requestPermission();
        if (permitted) {
            setMode(targetMode);
        }
    };

    // Orientation Logic
    useEffect(() => {
        if (!isOpen || !permissionGranted || mode === 'landing') return;

        const handleOrientation = (event) => {
            let magneticHeading = 0;

            // iOS
            if (event.webkitCompassHeading !== undefined && event.webkitCompassHeading !== null) {
                magneticHeading = event.webkitCompassHeading;
            }
            // Android (absolute)
            else if (event.alpha !== null) {
                magneticHeading = 360 - event.alpha;
            }

            // Correct to True North using declination
            // True = Magnetic + Declination
            let trueHeading = magneticHeading + declination;
            trueHeading = (trueHeading + 360) % 360;

            // Update Physics Target directly
            physicsState.current.target = trueHeading;
        };

        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        if (!requestRef.current) {
            requestRef.current = requestAnimationFrame(loopRef.current);
        }

        return () => {
            if ('ondeviceorientationabsolute' in window) {
                window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
            } else {
                window.removeEventListener('deviceorientation', handleOrientation, true);
            }
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };
    }, [isOpen, permissionGranted, mode, declination]);

    // Lifecycle
    useEffect(() => {
        mountedRef.current = true;
        if (isOpen) {
            initData();
        } else {
            setMode('landing'); // Reset to landing
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
        return () => { mountedRef.current = false; };
    }, [isOpen, initData]);

    // Camera
    useEffect(() => {
        if (mode === 'camera' && isOpen) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => {
                    console.error('Cam Error', err);
                    setError('Camera access denied');
                });
        } else {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        }
    }, [mode, isOpen]);


    const getCompassRotation = () => {
        if (qiblaDirection === null) return 0;
        // Flip 180 degrees to fix inverted visual
        return qiblaDirection - smoothedHeading + 180;
    };

    if (!isOpen) return null;

    return (
        <div className="qibla-overlay" onClick={onClose}>
            <div className={`qibla-modal ${mode}`} onClick={(e) => e.stopPropagation()}>

                <button className="qibla-close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* LANDING SCREEN */}
                {mode === 'landing' && (
                    <div className="qibla-landing">
                        <div className="qibla-landing-icon">🕋</div>
                        <h2>Qibla Finder</h2>
                        <p>Locate the Qibla with high precision using Augmented Reality or Compass.</p>

                        {/* Loading / Error / Stats */}
                        {loading && !location ? (
                            <div className="qibla-spinner"></div>
                        ) : (
                            <>
                                {location && (
                                    <div className="qibla-landing-stats">
                                        <div className="stat">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            {location.city}
                                        </div>
                                        <div className="stat">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="stat-icon">
                                                <path d="M7 17l9.2-9.2M17 17V7H7" />
                                            </svg>
                                            {distanceKm} km
                                        </div>
                                    </div>
                                )}

                                {error && <div className="qibla-error-msg">{error}</div>}

                                <div className="qibla-mode-select">
                                    <button className="mode-card" onClick={() => enterMode('camera')} disabled={loading}>
                                        <div className="icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                        </div>
                                        <div className="mode-info">
                                            <span className="label">AR Mode</span>
                                            <span className="desc">See Qibla in real world</span>
                                        </div>
                                    </button>
                                    <button className="mode-card" onClick={() => enterMode('compass')} disabled={loading}>
                                        <div className="icon">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"></circle>
                                                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88"></polygon>
                                            </svg>
                                        </div>
                                        <div className="mode-info">
                                            <span className="label">Compass</span>
                                            <span className="desc">Classic 2D pointer</span>
                                        </div>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* COMPASS / CAMERA MODES */}
                {mode !== 'landing' && (
                    <div className={`qibla-active-view ${isAligned ? 'aligned' : ''}`}>
                        {/* Mode Switcher */}
                        <div className="qibla-top-bar">
                            <div className="mode-pill">
                                <button className={mode === 'camera' ? 'active' : ''} onClick={() => setMode('camera')}>AR</button>
                                <button className={mode === 'compass' ? 'active' : ''} onClick={() => setMode('compass')}>Compass</button>
                            </div>
                        </div>

                        {/* AR Video Layer */}
                        {mode === 'camera' && (
                            <video ref={videoRef} autoPlay playsInline className="qibla-camera-bg" />
                        )}

                        {/* Main Direction Indicator */}
                        <div className="qibla-visuals">
                            {/* The Arrow/Dial */}
                            <div className="qibla-pointer-container" style={{ transform: `rotate(${getCompassRotation()}deg)` }}>
                                {mode === 'compass' ? (
                                    <div className="compass-dial-face">
                                        <div className="compass-markings"></div>
                                        <div className="compass-needle"></div>
                                    </div>
                                ) : (
                                    <div className="ar-arrow-3d">
                                        <div className="arrow-head"></div>
                                        <div className="arrow-shaft"></div>
                                    </div>
                                )}
                            </div>

                            {/* Static Crosshair for AR */}
                            {mode === 'camera' && <div className="ar-crosshair"></div>}
                        </div>

                        {/* Bottom Info Status */}
                        <div className="qibla-status-panel">
                            <div className="status-main">
                                {isAligned ? (
                                    <div className="lock-indicator">
                                        <span className="lock-icon">✓</span>
                                        <span>Aligned with Qibla</span>
                                    </div>
                                ) : (
                                    <span>Rotate to find Qibla</span>
                                )}
                            </div>
                            <div className="status-grid">
                                <div className="stat-item">
                                    <label>Distance</label>
                                    <span>{distanceKm} km</span>
                                </div>
                                <div className="stat-item">
                                    <label>Qibla Angle</label>
                                    <span>{Math.round(qiblaDirection)}°</span>
                                </div>
                                <div className="stat-item">
                                    <label>Accuracy</label>
                                    <span>{declination ? 'True N' : 'Mag N'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QiblaFinder;
