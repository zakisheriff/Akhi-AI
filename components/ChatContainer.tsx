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
                    
                            <h1 className="chat-container__brand-title">Akhi AI</h1>
                            <p className="chat-container__welcome-text">
                                Akhi AI is an Islamic AI assistant that provides authentic answers from the Quran and Hadith. Your trusted digital companion for Islamic knowledge and guidance.
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

                            <div className="chat-container__mobile-ambient" aria-hidden="true">
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
