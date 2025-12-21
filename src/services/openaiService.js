import OpenAI from 'openai';
import { buildSystemPrompt } from '../utils/systemPrompt';

// Initialize Groq client (OpenAI compatible)
const getGroqClient = () => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('Groq API key is not configured. Please set VITE_GROQ_API_KEY in your .env.local file.');
  }

  return new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true // Required for client-side Vite usage
  });
};

/**
 * Sends a message to Groq (Llama 3) and returns the response
 * @param {string} userMessage - The user's question
 * @param {string} school - The selected school of thought
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - The AI's response
 */
export const sendMessage = async (userMessage, school = 'general', conversationHistory = []) => {
  try {
    const openai = getGroqClient();
    const systemPrompt = buildSystemPrompt(school);

    // Build chat history for Groq/OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : msg.role, // Handle legacy 'model' role if present
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Retry logic with fallback through available models
    // Primary: Llama 3.3 70B (State of the Art), Secondary: Llama 3.1 8B (Speed/Fallback)
    const models = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile'
    ];

    let modelIndex = 0;
    const maxRetries = 2; // Total retries across models logic handled by loop

    for (const modelName of models) {
      try {
        const completion = await openai.chat.completions.create({
          messages: messages,
          model: modelName,
          temperature: 0.6, // Slightly lower for accuracy
          max_tokens: 8192,
          top_p: 0.9,
          stream: false
        });

        const text = completion.choices[0]?.message?.content;
        if (!text) throw new Error('Empty response from Groq');

        return text;

      } catch (err) {
        console.warn(`Failed with model ${modelName}:`, err);

        // If it's the last model, throw the error
        if (modelName === models[models.length - 1]) {
          // Enrich error message
          if (err.message.includes('401')) throw new Error('Invalid Groq API Key.');
          if (err.message.includes('429')) throw new Error('Groq Rate Limit Exceeded. Please wait a moment.');
          throw err;
        }
        // Otherwise continue to next model
        continue;
      }
    }

  } catch (error) {
    console.error("Groq API Error:", error);
    if (error.message.includes('VITE_GROQ_API_KEY')) {
      throw new Error('Missing API Key. Please get a free key from console.groq.com');
    }
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};
