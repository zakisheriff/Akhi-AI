import React, { useState } from 'react';
import TypewriterText from './TypewriterText';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message, isUser, isTyping = false, onTypingComplete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Helper to parse text with Bold and Italic tags
  const parseBoldAndItalic = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="message-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <strong key={index} className="message-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // Parse and render markdown links as clickable anchors
  const renderWithFormatting = (text) => {
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      parts.push({
        type: 'link',
        text: match[1],
        url: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts.map((part, index) => {
      if (part.type === 'link') {
        return (
          <a
            key={index}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="message-link"
          >
            {part.text}
            <span className="message-link__icon">↗</span>
          </a>
        );
      }
      return <span key={index}>{parseBoldAndItalic(part.content)}</span>;
    });
  };

  // Format text content - handle line breaks, headers, and references
  const formatTextContent = (text) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Handle Headers
      if (trimmedLine.startsWith('## ')) {
        return <h3 key={index} className="message-heading-h3">{renderWithFormatting(trimmedLine.slice(3))}</h3>;
      }
      if (trimmedLine.startsWith('### ')) {
        return <h4 key={index} className="message-heading-h4">{renderWithFormatting(trimmedLine.slice(4))}</h4>;
      }
      if (trimmedLine.startsWith('#### ')) {
        return <h5 key={index} className="message-heading-h5">{renderWithFormatting(trimmedLine.slice(5))}</h5>;
      }

      // Check if it's a sources section header
      const isSourcesHeader = /^(📚\s*Sources?|References?|Source|Cited from)/i.test(trimmedLine);
      if (isSourcesHeader) {
        return (
          <React.Fragment key={index}>
            <span className="message-sources-header">{renderWithFormatting(line)}</span>
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      // Check references
      const hasReference = /(Surah|Surah\s+\w+|\d+:\d+)|(Sahih|Sunan|Musnad|Jami'|Hadith)/i.test(line);
      if (hasReference || /^[-•]\s/.test(trimmedLine)) {
        return (
          <React.Fragment key={index}>
            <div className="message-list-item">
              <span className="message-list-bullet">•</span>
              <span className="message-reference-text">{renderWithFormatting(line.replace(/^[-•]\s/, ''))}</span>
            </div>
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      // Standard line
      return (
        <React.Fragment key={index}>
          {renderWithFormatting(line)}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  // Clean markdown
  const cleanMarkdown = (text) => {
    let cleaned = text
      .replace(/\\n/g, '\n')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^---+$/gm, '')
      .replace(/^--\s*/gm, '• ')
      .replace(/(\w)\s*--+\s*(\w)/g, '$1 — $2')
      .replace(/--/g, '')
      .replace(/^-\s+/gm, '• ')
      .replace(/^\*\s+/gm, '• ')
      .replace(/^>\s*/gm, '')
      .replace(/•\s*\n\s*/g, '• ')
      .replace(/\n{2,}/g, '\n')
      .trim();

    return cleaned;
  };

  const processedMessage = cleanMarkdown(message);

  return (
    <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
      <div className="message-bubble__content">
        {isUser ? (
          formatTextContent(processedMessage)
        ) : isTyping ? (
          <TypewriterText
            text={processedMessage}
            speed={1}
            onComplete={onTypingComplete}
            renderContent={(txt) => formatTextContent(txt)}
          />
        ) : (
          formatTextContent(processedMessage)
        )}
      </div>
      {!isTyping && (
        <div className="message-bubble__actions">
          <button
            className="message-bubble__copy-btn"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
