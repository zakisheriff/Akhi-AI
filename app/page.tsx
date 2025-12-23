'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatContainer from '@/components/ChatContainer';
import AmbientBackground from '@/components/AmbientBackground';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaFinder from '@/components/QiblaFinder';
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

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genZMode, setGenZMode] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [showQibla, setShowQibla] = useState(false);

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

  // Determine if Dynamic Island is expanded
  const isExpanded = showPrayerTimes || showQibla;

  const handleCloseModal = () => {
    setShowPrayerTimes(false);
    setShowQibla(false);
  };

  return (
    <div className="app">
      {isHero && <AmbientBackground />}

      {/* Overlay behind expanded Dynamic Island */}
      <div
        className={`app__modal-overlay ${isExpanded ? 'app__modal-overlay--visible' : ''}`}
        onClick={handleCloseModal}
      />

      {/* Header Positioning Container */}
      <div className="app__header-wrapper">
        <motion.header
          className={`app__header ${isExpanded ? 'app__header--expanded' : ''}`}
          layout
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          animate={{
            // borderRadius handled by layout + CSS classes
          }}
          style={{
            overflow: "hidden" // Ensure content is clipped during shrink
          }}
        >
          {/* AnimatePresence without mode='wait' allows crossfade and prevents the 'blink' gap */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                key="collapsed"
                className="app__header-inner-collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, position: 'absolute' }}
                transition={{ duration: 0.2 }}
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
                    onClick={() => setShowQibla(true)}
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
                    onClick={() => setShowPrayerTimes(true)}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  filter: "blur(10px)",
                  position: 'absolute',
                  top: 0,
                  left: "50%",
                  x: "-50%"
                }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', height: '100%' }}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  filter: "blur(10px)",
                  position: 'absolute',
                  top: 0,
                  left: "50%",
                  x: "-50%"
                }}
                transition={{ duration: 0.2 }}
                style={{ width: '100%', height: '100%' }}
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
          © {new Date().getFullYear()} Akhi AI by <a href="https://twitter.com/theoneatom" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>The One Atom</a>
          <span className="app__footer-divider">·</span>
          <a href="/about" className="app__about-link">About Us</a>
          <span className="app__footer-divider">·</span>
          <a href="https://buymeacoffee.com/theoneatom" target="_blank" rel="noopener noreferrer" className="app__about-link">Support</a>
        </p>
      </footer>
    </div>
  );
}
