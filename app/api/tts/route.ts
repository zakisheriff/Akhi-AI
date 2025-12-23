import { NextResponse } from 'next/server';
import { cleanTextForSpeech } from '@/utils/textProcessor';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const speechText = cleanTextForSpeech(text);
        if (!speechText || speechText.length < 2) {
            return NextResponse.json({ error: 'No speakable text found' }, { status: 400 });
        }

        // Priority 1: ElevenLabs (Highest Quality)
        const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
        if (elevenLabsKey) {
            try {
                // Determine voice ID (Rachel is a popular standard choice)
                // Reliable Voice ID: '21m00Tcm4TlvDq8ikWAM' (Rachel) or 'JBFqnCBsd6RMkjVDRZzb' (Adam)
                // Let's use a nice calm one. '21m00Tcm4TlvDq8ikWAM' is Rachel (US Female).
                const voiceId = '21m00Tcm4TlvDq8ikWAM';

                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'xi-api-key': elevenLabsKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text: speechText,
                        model_id: "eleven_monolingual_v1",
                        voice_settings: {
                            stability: 0.5,
                            similarity_boost: 0.75
                        }
                    })
                });

                if (response.ok) {
                    const audioBuffer = Buffer.from(await response.arrayBuffer());
                    return new NextResponse(audioBuffer, {
                        headers: { 'Content-Type': 'audio/mpeg' }
                    });
                } else {
                    console.warn('ElevenLabs Error:', await response.text());
                    // Fallthrough to next provider
                }
            } catch (e) {
                console.error('ElevenLabs Exception:', e);
            }
        }

        // Priority 2: Gemini Native Audio (Good Quality, but Quota limited)
        const apiKey = process.env.GEMINI_VOICE_KEY || process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const model = 'gemini-2.0-flash-exp';
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: `Read naturally: "${speechText}"` }] }],
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const audioBase64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                    if (audioBase64) {
                        const audioBuffer = Buffer.from(audioBase64, 'base64');
                        return new NextResponse(audioBuffer, { headers: { 'Content-Type': 'audio/wav' } });
                    }
                }
            } catch (e) {
                console.warn('Gemini Audio Error:', e);
            }
        }

        // Priority 3: Google Translate (Fallback, Robotic but works)
        // Truncate to 200 chars to prevent failures
        const safeText = speechText.slice(0, 200);
        const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(safeText)}&tl=en&client=tw-ob`;

        const fallbackResponse = await fetch(fallbackUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (fallbackResponse.ok) {
            const fallbackBuffer = Buffer.from(await fallbackResponse.arrayBuffer());
            return new NextResponse(fallbackBuffer, { headers: { 'Content-Type': 'audio/mpeg' } });
        }

        throw new Error('All TTS providers failed');

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
