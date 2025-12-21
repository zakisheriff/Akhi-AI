import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import '../styles/ChatContainer.css';

const ChatContainer = ({ messages, isLoading, onSendMessage, error }) => {
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <div className="chat-container" ref={containerRef}>
      <div className="chat-container__messages">
        {messages.length === 0 && !isLoading && (
          <div className="chat-container__welcome">
            <h2 className="chat-container__welcome-title">Assalamu Alaikum</h2>
            <p className="chat-container__welcome-text">
              Welcome to Al-Ilm AI. Ask me any question about Islam, and I'll provide you with authentic answers and references from the Quran, Hadith, and recognized scholars.
            </p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message.text}
            isUser={message.role === 'user'}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        {error && (
          <div className="chat-container__error">
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

