import React, { useState, useCallback } from 'react';
import ChatContainer from './components/ChatContainer';
import AmbientBackground from './components/AmbientBackground';
import { sendMessage } from './services/openaiService';
import { SCHOOLS } from './utils/systemPrompt';
import './styles/App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const isHero = messages.length === 0 && !isLoading;

  const handleSendMessage = useCallback(async (userMessage) => {
    // Add user message to chat
    const userMessageObj = { role: 'user', text: userMessage };
    setMessages((prevMessages) => [...prevMessages, userMessageObj]);
    setIsLoading(true);
    setError(null);

    try {
      // Build conversation history for context (excluding system message)
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.text
      }));

      // Send message to OpenAI
      const aiResponse = await sendMessage(userMessage, SCHOOLS.GENERAL, conversationHistory);

      // Add AI response to chat
      const aiMessageObj = { role: 'assistant', text: aiResponse };
      setMessages((prevMessages) => [...prevMessages, aiMessageObj]);
    } catch (err) {
      // Handle errors
      const errorMessage = err.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return (
    <div className="app">
      {isHero && <AmbientBackground />}
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__title-arabic">أخي</span>
            <span className="app__title-english">Akhi AI</span>
          </h1>
          <p className="app__subtitle">Your Brother in Faith & Knowledge</p>
        </div>
      </header>

      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        error={error}
      />
    </div>
  );
}

export default App;
