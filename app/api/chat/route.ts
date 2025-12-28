import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '@/utils/systemPrompt';

/**
 * Multi-Provider AI Service for Akhi AI (Server-Side Secure)
 * Gemini (Primary/Stable) → Groq (Fast/Rate-limited) → Mistral → OpenRouter
 */

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============ GROQ PROVIDER ============
async function callGroq(messages: any[], systemPrompt: string): Promise<string | null> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return null;

    const client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.groq.com/openai/v1',
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
        } catch (err: any) {
            console.warn(`⚠️ Groq (${model}) failed:`, err.message);
            if (err.message?.includes('decommissioned')) continue;
            if (err.status === 429 || err.message?.includes('429')) throw err;
        }
    }
    return null;
}

// ============ GEMINI PROVIDER (PRIMARY STABLE) ============
async function callGemini(messages: any[], systemPrompt: string): Promise<string | null> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Prioritize 2.5-flash-lite (Proven working in logs) -> then exp -> then standard
    const models = ['gemini-2.5-flash-lite', 'gemini-2.0-flash-exp', 'gemini-2.5-flash'];

    for (const modelName of models) {
        try {
            console.log(`🔄 Trying Gemini (${modelName})...`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemPrompt
            });

            const history = messages.slice(0, -1).map((msg: any) => ({
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
        } catch (err: any) {
            console.warn(`⚠️ Gemini (${modelName}) failed:`, err.message);
            if (err.message?.includes('429') || err.message?.includes('404')) {
                continue;
            }
            throw err;
        }
    }
    return null;
}

// ============ MISTRAL PROVIDER ============
async function callMistral(messages: any[], systemPrompt: string): Promise<string | null> {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) return null;

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
        } catch (err: any) {
            console.warn(`⚠️ Mistral (${model}) failed:`, err.message);
            if (err.message?.includes('429') || err.message?.includes('404')) {
                continue;
            }
            throw err;
        }
    }
    return null;
}

