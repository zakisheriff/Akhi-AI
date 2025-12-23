import { NextResponse } from 'next/server';
import { cleanTextForSpeech } from '@/utils/textProcessor';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // 1. Clean Text
        const speechText = cleanTextForSpeech(text);
        if (!speechText || speechText.length < 2) {
            return NextResponse.json({ error: 'No speakable text found' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_VOICE_KEY || process.env.GEMINI_API_KEY;

        try {
            // ------------------------------------------------------------------
            // STRATEGY 1: Gemini Native Audio (Premium, but might be rate-limited)
            // ------------------------------------------------------------------
            if (!apiKey) throw new Error('No API Key');

            console.log('🗣️ Attempting Gemini Native Audio...');
            const model = 'gemini-2.0-flash-exp';
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Please read this text clearly and naturally: "${speechText}"` }]
                    }],
                    generationConfig: {
                        responseModalities: ["AUDIO"],
                        speechConfig: {
                            voiceConfig: {
                                prebuiltVoiceConfig: {
                                    voiceName: "Aoede"
                                }
                            }
                        }
                    }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (audioBase64) {
                    console.log('✅ Gemini Audio Generated Successfully');
                    const audioBuffer = Buffer.from(audioBase64, 'base64');
                    return new NextResponse(audioBuffer, {
                        headers: {
                            'Content-Type': 'audio/wav',
                            'Content-Length': audioBuffer.length.toString(),
                        },
                    });
                }
            } else {
                console.warn('⚠️ Gemini Audio Failed (likely quota), switching to fallback...');
            }

        } catch (geminiError) {
            console.warn('⚠️ Gemini Audio Error:', geminiError);
            // Continue to fallback
        }

        // ------------------------------------------------------------------
        // STRATEGY 2: Google Translate TTS (Backup, Free, Reliable)
        // ------------------------------------------------------------------
        console.log('🔄 Using Fallback: Google Translate TTS');

        // Google Translate TTS requires text to be < 200 chars per chunk usually, 
        // but client=tw-ob supports longer (up to ~100 chars? No, standard is 200).
        // For simplicity/reliability, we'll truncate or just send it.
        // A better approach for long text is actually separating it, but for now let's try the direct stream.
        // NOTE: standard limit is around 200 chars. If input is long, we might need to substring.
        const safeText = speechText.slice(0, 200); // Truncate for safety in fallback

        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=en&client=tw-ob`;

        const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0' // Sometimes needed
            }
        });

        if (!fallbackResponse.ok) {
            throw new Error(`Fallback TTS failed: ${fallbackResponse.status}`);
        }

        const fallbackBuffer = Buffer.from(await fallbackResponse.arrayBuffer());

        return new NextResponse(fallbackBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': fallbackBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('Final TTS Error:', error);
        return NextResponse.json(
            { error: error.message || 'TTS generation failed' },
            { status: 500 }
        );
    }
}
