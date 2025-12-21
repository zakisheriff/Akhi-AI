import React from 'react';
import TypewriterText from './TypewriterText';
import '../styles/MessageBubble.css';

const MessageBubble = ({ message, isUser, isTyping = false, onTypingComplete }) => {

  // Parse and render markdown links as clickable anchors
  const renderWithLinks = (text) => {
    // Split by markdown link pattern [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      // Add text before the link
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
      return <span key={index}>{formatTextContent(part.content)}</span>;
    });
  };

  // Format text content - handle line breaks and references
  const formatTextContent = (text) => {
    const lines = text.split('\n');

    return lines.map((line, index) => {
      // Check if line contains references (Surah:Verse or Hadith citations)
      const hasReference = /(Surah|Surah\s+\w+|\d+:\d+)|(Sahih|Sunan|Musnad|Jami'|Hadith)/i.test(line);

      // Check if it's a sources section header
      const isSourcesHeader = /^(📚\s*Sources?|References?|Source|Cited from)/i.test(line.trim());

      // If line is a reference or starts with common reference patterns, style it
      if (isSourcesHeader) {
        return (
          <React.Fragment key={index}>
            <span className="message-sources-header">{line}</span>
            {index < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }

      if (hasReference || /^[-•]\s/.test(line.trim())) {
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

  // Remove markdown formatting except links
  const stripMarkdownExceptLinks = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/(?<!\[)\*([^*]+)\*(?!\])/g, '$1') // Remove *italic* but not inside links
      .replace(/__(.*?)__/g, '$1') // Remove __bold__
      .replace(/(?<!\[)_([^_]+)_(?!\])/g, '$1') // Remove _italic_ but not inside links
      .replace(/~~(.*?)~~/g, '$1') // Remove ~~strikethrough~~
      .replace(/`([^`]+)`/g, '$1') // Remove `code`
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/^---+$/gm, '') // Remove horizontal rules
      .replace(/^--\s*/gm, '• ') // Convert start-of-line -- to bullet
      .replace(/(\w)\s*--+\s*(\w)/g, '$1 — $2') // Convert mid-sentence -- to em dash
      .replace(/--/g, '') // Remove remaining double dashes
      .replace(/^-\s+/gm, '• ') // Convert - bullet to •
      .replace(/^\*\s+/gm, '• '); // Convert * bullet to •
  };

  const processedMessage = stripMarkdownExceptLinks(message);

  // Render content with links for typewriter or direct display
  const renderContent = (text) => {
    return renderWithLinks(text);
  };

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
            speed={12}
            onComplete={onTypingComplete}
            renderContent={renderContent}
          />
        ) : (
          // Completed AI messages render normally
          renderWithLinks(processedMessage)
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
