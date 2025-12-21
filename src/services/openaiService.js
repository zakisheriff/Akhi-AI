import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../utils/systemPrompt';

// Initialize Gemini client
const getGeminiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
  }
  
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Sends a message to Gemini and returns the response
 * @param {string} userMessage - The user's question
 * @param {string} school - The selected school of thought
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessage = async (userMessage, school = 'general', conversationHistory = []) => {
  try {
    const genAI = getGeminiClient();
    const systemPrompt = buildSystemPrompt(school);
    
    // Get the model (using gemini-2.5-flash which is available with your API key)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    });
    
    // Build chat history for Gemini
    // Gemini expects alternating user/assistant messages
    const chatHistory = conversationHistory.map((msg, index) => {
      // Convert 'assistant' role to 'model' for Gemini
      const role = msg.role === 'assistant' ? 'model' : 'user';
      return {
        role: role,
        parts: [{ text: msg.content }]
      };
    });
    
    // Start a chat session with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2000,
      }
    });
    
    // Send the user message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No response received from Gemini API');
    }
    
    return text;
    
  } catch (error) {
    // Handle different types of errors
    if (error.message) {
      // Check for specific Gemini API error patterns
      if (error.message.includes('API key') || error.message.includes('invalid')) {
        throw new Error('Invalid API key. Please check your Gemini API key in .env.local');
      }
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait 60 seconds before trying again. If this persists, check your Gemini API quota limits.');
      }
      if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
    }
    
    // Check if it's a Google API error with status codes
    if (error.status) {
      switch (error.status) {
        case 401:
          throw new Error('Invalid API key. Please check your Gemini API key in .env.local');
        case 429:
          throw new Error('Rate limit exceeded. Please wait 60 seconds before trying again. Check your Gemini API quota limits.');
        case 500:
        case 502:
        case 503:
          throw new Error('Gemini service is temporarily unavailable. Please try again later.');
        default:
          throw new Error(`API error: ${error.message || 'An unknown error occurred'}`);
      }
    }
    
    // Generic error fallback
    throw new Error(error.message || 'An unexpected error occurred. Please try again.');
  }
};

/**
 * Estimate token count (rough estimation)
 * This is a simple estimation: ~4 characters = 1 token
 * @param {string} text - Text to estimate tokens for
 * @returns {number} - Estimated token count
 */
export const estimateTokens = (text) => {
  return Math.ceil(text.length / 4);
};