// ============ COHERE PROVIDER (BACKUP) ============
async function callCohere(messages: any[], systemPrompt: string): Promise<string | null> {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) return null;

    // Updated to late-2024/2025 stable versions
    const models = ['command-r-08-2024', 'command-r-plus-08-2024'];

    for (const model of models) {
        try {
            console.log(`🔄 Trying Cohere (${model})...`);

            // Transform messages to Cohere format (chat_history + message)
            const chatHistory = messages.slice(0, -1).map((msg: any) => ({
                role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
                message: msg.content
            }));
            const lastMessage = messages[messages.length - 1].content;

            const response = await fetch('https://api.cohere.com/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    message: lastMessage,
                    chat_history: chatHistory,
                    preamble: systemPrompt,
                    temperature: 0.3,
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`${response.status} ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            const text = data.text;

            if (text) {
                console.log(`✅ Success with Cohere (${model})`);
                return text;
            }
        } catch (err: any) {
            console.warn(`⚠️ Cohere (${model}) failed:`, err.message);
            if (err.message?.includes('429') || err.message?.includes('404')) {
                continue;
            }
            throw err;
        }
    }
    return null;
}

// ============ OPENROUTER PROVIDER ============
async function callOpenRouter(messages: any[], systemPrompt: string): Promise<string | null> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return null;

    const models = [
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemma-2-9b-it:free',
        'qwen/qwen-2.5-72b-instruct:free',
        'microsoft/phi-3-mini-128k-instruct:free',
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
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://akhiai.theoneatom.com',
                    'X-Title': 'Akhi AI'
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
        } catch (err: any) {
            console.warn(`⚠️ OpenRouter (${model.split('/')[1].split(':')[0]}) failed:`, err.message);
            if (err.message?.includes('429') || err.message?.includes('404')) {
                continue;
            }
            continue;
        }
    }
    return null;
}

// ============ API ROUTE HANDLER ============
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { message, history = [], genZMode = false, school = 'general' } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Build system prompt
        let systemPrompt = buildSystemPrompt(school);

        // Add Gen Z Mode instructions if enabled
        if (genZMode) {
            const genZPrefix = `
🔥 GEN Z MODE ACTIVATED - FULL RESPONSE REQUIRED 🔥

**⚠️ CRITICAL: YOUR ENTIRE RESPONSE MUST BE IN GEN Z STYLE - NOT JUST THE OPENING**

You MUST write the ENTIRE response in Gen Z tone - every section, every paragraph, every sentence. Do NOT switch to formal academic English after the first line.

**GEN Z VOCABULARY (use throughout):**
- "bro/sis/fam" instead of formal addresses
- "ngl" (not gonna lie) instead of "honestly"
- "fr fr" (for real for real) for emphasis
- "lowkey/highkey" for degrees
- "hits different" for special emphasis
- "no cap" instead of "truly"
- "bet" for agreement/confirmation
- "deadass" for seriously
- "slaps" for something good
- "W" for win, "L" for loss
- "based" for good opinion
- "valid" for acceptable
- "slay" for doing well

**REMEMBER:** 
- The ENTIRE response must sound like a cool Muslim older sibling talking
- Every single sentence should have casual Gen Z energy
- Still cite Quran correctly: [QURAN:X:Y]  
- Keep Islamic authenticity but make it relatable
- DO NOT switch to formal English mid-response

`;
            systemPrompt = genZPrefix + systemPrompt;
        }

        // Prepare messages
        const messages = [
            ...history.map((msg: any) => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content
            })),
            { role: 'user', content: message }
        ];

        const maxRetries = 2;
        let lastError: Error | null = null;

        // 1. Try Gemini FIRST (Most Reliable Free Tier)
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await callGemini(messages, systemPrompt);
                if (result) return NextResponse.json({ response: result });
                break;
            } catch (err: any) {
                lastError = err;
                if (err.message?.includes('429')) {
                    console.log(`⏳ Gemini rate limited, trying Groq...`);
                    break;
                }
                if (i < maxRetries - 1) await sleep(1000);
            }
        }

        // 2. Try Groq (Fast but often rate limited)
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await callGroq(messages, systemPrompt);
                if (result) return NextResponse.json({ response: result });
                break;
            } catch (err: any) {
                lastError = err;
                if (err.status === 429 || err.message?.includes('429')) {
                    console.log(`⏳ Groq rate limited, trying Mistral...`);
                    break;
                }
                if (i < maxRetries - 1) await sleep(1000);
            }
        }

        // 3. Try Mistral
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await callMistral(messages, systemPrompt);
                if (result) return NextResponse.json({ response: result });
                break;
            } catch (err: any) {
                lastError = err;
                if (err.message?.includes('429')) {
                    console.log(`⏳ Mistral rate limited, trying OpenRouter...`);
                    break;
                }
                if (i < maxRetries - 1) await sleep(1000);
            }
        }

        // 4. Try Cohere (Robust Enterprise Backup)
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await callCohere(messages, systemPrompt);
                if (result) return NextResponse.json({ response: result });
                break;
            } catch (err: any) {
                lastError = err;
                if (err.message?.includes('429')) {
                    console.log(`⏳ Cohere rate limited, trying OpenRouter...`);
                    break;
                }
                if (i < maxRetries - 1) await sleep(1000);
            }
        }

        // 5. Try OpenRouter (Final Fallback)
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await callOpenRouter(messages, systemPrompt);
                if (result) return NextResponse.json({ response: result });
                break;
            } catch (err: any) {
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

        const isRateLimit = lastError?.message?.includes('429');
        if (isRateLimit) {
            return NextResponse.json(
                { error: 'Rate limit reached. Please wait a moment and try again.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: lastError?.message || 'Unable to get a response. Please try again.' },
            { status: 500 }
        );
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
