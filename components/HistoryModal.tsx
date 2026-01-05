import React from 'react';
import '@/styles/ChatHistory.css';
import { format } from 'date-fns';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export interface StoredChat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    chats: StoredChat[];
    currentChatId: string | null;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string, e: React.MouseEvent) => void;
    onNewChat: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    chats,
    currentChatId,
    onSelectChat,
    onDeleteChat,
    onNewChat
}) => {
    return (
        <div className="chat-history-modal" onClick={(e) => e.stopPropagation()}>
            <div className="chat-history__header">
                <div className="chat-history__header-content">
                    <h2 className="chat-history__title">
                        <svg className="chat-history__title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                            <path d="M12 7v5l4 2" />
                        </svg>
                        History
                    </h2>
                </div>
                <button className="chat-history__close-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <button className="chat-history__new-chat-btn" onClick={onNewChat}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                New Chat
            </button>

            <div className="chat-history__list">
                {chats.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                        No history yet
                    </div>
                ) : (
                    chats.sort((a, b) => b.updatedAt - a.updatedAt).map(chat => (
                        <div
                            key={chat.id}
                            className={`chat-history__item ${currentChatId === chat.id ? 'chat-history__item--active' : ''}`}
                            onClick={() => onSelectChat(chat.id)}
                        >
                            <div className="chat-history__item-content">
                                <div className="chat-history__item-title">{chat.title}</div>
                                <div className="chat-history__item-date">
                                    {format(new Date(chat.updatedAt), 'MMM d, h:mm a')}
                                </div>
                            </div>
                            <button
                                className="chat-history__delete-btn"
                                onClick={(e) => onDeleteChat(chat.id, e)}
                                title="Delete Chat"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
