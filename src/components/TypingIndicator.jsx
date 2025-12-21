import React, { useState, useEffect } from "react";
import "../styles/TypingIndicator.css";

const defaultMessages = [
  "Al-Ilm is researching",
  "Consulting authentic sources",
  "Searching the Quran & Hadith",
  "Finding scholarly wisdom",
  "Gathering Islamic knowledge"
];

const TypingIndicator = ({ context }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const indicatorRef = React.useRef(null);

  // Determine if the query is a simple greeting
  const isGreeting = React.useMemo(() => {
    if (!context) return false;
    const clean = context.toLowerCase().trim();
    // Check for short greetings or common salams
    return clean.length < 20 && /^(hi|hello|hey|salam|slm|as-salamu|assalamu|peace)/.test(clean);
  }, [context]);

  const activeMessages = isGreeting ? ["Al-Ilm is replying"] : defaultMessages;

  // Force scroll into view on mount - critical fix for visibility
  useEffect(() => {
    if (indicatorRef.current) {
      indicatorRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      // Force confirm
      setTimeout(() => {
        if (indicatorRef.current) indicatorRef.current.scrollIntoView({ behavior: 'auto', block: 'end' });
      }, 100);
    }
  }, []);

  // Rotate through loading messages
  useEffect(() => {
    // No rotation for greetings
    if (isGreeting) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % activeMessages.length);
        setIsTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeMessages.length, isGreeting]);

  return (
    <div className="typing-indicator" ref={indicatorRef}>
      <div className="typing-indicator__content">
        <div className="typing-indicator__icon">
          <div className="typing-indicator__book">📖</div>
        </div>
        <div className="typing-indicator__text-container">
          <span className={`typing-indicator__text ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            {activeMessages[messageIndex]}
          </span>
          <span className="typing-indicator__dots">
            <span className="typing-indicator__dot"></span>
            <span className="typing-indicator__dot"></span>
            <span className="typing-indicator__dot"></span>
          </span>
        </div>
      </div>
      <div className="typing-indicator__shimmer"></div>
    </div>
  );
};

export default TypingIndicator;
