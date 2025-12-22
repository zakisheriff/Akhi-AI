import React, { useState, useCallback, useEffect } from 'react';
import ChatContainer from './components/ChatContainer';
import AmbientBackground from './components/AmbientBackground';
import PrayerTimes from './components/PrayerTimes';
import QiblaFinder from './components/QiblaFinder';
import { sendMessage } from './services/openaiService';
import { SCHOOLS } from './utils/systemPrompt';
import './styles/App.css';

// Reset scroll to top on initial load
const useScrollReset = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);
};

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [genZMode, setGenZMode] = useState(false);
  const [showPrayerTimes, setShowPrayerTimes] = useState(false);
  const [showQibla, setShowQibla] = useState(false);

  // Reset scroll to top on initial load
  useScrollReset();

  const isHero = messages.length === 0 && !isLoading;

  const handleSendMessage = useCallback(async (userMessage) => {
    // Add user message to chat
    const userMessageObj = { role: 'user', text: userMessage };
    setMessages((prevMessages) => [...prevMessages, userMessageObj]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for context (excluding system message)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.text
      }));

      // Send message to OpenAI with genZMode flag
      const aiResponse = await sendMessage(userMessage, SCHOOLS.GENERAL, conversationHistory, genZMode);

      // Add AI response to chat
      const aiMessageObj = { role: 'assistant', text: aiResponse };
      setMessages((prevMessages) => [...prevMessages, aiMessageObj]);
    } catch (err) {
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

  return (
    <div className="app">
      {isHero && <AmbientBackground />}
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__title-arabic">أخي</span>
            <span className="app__title-english">Akhi AI</span>
            <span className="app__title-seo">– Your Brother in Faith & Knowledge</span>
          </h1>
        </div>
        <div className="app__header-actions">
          <button
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
            className="app__action-btn"
            onClick={() => setShowPrayerTimes(true)}
            title="Prayer Times"
          >
            🕌
          </button>
        </div>
      </header>

      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        error={error}
        genZMode={genZMode}
        onToggleGenZMode={handleToggleGenZMode}
      />

      {/* Prayer Times Modal */}
      <PrayerTimes
        isOpen={showPrayerTimes}
        onClose={() => setShowPrayerTimes(false)}
      />

      {/* Qibla Finder Modal */}
      <QiblaFinder
        isOpen={showQibla}
        onClose={() => setShowQibla(false)}
      />

      {/* Footer */}
      <footer className="app__footer">
        <p className="app__footer-copyright">
          © Akhi AI – Your Brother in Faith & Knowledge
          <span className="app__footer-divider">·</span>
          <a href="/about.html" className="app__about-link">About Akhi AI</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
