'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatContainer from '@/components/ChatContainer';
import AmbientBackground from '@/components/AmbientBackground';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaFinder from '@/components/QiblaFinder';
import SEOContent from '@/components/SEOContent';
import { sendMessage } from '@/services/openaiService';
import { SCHOOLS } from '@/utils/systemPrompt';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    content?: string;
}

// Reset scroll to top on initial load
const useScrollReset = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, []);
};

export default function HomeContent() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [genZMode, setGenZMode] = useState(false);
    const [showPrayerTimes, setShowPrayerTimes] = useState(false);
    const [showQibla, setShowQibla] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Reset scroll to top on initial load
    useScrollReset();

    const isHero = messages.length === 0 && !isLoading;

    const handleSendMessage = useCallback(async (userMessage: string) => {
        // Add user message to chat
        const userMessageObj: Message = { role: 'user', text: userMessage };
        setMessages((prevMessages) => [...prevMessages, userMessageObj]);
        setIsLoading(true);
        setError(null);

        try {
            // Build conversation history for context
            const conversationHistory = messages.map((msg) => ({
                role: msg.role,
                content: msg.text
            }));

            // Send message to API with genZMode flag
            const aiResponse = await sendMessage(userMessage, SCHOOLS.GENERAL, conversationHistory, genZMode);

            // Add AI response to chat
            const aiMessageObj: Message = { role: 'assistant', text: aiResponse };
            setMessages((prevMessages) => [...prevMessages, aiMessageObj]);
        } catch (err: any) {
            // Handle errors
            const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            console.error('Error sending message:', err);
        } finally {
            setIsLoading(false);
        }
    }, [messages, genZMode]);

    const handleToggleGenZMode = useCallback(() => {
        setGenZMode(prev => !prev);
    }, []);

    // Determine if Dynamic Island is expanded (keep expanded during close animation)
    const isModalOpen = showPrayerTimes || showQibla;
    const isExpanded = isModalOpen || isClosing;
    const [justClosed, setJustClosed] = useState(false);
    const [isOpening, setIsOpening] = useState(false);

    const handleOpenPrayerTimes = () => {
        setIsOpening(true);
        setShowPrayerTimes(true);
        setTimeout(() => setIsOpening(false), 300);
    };

    const handleOpenQibla = () => {
        setIsOpening(true);
        setShowQibla(true);
        setTimeout(() => setIsOpening(false), 300);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setShowPrayerTimes(false);
        setShowQibla(false);
    };

    const handleExitComplete = () => {
        setIsClosing(false);
        setJustClosed(true);
        // Reset justClosed after animation completes
        setTimeout(() => setJustClosed(false), 600);
    };

    return (
        <div className="app">
            {isHero && <AmbientBackground />}
            <SEOContent />

            {/* Overlay behind expanded Dynamic Island */}
            <div
                className={`app__modal-overlay ${isExpanded ? 'app__modal-overlay--visible' : ''}`}
                onClick={handleCloseModal}
            />

            {/* Header Positioning Container */}
            <div className="app__header-wrapper">
                <motion.header
                    className={`app__header ${isExpanded ? 'app__header--expanded' : ''}`}
                    initial={false}
                    animate={
                        isClosing
                            ? { scale: 0.3, opacity: 0, y: -50 }
                            : isOpening
                                ? { scale: [0.3, 1], opacity: [0, 1], y: [-50, 0] }
                                : justClosed
                                    ? { scale: 1, opacity: 1, y: 0, x: [0, -6, 6, -5, 5, -3, 3, -1, 1, 0], scaleX: [1, 1.08, 1.06, 1.04, 1.02, 1] }
                                    : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={{
                        scale: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.25 },
                        y: { duration: 0.25 },
                        x: { duration: 0.5, ease: "easeOut", delay: 0.05 },
                        scaleX: { duration: 0.4, ease: "easeOut" }
                    }}
                    style={{
                        overflow: "hidden",
                        transformOrigin: "top center"
                    }}
                >
                    {/* onExitComplete triggers after modal fully exits */}
                    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
                        {!isExpanded && (
                            <motion.div
                                key="collapsed"
                                className="app__header-inner-collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, position: 'absolute' }}
                                transition={{ duration: 0.15 }}
                                style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', whiteSpace: 'nowrap' }}
                            >
                                {/* Header content - hidden when expanded */}
                                <div className="app__header-content">
                                    <h1 className="app__title">
                                        <span className="app__title-arabic">أخي</span>
                                        <span className="app__title-english">Akhi AI</span>
                                        <span className="app__title-seo">– Your Brother in Faith &amp; Knowledge</span>
                                    </h1>
                                </div>
                                <div className="app__header-actions">
                                    <button
                                        type="button"
                                        className="app__action-btn"
                                        onClick={handleOpenQibla}
                                        title="Qibla Finder"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" fill="currentColor" />
                                        </svg>
                                    </button>
                                    <button
                                        type="button"
                                        className="app__action-btn"
                                        onClick={handleOpenPrayerTimes}
                                        title="Prayer Times"
                                    >
                                        🕌
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {showPrayerTimes && (
                            <motion.div
                                key="prayer-modal"
                                className="app__header-modal"
                                layout={false}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.3,
                                    y: -100,
                                    filter: "blur(8px)"
                                }}
                                transition={{
                                    duration: 0.25,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transformOrigin: 'top center'
                                }}
                            >
                                <PrayerTimes
                                    isOpen={true}
                                    onClose={handleCloseModal}
                                    embedded={true}
                                />
                            </motion.div>
                        )}

                        {showQibla && (
                            <motion.div
                                key="qibla-modal"
                                className="app__header-modal"
                                layout={false}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.3,
                                    y: -100,
                                    filter: "blur(8px)"
                                }}
                                transition={{
                                    duration: 0.25,
                                    ease: [0.4, 0, 0.2, 1]
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    transformOrigin: 'top center'
                                }}
                            >
                                <QiblaFinder
                                    isOpen={true}
                                    onClose={handleCloseModal}
                                    embedded={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.header>
            </div>

            <ChatContainer
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleSendMessage}
                error={error}
                genZMode={genZMode}
                onToggleGenZMode={handleToggleGenZMode}
            />

            {/* Footer */}
            <footer className="app__footer">
                <p className="app__footer-copyright">
                    © {new Date().getFullYear()} Akhi AI by <a href="https://theoneatom.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>The One Atom</a>
                    <span className="app__footer-divider">·</span>
                    <a href="/about/" className="app__about-link">About</a>
                    <span className="app__footer-divider">·</span>
                    <a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noopener noreferrer" className="app__about-link">Support</a>
                </p>
            </footer>
        </div>
    );
}
