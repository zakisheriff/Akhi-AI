'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatContainer from '@/components/ChatContainer';
import AmbientBackground from '@/components/AmbientBackground';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaFinder from '@/components/QiblaFinder';
import SEOContent from '@/components/SEOContent';
import HistoryModal, { StoredChat } from '@/components/HistoryModal';
import { sendMessage } from '@/services/openaiService';
import { SCHOOLS } from '@/utils/systemPrompt';
import { v4 as uuidv4 } from 'uuid';

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
    const [conversations, setConversations] = useState<StoredChat[]>([]);
    const [currentChatId, setCurrentChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [genZMode, setGenZMode] = useState(false);
    const [showPrayerTimes, setShowPrayerTimes] = useState(false);
    const [showQibla, setShowQibla] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Reset scroll to top on initial load
    useScrollReset();

    // Load chat history from local storage
    useEffect(() => {
        const savedHistory = localStorage.getItem('akhi_chat_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                if (Array.isArray(parsed)) {
                    setConversations(parsed);
                }
            } catch (e) {
                console.error('Failed to load chat history', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save conversations to local storage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('akhi_chat_history', JSON.stringify(conversations));
        }
    }, [conversations, isLoaded]);

    // Update current conversation in the list when messages change
    useEffect(() => {
        if (!currentChatId || messages.length === 0) return;

        setConversations(prev => {
            const index = prev.findIndex(c => c.id === currentChatId);
            if (index === -1) {
                // Create new chat entry if not exists
                const newChat: StoredChat = {
                    id: currentChatId,
                    title: messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : ''),
                    messages: messages,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                return [newChat, ...prev];
            } else {
                // Update existing
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    messages: messages,
                    updatedAt: Date.now(),
                    // Update title if it's the first message
                    title: messages.length === 1 ? messages[0].text.substring(0, 30) + (messages[0].text.length > 30 ? '...' : '') : updated[index].title
                };
                return updated;
            }
        });
    }, [messages, currentChatId]);

    // Initialize a new chat if no current chat ID
    useEffect(() => {
        if (!currentChatId && messages.length === 0 && !isLoading) {
            // Don't auto-create here to avoid empty chats filling up history
            // Just let the user type or select from history
        }
    }, [currentChatId, messages, isLoading]);

    const handleSendMessage = useCallback(async (userMessage: string) => {
        // Ensure we have a chat ID
        if (!currentChatId) {
            const newId = uuidv4();
            setCurrentChatId(newId);
        }

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
    }, [messages, genZMode, currentChatId]);

    const handleToggleGenZMode = useCallback(() => {
        setGenZMode(prev => !prev);
    }, []);

    // "Back" button functionality - Closes current chat
    const handleCloseChat = useCallback(() => {
        setMessages([]);
        setCurrentChatId(null);
        setError(null);
    }, []);

    // Determine if Dynamic Island is expanded (keep expanded during close animation)
    const isModalOpen = showPrayerTimes || showQibla || showHistory;
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

    const handleOpenHistory = () => {
        setIsOpening(true);
        setShowHistory(true);
        setTimeout(() => setIsOpening(false), 300);
    };

    const handleCloseModal = () => {
        setIsClosing(true);
        setShowPrayerTimes(false);
        setShowQibla(false);
        setShowHistory(false);
    };

    const startNewChat = useCallback(() => {
        const newId = uuidv4();
        setCurrentChatId(newId);
        setMessages([]);
        setError(null);
        handleCloseModal();
    }, []);

    const handleSelectChat = useCallback((chatId: string) => {
        const chat = conversations.find(c => c.id === chatId);
        if (chat) {
            setCurrentChatId(chat.id);
            setMessages(chat.messages);
            setError(null);
            handleCloseModal();
        }
    }, [conversations]);

    const handleRenameChat = useCallback((chatId: string, newTitle: string) => {
        setConversations(prev => prev.map(c =>
            c.id === chatId ? { ...c, title: newTitle, updatedAt: Date.now() } : c
        ));
    }, []);

    const handleDeleteChat = useCallback((chatId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setConversations(prev => prev.filter(c => c.id !== chatId));
        if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
        }
    }, [currentChatId]);

    const isHero = messages.length === 0 && !isLoading;

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
                            : { scale: 1, opacity: 1, y: 0 }
                    }
                    transition={{
                        scale: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.25 },
                        y: { duration: 0.25 }
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
                                        {/* <span className="app__title-english">Akhi AI</span> */}
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
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </button>
                                    <button
                                        className="app__action-btn"
                                        onClick={handleOpenHistory}
                                        title="History"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                            <path d="M3 3v5h5" />
                                            <path d="M12 7v5l4 2" />
                                        </svg>
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

                        {showHistory && (
                            <motion.div
                                key="history-modal"
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
                                <HistoryModal
                                    isOpen={true}
                                    onClose={handleCloseModal}
                                    chats={conversations}
                                    currentChatId={currentChatId}
                                    onSelectChat={handleSelectChat}
                                    onDeleteChat={handleDeleteChat}
                                    onRenameChat={handleRenameChat}
                                    onNewChat={startNewChat}
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
                onClearChat={handleCloseChat}
            />

            {/* Footer - only show on welcome screen, hide during chat */}
            {isHero && (
                <footer className="app__footer">
                    <p className="app__footer-copyright">
                        © {new Date().getFullYear()} Akhi AI by <a href="https://theoneatom.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>The One Atom</a>
                        <span className="app__footer-divider">·</span>
                        <a href="/about/" className="app__about-link">About</a>
                        <span className="app__footer-divider">·</span>
                        <a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noopener noreferrer" className="app__about-link">Support</a>
                    </p>
                </footer>
            )}
        </div>
    );
}
