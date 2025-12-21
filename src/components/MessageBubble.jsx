import React from 'react';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message, isUser }) => {
  // Remove markdown formatting (**, __, etc.)
  const stripMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
      .replace(/__(.*?)__/g, '$1') // Remove __bold__
      .replace(/_(.*?)_/g, '$1') // Remove _italic_
      .replace(/~~(.*?)~~/g, '$1') // Remove ~~strikethrough~~
      .replace(/`(.*?)`/g, '$1') // Remove `code`
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Remove links, keep text
  };

  // Format the message text - preserve line breaks and format references
  const formatMessage = (text) => {
    // Strip markdown first
    const cleanText = stripMarkdown(text);
    // Split by line breaks and preserve them
    const lines = cleanText.split('\n');
    
    return lines.map((line, index) => {
      // Check if line contains references (Surah:Verse or Hadith citations)
      const hasReference = /(Surah|Surah\s+\w+|\d+:\d+)|(Sahih|Sunan|Musnad|Jami'|Hadith)/i.test(line);
      
      // If line is a reference or starts with common reference patterns, style it
      if (hasReference || /^(References?|Source|Cited from)/i.test(line.trim())) {
        return (
          <React.Fragment key={index}>
            <span className="message-reference">{line}</span>
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      return (
        <React.Fragment key={index}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
      <div className="message-bubble__content">
        {formatMessage(message)}
      </div>
    </div>
  );
};

export default MessageBubble;

