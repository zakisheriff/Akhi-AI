import React from 'react';
import TypewriterText from './TypewriterText';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message, isUser, isTyping = false, onTypingComplete }) => {

  // Helper to parse text with Bold and Italic tags
  const parseBoldAndItalic = (text) => {
    // Split by bold (** or __) AND italic (* or _)
    // Regex matches: **bold**, __bold__, *italic*, _italic_
    const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|\*(?![*\s])[^*]+(?<!\s)\*|_(?![_\s])[^_]+(?<!\s)_)/g);

    return parts.map((part, index) => {
      // Bold
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="message-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('__') && part.endsWith('__')) {
        return <strong key={index} className="message-bold">{part.slice(2, -2)}</strong>;
      }
      // Italic
      if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
        return <em key={index} className="message-italic">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  // Parse and render markdown links as clickable anchors
  // Now also handles Bold/Italic parsing inside text chunks
  const renderWithFormatting = (text) => {
    // Split by markdown link pattern [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link (parse for bold/italic)
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      // Add the link
      parts.push({
        type: 'link',
        text: match[1],
        url: match[2]
      });
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
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
      // Recursively parse bold/italic inside text chunks
      return <span key={index}>{parseBoldAndItalic(part.content)}</span>;
    });
  };

  // Format text content - handle line breaks, headers, and references
  const formatTextContent = (text) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      const trimmedLine = line.trim();

      // Handle Headers (H2-H4)
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
            {/* Render bullet point styled reference */}
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

  // Clean markdown with STRICT rules as requested
  const cleanMarkdown = (text) => {
    let cleaned = text
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^---+$/gm, '')
      .replace(/^--\s*/gm, '• ')
      .replace(/(\w)\s*--+\s*(\w)/g, '$1 — $2')
      .replace(/--/g, '')
      .replace(/^-\s+/gm, '• ')
      .replace(/^\*\s+/gm, '• ')
      // Remove blockquotes >
      .replace(/^>\s*/gm, '')
      // Remove newline between bullet and text if it exists (e.g. "• \n text" -> "• text")
      .replace(/•\s*\n\s*/g, '• ')
      // Remove < and > if used as brackets
      .replace(/</g, '')
      .replace(/>/g, '')
      // Collapse multiple newlines into max 2
      .replace(/\n{3,}/g, '\n\n');

    return cleaned;
  };

  const processedMessage = cleanMarkdown(message);

  return (
    <div className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
      <div className="message-bubble__content">
        {isUser ? (
          // User messages don't need typewriter effect
          formatTextContent(processedMessage)
        ) : isTyping ? (
          // AI messages use typewriter effect when typing
          <TypewriterText
            text={processedMessage}
            speed={1} // Super fast
            onComplete={onTypingComplete}
            renderContent={(txt) => formatTextContent(txt)}
          />
        ) : (
          // Completed AI messages render normally
          formatTextContent(processedMessage)
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
