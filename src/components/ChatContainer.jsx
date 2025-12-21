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

  // Handle scroll behavior robustly - ScrollTop is king
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Auto-scroll logic
  useEffect(() => {
    scrollToBottom();
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Handle when typewriter effect completes
  const handleTypingComplete = useCallback(() => {
    setTypingMessageIndex(-1);
  }, []);

  return (
    <div className="chat-container" ref={containerRef}>
      <div className="chat-container__messages" ref={messagesContainerRef}>
        {messages.length === 0 && !isLoading && (
          <div className="chat-container__welcome">
            <div className="chat-container__welcome-icon">🕌</div>
            <h2 className="chat-container__welcome-title">Assalamu Alaikum</h2>
            <p className="chat-container__welcome-text">
              Welcome to Al-Ilm AI. Ask me any question about Islam, and I'll provide you with authentic answers and references from the Quran, Hadith, and recognized scholars.
            </p>
            <div className="chat-container__welcome-suggestions">
              <span className="chat-container__suggestion">What is the importance of Salah?</span>
              <span className="chat-container__suggestion">Explain Surah Al-Fatiha</span>
              <span className="chat-container__suggestion">What are the pillars of Islam?</span>
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
            <TypingIndicator />
          </div>
        )}

        {error && (
          <div className="chat-container__error">
            <span className="chat-container__error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatContainer;
