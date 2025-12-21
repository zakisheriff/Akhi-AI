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
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
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
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default ChatInput;

