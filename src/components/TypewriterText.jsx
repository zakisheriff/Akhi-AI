import React, { useState, useEffect, useRef } from 'react';
import '../styles/TypewriterText.css';

const TypewriterText = ({
  text,
  speed = 2,
  onComplete,
  isComplete = false,
  renderContent
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    // If already complete, show full text immediately
    if (isComplete) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    // If text length increased, we are streaming, don't reset index
    if (text.startsWith(displayedText) && text.length > displayedText.length) {
      setIsTyping(true);
      return;
    }

    // New message or completely different text
    if (text !== displayedText.substring(0, currentIndex)) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsTyping(true);
    }
  }, [text, isComplete]);

  useEffect(() => {
    if (isComplete || currentIndex >= text.length) {
      if (currentIndex >= text.length && !isComplete) {
        setIsTyping(false);
        onComplete?.();
      }
      return;
    }

    // Start typing
    const typeNextChar = () => {
      if (currentIndex >= text.length) {
        setIsTyping(false);
        onComplete?.();
        return;
      }

      setDisplayedText(text.substring(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    };

    const getDelay = () => {
      if (currentIndex >= text.length) return 0;
      const char = text[currentIndex];
      // Brief pause at sentence endings
      if (['.', '!', '?'].includes(char)) return speed * 5;
      if (char === '\n') return speed * 3;
      return speed;
    };

    const timer = setTimeout(typeNextChar, getDelay());
    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isComplete, onComplete]);

  return (
    <div className="typewriter-container" ref={containerRef}>
      <span className="typewriter-text">
        {renderContent ? renderContent(displayedText) : displayedText}
      </span>
      {isTyping && <span className="typewriter-cursor">|</span>}
    </div>
  );
};

export default TypewriterText;
