'use client';

import React, { useState, useEffect, useRef } from 'react';
import TypewriterText from './TypewriterText';
import QuranVerse from './QuranVerse';
import HadithCard from './HadithCard';
import { cleanTextForSpeech } from '@/utils/textProcessor';
import '@/styles/MessageBubble.css';

interface MessageBubbleProps {
    message: string;
    isUser: boolean;
    isTyping?: boolean;
    onTypingComplete?: () => void;
}

// Global variable to ensure only one audio plays at a time
let currentAudio: HTMLAudioElement | null = null;

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser, isTyping = false, onTypingComplete }) => {
    // State for text selection
    const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
    const bubbleRef = useRef<HTMLDivElement>(null);

    // Resotred States
    const [copied, setCopied] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // New state for Pause
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [selectionLoading, setSelectionLoading] = useState(false); // Specific loading for selection
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Stop audio when component unmounts or new audio starts
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle text selection to show floating button (Desktop & Mobile)
    useEffect(() => {
        if (isUser) return; // Only for AI messages

        // We use a small timeout for mobile to ensure selection is populated
        const handleSelection = () => {
            setTimeout(() => {
                const sel = window.getSelection();
                if (!sel || sel.rangeCount === 0) {
                    setSelection(null);
                    return;
                }

                const text = sel.toString().trim();
                // Requirement: minimal length to trigger
                if (text.length < 2) {
                    setSelection(null);
                    return;
                }

                // Verify selection is inside this specific bubble
                if (bubbleRef.current && bubbleRef.current.contains(sel.anchorNode)) {
                    const range = sel.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

                    // Calculate position relative to viewport - below selection for Android
                    setSelection({
                        text: text,
                        top: rect.bottom + 10, // Below the selection to avoid Android's native menu
                        left: rect.left + (rect.width / 2) // Centered
                    });
                } else {
                    setSelection(null);
                }
            }, 10);
        };

        // Desktop
        document.addEventListener('mouseup', handleSelection);
        // Mobile - essential for selection menu to not override immediate deselect
        document.addEventListener('touchend', handleSelection);

        // Clear on click/touch outside
        const handleClear = (e: Event) => {
            if ((e.target as Element).closest('.selection-voice-btn')) return;
            // We rely on handleSelection logic to clear invalid states
        };

        document.addEventListener('mousedown', handleClear);
        document.addEventListener('touchstart', handleClear);

        // Android compatibility - selectionchange fires more reliably on Android
        document.addEventListener('selectionchange', handleSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('touchend', handleSelection);
            document.removeEventListener('mousedown', handleClear);
            document.removeEventListener('touchstart', handleClear);
            document.removeEventListener('selectionchange', handleSelection);
        };
    }, [isUser]);

    const handleStopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setIsPaused(false);
        }
    };

    const handlePlayAudio = async (textOverride?: string) => {
        // Case 1: Resume from Pause (Main Button only)
        if (!textOverride && isPaused && audioRef.current) {
            try {
                await audioRef.current.play();
                setIsPlaying(true);
                setIsPaused(false);
            } catch (e) {
                console.error("Resume failed", e);
                // If resume fails, restart
                handleStopAudio();
            }
            return;
        }

        // Case 2: Pause (Main Button only)
        if (!textOverride && isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            setIsPaused(true);
            return;
        }

        // Case 3: Start New Audio (Selection or Fresh Start)

        // Stop any existing local audio
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0; // Reset completely
            setIsPlaying(false);
            setIsPaused(false);
        }

        // Stop any other global audio
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }

        const rawText = textOverride || message;
        // Clean text before sending to API (removes headers, markdown, etc.)
        const textToSpeak = cleanTextForSpeech(rawText);

        const isSelection = !!textOverride;

        if (isSelection) setSelectionLoading(true);
        else setIsAudioLoading(true);

        try {
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'TTS Failed');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);

            audioRef.current = audio;
            currentAudio = audio;

            audio.onended = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };
            audio.onpause = () => {
                // checking pause state logic managed by handlers
            };
            audio.onerror = () => {
                setIsPlaying(false);
                setIsPaused(false);
                setIsAudioLoading(false);
                setSelectionLoading(false);
            };

            await audio.play();
            setIsPlaying(true);
            setIsPaused(false);

            if (isSelection) {
                setSelection(null); // Hide tooltip after starting
            }
        } catch (error) {
            console.error('Audio Error:', error);
            setIsPlaying(false);
        } finally {
            setIsAudioLoading(false);
            setSelectionLoading(false);
        }
    };

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
    const parseBoldAndItalic = (text: string): React.ReactNode[] => {
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
    const renderWithFormatting = (text: string): React.ReactNode[] => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts: Array<{ type: 'text' | 'link'; content?: string; text?: string; url?: string }> = [];
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
            return <span key={index}>{parseBoldAndItalic(part.content || '')}</span>;
        });
    };

    // Format text content - handle line breaks, headers, references, Quran verses, and Hadiths
    const formatTextContent = (text: string): React.ReactNode[] | React.ReactNode => {
        const quranCitationRegex = /\[QURAN:(\d+):(\d+)\]/gi;
        const quranCitations: Array<{ type: 'quran'; fullMatch: string; verseKey: string; index: number }> = [];
        let match;

        while ((match = quranCitationRegex.exec(text)) !== null) {
            quranCitations.push({
                type: 'quran',
                fullMatch: match[0],
                verseKey: `${match[1]}:${match[2]}`,
                index: match.index
            });
        }

        const hadithCitationRegex = /\[HADITH:(bukhari|muslim|abudawud|ibnmajah|tirmidhi):(\d+)\]/gi;
        const hadithCitations: Array<{ type: 'hadith'; fullMatch: string; collection: string; id: number; index: number }> = [];

        while ((match = hadithCitationRegex.exec(text)) !== null) {
            hadithCitations.push({
                type: 'hadith',
                fullMatch: match[0],
                collection: match[1].toLowerCase(),
                id: parseInt(match[2]),
                index: match.index
            });
        }

        const allCitations = [...quranCitations, ...hadithCitations].sort((a, b) => a.index - b.index);

        if (allCitations.length > 0) {
            const parts: React.ReactNode[] = [];
            let remainingText = text;
            let partIndex = 0;

            for (const citation of allCitations) {
                const splitIndex = remainingText.indexOf(citation.fullMatch);

                if (splitIndex > 0) {
                    const beforeText = remainingText.substring(0, splitIndex);
                    parts.push(
                        <React.Fragment key={`text-${partIndex}`}>
                            {formatTextLines(beforeText)}
                        </React.Fragment>
                    );
                    partIndex++;
                }

                if (citation.type === 'quran') {
                    parts.push(
                        <QuranVerse
                            key={`quran-${citation.verseKey}-${partIndex}`}
                            verseKey={citation.verseKey}
                            compact={true}
                        />
                    );
                } else if (citation.type === 'hadith') {
                    parts.push(
                        <HadithCard
                            key={`hadith-${citation.collection}-${citation.id}-${partIndex}`}
                            collection={citation.collection}
                            hadithId={citation.id}
                            compact={true}
                        />
                    );
                }
                partIndex++;

                remainingText = remainingText.substring(splitIndex + citation.fullMatch.length);
            }

            if (remainingText.trim()) {
                parts.push(
                    <React.Fragment key={`text-${partIndex}`}>
                        {formatTextLines(remainingText)}
                    </React.Fragment>
                );
            }

            return parts;
        }

        return formatTextLines(text);
    };

    const formatTextLines = (text: string): React.ReactNode[] => {
        const lines = text.split('\n');

        return lines.map((line, index) => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('## ')) {
                return <h3 key={index} className="message-heading-h3">{renderWithFormatting(trimmedLine.slice(3))}</h3>;
            }
            if (trimmedLine.startsWith('### ')) {
                return <h4 key={index} className="message-heading-h4">{renderWithFormatting(trimmedLine.slice(4))}</h4>;
            }
            if (trimmedLine.startsWith('#### ')) {
                return <h5 key={index} className="message-heading-h5">{renderWithFormatting(trimmedLine.slice(4))}</h5>;
            }

            const isDisclaimerNote = /^(\*)?Note:\s*This is educational information/i.test(trimmedLine) ||
                /This is educational information, not a formal Fatwa/i.test(trimmedLine);
            if (isDisclaimerNote) {
                const cleanedText = trimmedLine.replace(/^\*|\*$/g, '').trim();
                return (
                    <p key={index} className="message-fatwa-disclaimer">
                        {cleanedText}
                    </p>
                );
            }

            const isSourcesHeader = /^(📚\s*Sources?|References?|Source|Cited from)/i.test(trimmedLine);
            if (isSourcesHeader) {
                return (
                    <React.Fragment key={index}>
                        <span className="message-sources-header">{renderWithFormatting(line)}</span>
                        {index < lines.length - 1 && <br />}
                    </React.Fragment>
                );
            }

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

            return (
                <React.Fragment key={index}>
                    {renderWithFormatting(line)}
                    {index < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

    const cleanMarkdown = (text: string): string => {
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
            .replace(/Prophet\s*(Muhammad|Mohammad)?\s*(\(\s*\)|said|taught|mentioned)/gi, 'Prophet Muhammad ﷺ $2')
            .replace(/The\s+Messenger\s+of\s+Allah\s+(\(\s*\)|said|taught)/gi, 'The Messenger of Allah ﷺ $1')
            .replace(/\(\s*\)/g, '')
            .trim();

        return cleaned;
    };

    const processedMessage = cleanMarkdown(message);

    const isArabicText = (text: string) => /[\u0600-\u06FF]/.test(text);
    const hasActiveAudio = isPlaying || isPaused;

    return (
        <div ref={bubbleRef} className={`message-bubble ${isUser ? 'message-bubble--user' : 'message-bubble--ai'}`}>
            <div className="message-bubble__content">
                {isUser ? (
                    formatTextContent(processedMessage)
                ) : isTyping ? (
                    <TypewriterText
                        text={processedMessage}
                        speed={1}
                        onComplete={onTypingComplete}
                        renderContent={(txt: string) => formatTextContent(txt)}
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
                    {/* Voice Controls - Always available for AI messages */}
                    {!isUser && (
                        <>
                            {/* Stop Button (Only when active) */}
                            {hasActiveAudio && !isAudioLoading && (
                                <button
                                    className="message-bubble__copy-btn"
                                    onClick={handleStopAudio}
                                    title="Stop Completely"
                                    style={{ marginLeft: '8px', color: '#ff6b6b', borderColor: 'rgba(255,107,107,0.3)', background: 'rgba(255,107,107,0.1)' }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                                        <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
                                    </svg>
                                    <span>Stop</span>
                                </button>
                            )}

                            <button
                                className={`message-bubble__copy-btn ${hasActiveAudio ? 'message-bubble__voice-btn--active' : ''}`}
                                onClick={() => handlePlayAudio()}
                                disabled={isAudioLoading}
                                title={isPlaying ? "Pause" : isPaused ? "Resume" : "Read Aloud"}
                                style={{ marginLeft: '8px' }}
                            >
                                {isAudioLoading ? (
                                    <>
                                        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                        </svg>
                                        <span className="voice-spinner">Loading...</span>
                                    </>
                                ) : isPlaying ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="6" y="4" width="4" height="16"></rect>
                                            <rect x="14" y="4" width="4" height="16"></rect>
                                        </svg>
                                        <span>Pause</span>
                                    </>
                                ) : isPaused ? (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                        </svg>
                                        <span>Resume</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                        </svg>
                                        <span>Listen</span>
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Floating Selection Tooltip */}
            {selection && (
                <div
                    className="selection-voice-btn"
                    style={{
                        position: 'fixed',
                        top: selection.top,
                        left: selection.left,
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isArabicText(selection.text)) {
                                handlePlayAudio(selection.text);
                            }
                        }}
                        className="message-bubble__copy-btn"
                        disabled={selectionLoading || isArabicText(selection.text)}
                        style={{
                            background: '#1a1a1a',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: isArabicText(selection.text) ? '#ff6b6b' : '#e6c98a',
                            cursor: isArabicText(selection.text) ? 'not-allowed' : 'pointer',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {selectionLoading ? (
                            <>
                                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                                </svg>
                                <span>Loading...</span>
                            </>
                        ) : isArabicText(selection.text) ? (
                            <>
                                <span>⚠️ Cannot read Arabic</span>
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                                </svg>
                                <span>Listen to Selection</span>
                            </>
                        )}
                    </button>
                    {/* Tiny arrow */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        background: '#1a1a1a',
                        borderBottom: '1px solid rgba(255,255,255,0.2)',
                        borderRight: '1px solid rgba(255,255,255,0.2)'
                    }} />
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
