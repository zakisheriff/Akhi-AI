import React, { useState, useCallback } from 'react';
import ChatContainer from './components/ChatContainer';
import SchoolSelector from './components/SchoolSelector';
import { sendMessage } from './services/openaiService';
import { SCHOOLS } from './utils/systemPrompt';
import './styles/App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(SCHOOLS.GENERAL);
  const [error, setError] = useState(null);

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
      const aiResponse = await sendMessage(userMessage, selectedSchool, conversationHistory);

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
  }, [messages, selectedSchool]);

  const handleSchoolChange = useCallback((school) => {
    setSelectedSchool(school);
    // Optionally clear error when school changes
    if (error) {
      setError(null);
    }
  }, [error]);

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">Al-Ilm AI</h1>
          <p className="app__subtitle">Your Islamic Knowledge Assistant</p>
        </div>
        <SchoolSelector
          selectedSchool={selectedSchool}
          onSchoolChange={handleSchoolChange}
        />
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
