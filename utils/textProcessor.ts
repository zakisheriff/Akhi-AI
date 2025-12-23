/**
 * Text processing utility for Voice Feature
 * Removes Arabic script to prevent Qur'anic recitation by AI.
 * Cleans Markdown for smoother speech.
 */

export function cleanTextForSpeech(text: string): string {
    if (!text) return '';

    // 1. Remove Arabic Script (Quran/Hadith text)
    // Range covers standard Arabic, Supplement, Extended A, Presentation Forms A & B
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    let clean = text.replace(arabicRegex, '');

    // 2. Remove Markdown bold/italic markers (*, _)
    clean = clean.replace(/(\*\*|__)(.*?)\1/g, '$2'); // Bold
    clean = clean.replace(/(\*|_)(.*?)\1/g, '$2');   // Italic

    // 3. Remove Code blocks
    clean = clean.replace(/```[\s\S]*?```/g, ' Code block omitted. ');
    clean = clean.replace(/`([^`]+)`/g, '$1');

    // 4. Clean up excessive whitespace causing awkward pauses
    clean = clean.replace(/\s+/g, ' ').trim();

    // 5. Remove citations like [QURAN:2:255] effectively for speech if desired, 
    // but user might want to hear "Quran 2 255". 
    // Any remaining brackets might be awkward, let's keep them straightforward.

    return clean;
}
