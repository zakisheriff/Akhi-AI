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
    onRenameChat: (chatId: string, newTitle: string) => void;
    onNewChat: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    chats,
    currentChatId,
    onSelectChat,
    onDeleteChat,
    onRenameChat,
    onNewChat
}) => {
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editTitle, setEditTitle] = React.useState('');

    const startEditing = (chat: StoredChat, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(chat.id);
        setEditTitle(chat.title);
    };

    const saveEditing = (e: React.FormEvent | React.MouseEvent) => {
        e.stopPropagation(); // Stop propagation to prevent selecting the chat
        if (editingId && editTitle.trim()) {
            onRenameChat(editingId, editTitle.trim());
            setEditingId(null);
        }
    };

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(null);
    };

    const handleInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

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
                                {editingId === chat.id ? (
                                    <div className="chat-history__edit-container">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="chat-history__edit-input"
                                            autoFocus
                                            onClick={handleInputClick}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') saveEditing(e);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                        />
                                        <div className="chat-history__edit-actions">
                                            <button className="chat-history__edit-save" onClick={saveEditing}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </button>
                                            <button className="chat-history__edit-cancel" onClick={cancelEditing}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="chat-history__item-title">
                                            {chat.title}
                                            <button
                                                className="chat-history__rename-btn"
                                                onClick={(e) => startEditing(chat, e)}
                                                title="Rename Chat"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="chat-history__item-date">
                                            {format(new Date(chat.updatedAt), 'MMM d, h:mm a')}
                                        </div>
                                    </>
                                )}
                            </div>
                            {editingId !== chat.id && (
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
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default HistoryModal;
