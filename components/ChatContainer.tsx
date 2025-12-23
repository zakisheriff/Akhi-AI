'use client';

import React, { useEffect, useRef, useState, useCallback, TouchEvent } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';
import '@/styles/ChatContainer.css';

interface Message {
    role: 'user' | 'assistant';
    text: string;
    isUser?: boolean;
}

interface ChatContainerProps {
    messages: Message[];
    isLoading: boolean;
    onSendMessage: (message: string) => void;
    error: string | null;
    genZMode: boolean;
    onToggleGenZMode: () => void;
}

const MOBILE_QNA = [
    { q: "Is fasting without Suhoor valid?", a: "Yes, Suhoor is Sunnah" },
    { q: "Jummah rak'ahs?", a: "2 rak'ahs total" },
    { q: "What breaks Wudu?", a: "Wind, urine, sleep" },
    { q: "Laylatul Qadr?", a: "Night better than 1000 months" },
    { q: "Zakat Nisaab?", a: "85g gold or 595g silver" },
    { q: "Tahajjud timing?", a: "After sleep, before Fajr" },
];

const ChatContainer: React.FC<ChatContainerProps> = ({ messages, isLoading, onSendMessage, error, genZMode, onToggleGenZMode }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [typingMessageIndex, setTypingMessageIndex] = useState(-1);

    useEffect(() => {
        if (messagesContainerRef.current && messages.length === 0) {
            messagesContainerRef.current.scrollTop = 0;
        }
    }, []);

    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'assistant') {
                setTypingMessageIndex(messages.length - 1);
            }
        }
    }, [messages, isLoading]);

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            const timer = setTimeout(() => scrollToBottom('smooth'), 200);
            return () => clearTimeout(timer);
        }
    }, [messages, isLoading]);

    const handleTypingComplete = useCallback(() => {
        setTypingMessageIndex(-1);
    }, []);

    useEffect(() => {
        const handleTouchStart = (e: globalThis.TouchEvent) => {
            if (e.touches && e.touches[0] && e.touches[0].clientY < 50) {
                if (messagesContainerRef.current && messagesContainerRef.current.scrollTop > 0) {
                    e.preventDefault();
                    messagesContainerRef.current.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: false });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
        };
    }, []);

    const isHero = messages.length === 0 && !isLoading;

    return (
        <div className={`chat-container ${isHero ? 'chat-container--hero' : ''}`} ref={containerRef}>
            <div className="chat-container__messages" ref={messagesContainerRef}>
                <div className="chat-container__messages-inner">
                    {messages.length === 0 && !isLoading && (
                        <div className="chat-container__welcome">
                            <div className="chat-container__welcome-icon">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="welcome-islam-logo"
                                >
                                    <path
                                        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C13.5658 22 15.0354 21.64 16.3475 21C11.5 20.5 7.5 16.5 7.5 12C7.5 7.5 11.5 3.5 16.3475 3C15.0354 2.36 13.5658 2 12 2Z"
                                        fill="var(--color-gold)"
                                    />
                                    <path
                                        d="M19 9.5L20 12L22.5 12L20.5 14L21 16.5L19 15L17 16.5L17.5 14L15.5 12L18 12L19 9.5Z"
                                        fill="var(--color-gold)"
                                    />
                                </svg>
                            </div>
                            <h2 className="chat-container__welcome-title">Assalamu Alaikum</h2>
                            <p className="chat-container__welcome-text">
                                Welcome to <span className="chat-container__welcome-highlight">Akhi AI</span> – your Islamic AI assistant, providing authentic answers based on the Quran, Hadith, and trusted Islamic scholarship.
                            </p>
                            <div className="chat-container__welcome-suggestions">
                                {[
                                    "What is the importance of Salah?",
                                    "Explain Surah Al-Fatiha in detail",
                                    "Do we fast to feel the hunger of the poor?",
                                    "Is celebrating Mawlid an authentic practice?",
                                ].map((suggestion, index) => (
                                    <button
                                        key={index}
                                        className="chat-container__suggestion"
                                        onClick={() => onSendMessage(suggestion)}
                                        type="button"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                            <p className="chat-container__disclaimer">
                                ⚠️ This is an educational AI tool, not a replacement for qualified scholars. Please verify important rulings with a local Mufti or Imam.
                            </p>

                            <div className="chat-container__mobile-ambient">
                                <div className="chat-container__mobile-ambient-track">
                                    {MOBILE_QNA.map((item, i) => (
                                        <div key={i} className="chat-container__mobile-qna-card">
                                            <span className="chat-container__mobile-qna-q">{item.q}</span>
                                            <span className="chat-container__mobile-qna-a">{item.a}</span>
                                        </div>
                                    ))}
                                    {MOBILE_QNA.map((item, i) => (
                                        <div key={`dup-${i}`} className="chat-container__mobile-qna-card">
                                            <span className="chat-container__mobile-qna-q">{item.q}</span>
                                            <span className="chat-container__mobile-qna-a">{item.a}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => (
                        <MessageBubble
                            key={index}
                            message={message.text}
                            isUser={message.role === 'user'}
                            isTyping={!message.isUser && index === typingMessageIndex}
                            onTypingComplete={handleTypingComplete}
                        />
                    ))}

                    {isLoading && (
                        <div style={{ minHeight: '80px', width: '100%', display: 'flex', flexDirection: 'column' }}>
                            <TypingIndicator context={messages[messages.length - 1]?.text} />
                        </div>
                    )}

                    {error && (
                        <div className="chat-container__error">
                            <span className="chat-container__error-icon">⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <ChatInput
                onSendMessage={onSendMessage}
                disabled={isLoading}
                genZMode={genZMode}
                onToggleGenZMode={onToggleGenZMode}
            />
        </div>
    );
};

export default ChatContainer;
