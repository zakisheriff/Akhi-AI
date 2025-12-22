/**
 * Quran.Foundation API Service
 * Fetches authentic Quranic content from the official Quran.com API
 * 
 * API Base: https://api.quran.com/api/v4
 * Translations: 131 = Sahih International (English)
 */

const API_BASE = 'https://api.quran.com/api/v4';
const DEFAULT_TRANSLATION = 131; // Sahih International

// Simple in-memory cache to reduce API calls
const verseCache = new Map();
const chapterCache = new Map();

/**
 * Fetch a single verse by its key (e.g., "2:255" for Ayat ul-Kursi)
 * @param {string} verseKey - Format: "surah:ayah" (e.g., "2:255")
 * @param {number} translationId - Translation ID (default: Sahih International)
 * @returns {Promise<Object>} Verse data with Arabic text and translation
 */
export const getVerse = async (verseKey, translationId = DEFAULT_TRANSLATION) => {
    // Check cache first
    const cacheKey = `${verseKey}-${translationId}`;
    if (verseCache.has(cacheKey)) {
        console.log(`📖 Quran cache hit: ${verseKey}`);
        return verseCache.get(cacheKey);
    }

    try {
        console.log(`🕌 Fetching verse: ${verseKey}`);

        const response = await fetch(
            `${API_BASE}/verses/by_key/${verseKey}?fields=text_uthmani&translations=${translationId}`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch verse: ${response.status}`);
        }

        const data = await response.json();

        // Process the response
        const verse = {
            key: data.verse.verse_key,
            verseNumber: data.verse.verse_number,
            arabicText: data.verse.text_uthmani,
            translation: data.verse.translations?.[0]?.text || null,
            pageNumber: data.verse.page_number,
            juzNumber: data.verse.juz_number
        };

        // Cache the result
        verseCache.set(cacheKey, verse);

        return verse;
    } catch (error) {
        console.error(`❌ Error fetching verse ${verseKey}:`, error);
        return null;
    }
};

/**
 * Fetch a range of verses (e.g., 2:1-5 for first 5 verses of Al-Baqarah)
 * @param {number} chapterId - Surah number (1-114)
 * @param {number} startVerse - Starting verse number
 * @param {number} endVerse - Ending verse number
 * @param {number} translationId - Translation ID
 * @returns {Promise<Array>} Array of verse objects
 */
export const getVerseRange = async (chapterId, startVerse, endVerse, translationId = DEFAULT_TRANSLATION) => {
    try {
        console.log(`🕌 Fetching verses: ${chapterId}:${startVerse}-${endVerse}`);

        const response = await fetch(
            `${API_BASE}/verses/by_chapter/${chapterId}?` +
            `fields=text_uthmani&translations=${translationId}` +
            `&per_page=${endVerse - startVerse + 1}&page=1`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch verses: ${response.status}`);
        }

        const data = await response.json();

        // Filter to only the requested range and process
        const verses = data.verses
            .filter(v => v.verse_number >= startVerse && v.verse_number <= endVerse)
            .map(v => ({
                key: v.verse_key,
                verseNumber: v.verse_number,
                arabicText: v.text_uthmani,
                translation: v.translations?.[0]?.text || null,
                pageNumber: v.page_number,
                juzNumber: v.juz_number
            }));

        return verses;
    } catch (error) {
        console.error(`❌ Error fetching verse range:`, error);
        return [];
    }
};

/**
 * Get chapter (Surah) information
 * @param {number} chapterId - Surah number (1-114)
 * @returns {Promise<Object>} Chapter metadata
 */
export const getChapter = async (chapterId) => {
    // Check cache first
    if (chapterCache.has(chapterId)) {
        return chapterCache.get(chapterId);
    }

    try {
        console.log(`🕌 Fetching chapter: ${chapterId}`);

        const response = await fetch(`${API_BASE}/chapters/${chapterId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch chapter: ${response.status}`);
        }

        const data = await response.json();

        const chapter = {
            id: data.chapter.id,
            nameSimple: data.chapter.name_simple,
            nameArabic: data.chapter.name_arabic,
            englishName: data.chapter.translated_name?.name,
            versesCount: data.chapter.verses_count,
            revelationPlace: data.chapter.revelation_place,
            revelationOrder: data.chapter.revelation_order
        };

        // Cache the result
        chapterCache.set(chapterId, chapter);

        return chapter;
    } catch (error) {
        console.error(`❌ Error fetching chapter ${chapterId}:`, error);
        return null;
    }
};

/**
 * Get all chapters (for reference/lookup)
 * @returns {Promise<Array>} Array of all 114 chapters
 */
export const getAllChapters = async () => {
    try {
        const response = await fetch(`${API_BASE}/chapters`);

        if (!response.ok) {
            throw new Error(`Failed to fetch chapters: ${response.status}`);
        }

        const data = await response.json();

        return data.chapters.map(ch => ({
            id: ch.id,
            nameSimple: ch.name_simple,
            nameArabic: ch.name_arabic,
            englishName: ch.translated_name?.name,
            versesCount: ch.verses_count
        }));
    } catch (error) {
        console.error('❌ Error fetching chapters:', error);
        return [];
    }
};

/**
 * Parse a verse reference string and fetch the verse(s)
 * Supports formats: "2:255", "Al-Baqarah:255", "2:1-5"
 * @param {string} reference - Verse reference string
 * @returns {Promise<Object|Array>} Verse or array of verses
 */
export const parseAndFetchVerse = async (reference) => {
    // Remove any brackets or extra characters
    const cleanRef = reference.replace(/[\[\]]/g, '').trim();

    // Check if it's a range (contains hyphen in verse number)
    const rangeMatch = cleanRef.match(/^(\d+):(\d+)-(\d+)$/);
    if (rangeMatch) {
        const [, chapter, start, end] = rangeMatch;
        return getVerseRange(parseInt(chapter), parseInt(start), parseInt(end));
    }

    // Single verse format: "2:255"
    const singleMatch = cleanRef.match(/^(\d+):(\d+)$/);
    if (singleMatch) {
        return getVerse(cleanRef);
    }

    console.warn(`⚠️ Could not parse verse reference: ${reference}`);
    return null;
};

/**
 * Extract Quran citations from AI response text
 * Looks for patterns like [QURAN:2:255] - single verses only
 * NOTE: Ranges like [QURAN:5:3-9] are NOT supported
 * @param {string} text - Text to search for citations
 * @returns {Array<string>} Array of verse keys found
 */
export const extractQuranCitations = (text) => {
    const citations = [];

    // Match [QURAN:X:Y] format (single verses only, no ranges)
    const bracketPattern = /\[QURAN:(\d+:\d+)\]/gi;
    let match;
    while ((match = bracketPattern.exec(text)) !== null) {
        citations.push(match[1]);
    }

    return citations;
};

// Export available translations for future use
export const TRANSLATIONS = {
    SAHIH_INTERNATIONAL: 131,
    PICKTHALL: 19,
    YUSUF_ALI: 22,
    MUHSIN_KHAN: 20,
    CLEAR_QURAN: 85
};
