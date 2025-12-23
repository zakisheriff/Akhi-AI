import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const API_URL = 'http://localhost:3000/api/chat';
const DATASET_PATH = path.join(process.cwd(), 'scripts', 'golden_dataset.json');
const REPORT_PATH = path.join(process.cwd(), 'scripts', 'accuracy_report.md');

// Initialize Gemini as the Judge
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const judgeModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function queryAkhiAI(question: string) {
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question, history: [] })
        });
        const data = await res.json();
        return data.response;
    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}

// Initialize OpenAI client for Groq Fallback
import OpenAI from 'openai';
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

// ============ JUDGE PROVIDERS ============

async function gradeWithGemini(prompt: string) {
    const result = await judgeModel.generateContent(prompt);
    return result.response.text();
}

async function gradeWithGroq(prompt: string) {
    const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
    });
    return completion.choices[0]?.message?.content || '';
}

async function gradeWithMistral(prompt: string) {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
        },
        body: JSON.stringify({
            model: 'mistral-large-latest',
            messages: [{ role: 'user', content: prompt }]
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function gradeWithCohere(prompt: string) {
    const response = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`
        },
        body: JSON.stringify({
            model: 'command-r-plus',
            message: prompt
        })
    });
    const data = await response.json();
    return data.text || '';
}

async function gradeWithOpenRouter(prompt: string) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [{ role: 'user', content: prompt }]
        })
    });
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

async function gradeResponse(question: string, groundTruth: string, aiResponse: string) {
    const prompt = `
    You are an impartial expert judge evaluating an AI chatbot for accuracy.
    
    QUESTION: "${question}"
    
    GROUND TRUTH (The Verified Correct Answer):
    "${groundTruth}"
    
    AI RESPONSE (The Answer given by the Chatbot):
    "${aiResponse}"
    
    TASK:
    Rate the AI RESPONSE against the GROUND TRUTH on a scale of 0 to 100 based on factual accuracy.
    - 100: Completely accurate, captures all key points.
    - 50: Partially accurate, misses nuance or gets minor details wrong.
    - 0: Completely incorrect or dangerous hallucination.
    
    OUTPUT FORMAT:
    Just the number (e.g., 95).
    `;

    let text = '';

    // 🛡️ JUDGE ROTATION: Gemini -> Groq -> Mistral -> Cohere -> OpenRouter
    try {
        text = await gradeWithGemini(prompt);
    } catch (e: any) {
        console.warn('⚠️ Gemini Judge Failed (Rate Limit). Trying Groq...');
        try {
            text = await gradeWithGroq(prompt);
        } catch (e2) {
            console.warn('⚠️ Groq Judge Failed. Trying Mistral...');
            try {
                text = await gradeWithMistral(prompt);
            } catch (e3) {
                console.warn('⚠️ Mistral Judge Failed. Trying Cohere...');
                try {
                    text = await gradeWithCohere(prompt);
                } catch (e4) {
                    console.warn('⚠️ Cohere Judge Failed. Trying OpenRouter...');
                    try {
                        text = await gradeWithOpenRouter(prompt);
                    } catch (e5) {
                        console.error('❌ ALL JUDGES FAILED.');
                        return 0;
                    }
                }
            }
        }
    }

    console.log(`\n🔍 Judge Output: "${text.substring(0, 100)}..."`);

    // Robust regex to find the last number in the text (often 0-100)
    const match = text.match(/([0-9]+)/);
    const score = match ? parseInt(match[0]) : 0;

    return Math.min(100, Math.max(0, score)); // Clamp 0-100
}

async function runEvaluation() {
    console.log('🚀 Starting Akhi AI Accuracy Evaluation...');

    // Read JSON safely
    const rawData = fs.readFileSync(DATASET_PATH, 'utf-8');
    const dataset = JSON.parse(rawData);

    let totalScore = 0;
    let report = '# 🛡️ Akhi AI Accuracy Report\n\n';
    report += `**Date**: ${new Date().toISOString()}\n\n`;
    report += '| ID | QA Category | Score | Notes |\n|---|---|---|---|\n';

    for (const item of dataset) {
        console.log(`\nTesting: ${item.question}`);
        const aiResponse = await queryAkhiAI(item.question);

        if (!aiResponse) {
            console.log('❌ Failed to get response');
            report += `| ${item.id} | ${item.category} | 0 | API Failed |\n`;
            continue;
        }

        const score = await gradeResponse(item.question, item.ground_truth, aiResponse);
        console.log(`✅ Score: ${score}/100`);

        totalScore += score;
        report += `| ${item.id} | ${item.category} | **${score}** | _Verified_ |\n`;

        // Rate Limit Protection (Removed: Multi-Judge System handles fallbacks instantly)
        // await new Promise(r => setTimeout(r, 1000)); 
    }

    const finalAverage = (totalScore / dataset.length).toFixed(2);
    report += `\n\n## 🏆 Final Faithfulness Score: ${finalAverage}%\n`;
    report += `\n*Certified by Automated Verification Pipeline*`;

    fs.writeFileSync(REPORT_PATH, report);
    console.log(`\n🎉 Evaluation Complete! Final Score: ${finalAverage}%`);
    console.log(`📄 Report saved to: ${REPORT_PATH}`);
}

runEvaluation();
