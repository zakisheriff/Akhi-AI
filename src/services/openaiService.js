import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../utils/systemPrompt';

/**
 * Multi-Provider AI Service for Al-Ilm
 * Groq (fastest) → Gemini → Mistral (highest limits)
 */

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ============ GROQ PROVIDER ============
const callGroq = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) return null;

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: 'https://api.groq.com/openai/v1',
    dangerouslyAllowBrowser: true
  });

  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

  for (const model of models) {
    try {
      console.log(`🔄 Trying Groq (${model})...`);
      const completion = await client.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        model: model,
        temperature: 0.6,
        max_tokens: 4096,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
        stream: false
      });
      const text = completion.choices[0]?.message?.content;
      if (text) {
        console.log(`✅ Success with Groq (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ Groq (${model}) failed:`, err.message);
      if (err.message?.includes('decommissioned')) continue;
      if (err.status === 429 || err.message?.includes('429')) throw err;
    }
  }
  return null;
};

// ============ GEMINI PROVIDER ============
const callGemini = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);

  const models = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash'
  ];

  for (const modelName of models) {
    try {
      console.log(`🔄 Trying Gemini (${modelName})...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt
      });

      const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({ history });
      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const text = result.response.text();

      if (text) {
        console.log(`✅ Success with Gemini (${modelName})`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ Gemini (${modelName}) failed:`, err.message);
      if (err.message?.includes('429') || err.message?.includes('404')) {
        continue;
      }
      throw err;
    }
  }
  return null;
};

// ============ MISTRAL PROVIDER ============
const callMistral = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
  if (!apiKey) return null;

  // Mistral uses fetch directly (their SDK has CORS issues in browser)
  const models = ['mistral-small-latest', 'open-mistral-nemo'];

  for (const model of models) {
    try {
      console.log(`🔄 Trying Mistral (${model})...`);

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.6,
          max_tokens: 4096,
          frequency_penalty: 0.5,
          presence_penalty: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status} ${errorData.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;

      if (text) {
        console.log(`✅ Success with Mistral (${model})`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ Mistral (${model}) failed:`, err.message);
      if (err.message?.includes('429') || err.message?.includes('404')) {
        continue;
      }
      throw err;
    }
  }
  return null;
};

// ============ OPENROUTER PROVIDER (PRIMARY) ============
const callOpenRouter = async (messages, systemPrompt) => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!apiKey) return null;

  // OpenRouter free models - many fallback options!
  const models = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-2-9b-it:free',
    'qwen/qwen-2.5-72b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    // 'nousresearch/hermes-3-llama-3.1-405b:free',
    'openchat/openchat-7b:free',
    'huggingfaceh4/zephyr-7b-beta:free',
    'mistralai/mistral-7b-instruct:free'
  ];

  for (const model of models) {
    try {
      console.log(`🔄 Trying OpenRouter (${model.split('/')[1].split(':')[0]})...`);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Al-Ilm'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.6,
          max_tokens: 4096,
          frequency_penalty: 0.5,
          presence_penalty: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const text = data.choices[0]?.message?.content;

      if (text) {
        console.log(`✅ Success with OpenRouter (${model.split('/')[1].split(':')[0]})`);
        return text;
      }
    } catch (err) {
      console.warn(`⚠️ OpenRouter (${model.split('/')[1].split(':')[0]}) failed:`, err.message);
      if (err.message?.includes('429') || err.message?.includes('404')) {
        continue;
      }
      // For other errors, try next model
      continue;
    }
  }
  return null;
};

/**
 * Sends a message using multi-provider fallback
 * Order: OpenRouter (many free models) → Groq → Gemini → Mistral
 */
export const sendMessage = async (userMessage, school = 'general', conversationHistory = []) => {
  const systemPrompt = buildSystemPrompt(school);

  const messages = [
    ...conversationHistory.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const maxRetries = 2;
  let lastError = null;

  // Try Groq first (FASTEST)
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callGroq(messages, systemPrompt);
      if (result) return result;
      break;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.message?.includes('429')) {
        console.log(`⏳ Groq rate limited, trying Gemini...`);
        break;
      }
      if (i < maxRetries - 1) await sleep(1000);
    }
  }

  // Try Gemini second (RELIABLE & FAST)
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callGemini(messages, systemPrompt);
      if (result) return result;
      break;
    } catch (err) {
      lastError = err;
      if (err.message?.includes('429')) {
        console.log(`⏳ Gemini rate limited, trying Mistral...`);
        break;
      }
      if (i < maxRetries - 1) await sleep(1000);
    }
  }

  // Try Mistral third
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callMistral(messages, systemPrompt);
      if (result) return result;
      break;
    } catch (err) {
      lastError = err;
      if (err.message?.includes('429')) {
        console.log(`⏳ Mistral rate limited, trying OpenRouter...`);
        break;
      }
      if (i < maxRetries - 1) await sleep(1000);
    }
  }

  // Try OpenRouter as final fallback (SLOWEST BUT FREE)
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await callOpenRouter(messages, systemPrompt);
      if (result) return result;
      break;
    } catch (err) {
      lastError = err;
      if (err.status === 429 || err.message?.includes('429')) {
        console.log(`⏳ OpenRouter rate limited...`);
        break;
      }
      if (i < maxRetries - 1) await sleep(1000);
    }
  }





  // All providers failed
  console.error('❌ All providers failed');

  const isRateLimit = lastError?.status === 429 || lastError?.message?.includes('429');
  if (isRateLimit) {
    throw new Error('Rate limit reached. Please wait a moment and try again.');
  }

  throw new Error(lastError?.message || 'Unable to get a response. Please try again.');
};
