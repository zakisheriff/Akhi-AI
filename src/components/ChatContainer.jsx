import React, { useEffect, useRef, useState, useCallback } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import '../styles/ChatContainer.css';

const ChatContainer = ({ messages, isLoading, onSendMessage, error }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const containerRef = useRef(null);
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1);

  // Track which AI message is currently being typed
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Start typewriter effect for the latest AI message
      if (lastMessage.role === 'assistant') {
        setTypingMessageIndex(messages.length - 1);
      }
    }
  }, [messages, isLoading]);

  // Handle scroll behavior robustly
  const scrollToBottom = (behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Auto-scroll logic when messages change or loading state changes
  useEffect(() => {
    // Smooth scroll with a short delay to ensure content is ready
    const timer = setTimeout(() => scrollToBottom('smooth'), 200);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Handle when typewriter effect completes
  const handleTypingComplete = useCallback(() => {
    setTypingMessageIndex(-1);
  }, []);

  // Determine if we are in "Hero" mode (no messages yet)
  const isHero = messages.length === 0 && !isLoading;

  return (
    <div className={`chat-container ${isHero ? 'chat-container--hero' : ''}`} ref={containerRef}>
      <div className="chat-container__messages" ref={messagesContainerRef}>
        <div className="chat-container__messages-inner">
          {messages.length === 0 && !isLoading && (
            <div className="chat-container__welcome">
              <div className="chat-container__welcome-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="welcome-islam-logo"
                >
                  <path
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C13.5658 22 15.0354 21.64 16.3475 21C11.5 20.5 7.5 16.5 7.5 12C7.5 7.5 11.5 3.5 16.3475 3C15.0354 2.36 13.5658 2 12 2Z"
                    fill="var(--color-gold)"
                  />
                  <path
                    d="M19 9.5L20 12L22.5 12L20.5 14L21 16.5L19 15L17 16.5L17.5 14L15.5 12L18 12L19 9.5Z"
                    fill="var(--color-gold)"
                  />
                </svg>
              </div>
              <h2 className="chat-container__welcome-title">Assalamu Alaikum</h2>
              <p className="chat-container__welcome-text">
                Welcome to Al-Ilm. Ask me any question about Islam, and I'll provide you with authentic answers and references from the Quran, Hadith, and recognized scholars.
              </p>
              <div className="chat-container__welcome-suggestions">
                {[
                  "What is the importance of Salah?",
                  "Explain Surah Al-Fatiha in detail",
                  "Do we fast to feel the hunger of the poor?",
                  "Is celebrating Mawlid an authentic practice?",
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    className="chat-container__suggestion"
                    onClick={() => onSendMessage(suggestion)}
                    type="button"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message.text}
              isUser={message.role === 'user'}
              isTyping={!message.isUser && index === typingMessageIndex}
              onTypingComplete={handleTypingComplete}
            />
          ))}

          {isLoading && (
            <div style={{ minHeight: '80px', width: '100%', display: 'flex', flexDirection: 'column' }}>
              <TypingIndicator context={messages[messages.length - 1]?.text} />
            </div>
          )}

          {error && (
            <div className="chat-container__error">
              <span className="chat-container__error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          {/* Internal anchor for precise scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatContainer;
