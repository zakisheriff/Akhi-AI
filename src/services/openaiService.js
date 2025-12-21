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

    // Retry logic with fallback through available models
    // Based on user's available quota list: 2.5 Flash, 3 Flash, 2.5 Flash Lite
    const models = ['gemini-2.5-flash', 'gemini-3-flash', 'gemini-2.5-flash-lite'];
    let modelIndex = 0;
    let retries = 0;
    const maxRetriesPerModel = 2; // Reduced retries per model to fail faster to next model

    // Safety break to prevent infinite loops (3 models * 2 retries + buffer)
    let totalAttempts = 0;
    const maxTotalAttempts = 10;

    while (totalAttempts < maxTotalAttempts) {
      const currentModelName = models[modelIndex];
      totalAttempts++;

      try {
        // Get the model instance for the current attempt
        const model = genAI.getGenerativeModel({
          model: currentModelName,
          systemInstruction: systemPrompt
        });

        // Start chat
        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxOutputTokens: 8192,
          }
        });

        // Send the user message
        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        if (!text) throw new Error('No response received from Gemini API');

        // Return text. If we used a fallback model, maybe log it or append a tiny note?
        // User prefers clean output, but knowing which model answered is useful for debugging.
        // For now, let's keep it clean unless requested.
        return text;

      } catch (err) {
        // Check for rate limit / quota issues (429) OR Model Not Found (404)
        // If a model is not found (like 1.5 earlier), we should also skip it.
        const isRateLimit = err.message?.includes('429') ||
          err.status === 429 ||
          err.message?.includes('quota');

        const isModelNotFound = err.message?.includes('404') ||
          err.status === 404 ||
          err.message?.includes('not found');

        // If Rate Limit OR Model Not Found, switch to next model
        if (isRateLimit || isModelNotFound) {

          // If we have more models to try
          if (modelIndex < models.length - 1) {
            console.warn(`Issue with ${currentModelName} (${isRateLimit ? 'Rate Limit' : 'Not Found'}). Switching to ${models[modelIndex + 1]}...`);
            modelIndex++;
            retries = 0; // Reset retries for the new model
            continue; // Immediately try next model
          } else {
            // No more models
            throw new Error(`All available models (${models.join(', ')}) are exhausted or unavailable. Please check your API quota.`);
          }
        }

        // Standard Retry for temporary network blips (not rate limits)
        if (retries < maxRetriesPerModel) {
          retries++;
          const delay = Math.pow(2, retries) * 1000;
          console.log(`Error on ${currentModelName}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }
    // If the loop finishes without returning, it means all retries failed
    throw new Error('All attempts to send message failed due to persistent issues.');

  } catch (error) {
    console.error("Gemini API Error details:", error);

    // Handle different types of errors
    if (error.message) {
      // Check for specific Gemini API error patterns
      if (error.message.includes('API key') || error.message.includes('invalid')) {
        throw new Error('Invalid API key. Please check your Gemini API key in .env.local');
      }
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429')) {
        throw new Error('Rate limit exceeded. We tried falling back to other models but they are also busy. Please try again later.');
      }
      if (error.message.includes('found') || error.message.includes('404')) {
        throw new Error('Model not found or API endpoint invalid. Please check the model name configuration.');
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
          throw new Error('Rate limit exceeded (Free Tier). Please wait a moment before trying again.');
        case 404:
          throw new Error('Model not found (404). The configured model name might be incorrect for your API key.');
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
