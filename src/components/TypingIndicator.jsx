import React from "react";
import "../styles/TypingIndicator.css";

const TypingIndicator = () => {
  return (
    <div className="typing-indicator">
      <div className="typing-indicator__content">
        <span className="typing-indicator__text">Al-Ilm AI is thinking</span>
        <span className="typing-indicator__dots">
          <span className="typing-indicator__dot">.</span>
          <span className="typing-indicator__dot">.</span>
          <span className="typing-indicator__dot">.</span>
        </span>
        <span className="typing-indicator__cursor">|</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
