import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatInput.css';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedValue = inputValue.trim();

    if (trimmedValue && !disabled) {
      onSendMessage(trimmedValue);
      setInputValue('');
      // Reset textarea height and blur to dismiss keyboard on mobile
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.blur();
      }
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <div className="chat-input__container">
        <textarea
          ref={textareaRef}
          className="chat-input__field"
          placeholder="Ask a question about Islam…"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows="1"
          aria-label="Ask a question about Islam"
        />
        <button
          type="submit"
          className="chat-input__button"
          disabled={disabled || !inputValue.trim()}
          aria-label="Send message"
        >
          <svg
            className="chat-input__icon"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Sleek Rocket Body */}
            <path
              d="M12 3C10 6 7 10 7 15C7 17 8.5 18.5 10 18.5L12 17L14 18.5C15.5 18.5 17 17 17 15C17 10 14 6 12 3Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Fins */}
            <path d="M7 15L4 18V20L7 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M17 15L20 18V20L17 18.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            {/* Flame */}
            <path d="M11 20L12 22L13 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

