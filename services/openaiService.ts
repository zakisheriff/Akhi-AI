/**
 * Client-side AI Service for Akhi AI (Next.js)
 * Calls the secure /api/chat endpoint
 */

import { SCHOOLS } from '@/utils/systemPrompt';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const sendMessage = async (
    userMessage: string,
    school: string = SCHOOLS.GENERAL,
    conversationHistory: Message[] = [],
    genZMode: boolean = false
): Promise<string> => {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                school,
                history: conversationHistory,
                genZMode,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        return data.response;
    } catch (error: any) {
        console.error('Chat API Error:', error);
        throw new Error(error.message || 'Failed to get AI response. Please try again.');
    }
};
