// @ts-nocheck

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    getUserLocation,
    getPrayerTimes,
    getNextPrayer,
    getCurrentPrayer,
    formatPrayerTime,
    CALCULATION_METHODS
} from '@/services/prayerTimesService';
import '@/components/PrayerTimes.css';

const PrayerTimes = ({ isOpen, onClose, embedded = false }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [prayerData, setPrayerData] = useState(null);
    const [nextPrayer, setNextPrayer] = useState(null);
    const [currentPrayer, setCurrentPrayer] = useState(null);
    const [use24Hour, setUse24Hour] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('SriLanka'); // Matches Muslim Pro

    const fetchPrayerTimes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Get location
            const loc = await getUserLocation();
            setLocation(loc);

            // Get prayer times
            const data = await getPrayerTimes(
                loc.latitude,
                loc.longitude,
                new Date(),
                selectedMethod
            );
            setPrayerData(data);

            // Calculate next and current prayer
            setNextPrayer(getNextPrayer(data.timings));
            setCurrentPrayer(getCurrentPrayer(data.timings));
        } catch (err) {
            console.error('Error fetching prayer times:', err);
            setError('Failed to load prayer times. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [selectedMethod]);

    // Fetch on mount and when method changes
    useEffect(() => {
        if (isOpen) {
            fetchPrayerTimes();
        }
    }, [isOpen, fetchPrayerTimes]);

    // Update next prayer every minute
    useEffect(() => {
        if (!prayerData) return;

        const interval = setInterval(() => {
            setNextPrayer(getNextPrayer(prayerData.timings));
            setCurrentPrayer(getCurrentPrayer(prayerData.timings));
        }, 60000);

        return () => clearInterval(interval);
    }, [prayerData]);

    // if (!isOpen) return null; // Removed to allow AnimatePresence to handle exit animation

    const prayerList = [
        { key: 'Fajr', name: 'Fajr', icon: '🌙', arabicName: 'الفجر' },
        { key: 'Sunrise', name: 'Sunrise', icon: '🌅', arabicName: 'الشروق' },
        { key: 'Dhuhr', name: 'Dhuhr', icon: '☀️', arabicName: 'الظهر' },
        { key: 'Asr', name: 'Asr', icon: '🌤️', arabicName: 'العصر' },
        { key: 'Maghrib', name: 'Maghrib', icon: '🌇', arabicName: 'المغرب' },
        { key: 'Isha', name: 'Isha', icon: '🌙', arabicName: 'العشاء' }
    ];

    const content = (
        <div className={`prayer-times-modal ${embedded ? 'prayer-times-modal--embedded' : ''}`} onClick={(e) => e.stopPropagation()}>
            {/* Close button - positioned independently for sticky behavior */}
            <button className="prayer-times-close" onClick={onClose} aria-label="Close">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            {/* Header */}
            <div className="prayer-times-header">
                <div className="prayer-times-header-content">
                    <h2 className="prayer-times-title">
                        <svg className="prayer-times-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Prayer Times
                    </h2>
                    {location && (
                        <p className="prayer-times-location">
                            📍 {location.city}, {location.country}
                            <span className="prayer-times-source">({location.source})</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Date Display */}
            {
                prayerData && (
                    <div className="prayer-times-date">
                        <div className="prayer-times-date-hijri">
                            <span className="prayer-times-date-day">{prayerData.date.hijri.day}</span>
                            <span className="prayer-times-date-month">{prayerData.date.hijri.month}</span>
                            <span className="prayer-times-date-year">{prayerData.date.hijri.year} {prayerData.date.hijri.designation}</span>
                        </div>
                        <div className="prayer-times-date-gregorian">
                            {prayerData.date.gregorian.weekday}, {prayerData.date.gregorian.date}
                        </div>
                    </div>
                )
            }

            {/* Loading State */}
            {
                loading && (
                    <div className="prayer-times-loading">
                        <div className="prayer-times-spinner"></div>
                        <p>Loading prayer times...</p>
                    </div>
                )
            }

            {/* Error State */}
            {
                error && (
                    <div className="prayer-times-error">
                        <span className="prayer-times-error-icon">⚠️</span>
                        <p>{error}</p>
                        <button onClick={fetchPrayerTimes}>Retry</button>
                    </div>
                )
            }

            {/* Prayer Times List */}
            {
                !loading && !error && prayerData && (
                    <>
                        {/* Next Prayer Highlight */}
                        {nextPrayer && (
                            <div className="prayer-times-next">
                                <div className="prayer-times-next-label">Next Prayer</div>
                                <div className="prayer-times-next-name">{nextPrayer.name}</div>
                                <div className="prayer-times-next-time">
                                    {formatPrayerTime(nextPrayer.time, use24Hour)}
                                </div>
                                <div className="prayer-times-next-remaining">
                                    {nextPrayer.isTomorrow && 'Tomorrow • '}
                                    {nextPrayer.remaining.hours}h {nextPrayer.remaining.minutes}m remaining
                                </div>
                            </div>
                        )}

                        {/* Caution Notice */}
                        <div className="prayer-times-caution">
                            <span className="prayer-times-caution-icon">⚠️</span>
                            <p>Prayer times may vary by 1-2 minutes. Don't wait until the last moment — pray as early as possible.</p>
                        </div>

                        {/* All Prayer Times */}
                        <div className="prayer-times-list">
                            {prayerList.map(prayer => {
                                const isActive = currentPrayer === prayer.key;
                                const isNext = nextPrayer?.name === prayer.key;

                                return (
                                    <div
                                        key={prayer.key}
                                        className={`prayer-times-item ${isActive ? 'prayer-times-item--active' : ''} ${isNext ? 'prayer-times-item--next' : ''}`}
                                    >
                                        <div className="prayer-times-item-left">
                                            <span className="prayer-times-item-icon">{prayer.icon}</span>
                                            <div className="prayer-times-item-names">
                                                <span className="prayer-times-item-name">{prayer.name}</span>
                                                <span className="prayer-times-item-arabic">{prayer.arabicName}</span>
                                            </div>
                                        </div>
                                        <div className="prayer-times-item-time">
                                            {formatPrayerTime(prayerData.timings[prayer.key], use24Hour)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Settings */}
                        <div className="prayer-times-settings">
                            <div className="prayer-times-setting">
                                <label>Calculation Method:</label>
                                <select
                                    value={selectedMethod}
                                    onChange={(e) => setSelectedMethod(e.target.value)}
                                >
                                    {Object.values(CALCULATION_METHODS).map(method => (
                                        <option key={method.id} value={method.id}>
                                            {method.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="prayer-times-setting">
                                <label>Time Format:</label>
                                <button
                                    className={`prayer-times-format-btn ${!use24Hour ? 'active' : ''}`}
                                    onClick={() => setUse24Hour(false)}
                                >
                                    12h
                                </button>
                                <button
                                    className={`prayer-times-format-btn ${use24Hour ? 'active' : ''}`}
                                    onClick={() => setUse24Hour(true)}
                                >
                                    24h
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="prayer-times-footer">
                            <p>Method: {prayerData.meta.method}</p>
                            <button className="prayer-times-refresh" onClick={fetchPrayerTimes}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 4v6h-6"></path>
                                    <path d="M1 20v-6h6"></path>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                </svg>
                                Refresh
                            </button>
                        </div>
                    </>
                )
            }
        </div >
    );

    if (embedded) {
        return content;
    }

    return (
        <div className="prayer-times-overlay" onClick={onClose}>
            {content}
        </div>
    );
};

export default PrayerTimes;
