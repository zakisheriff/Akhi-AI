/**
 * Hadith API Service
 * Fetches authentic Hadith content from fawazahmed0/hadith-api via jsDelivr CDN
 * 
 * API Base: https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1
 * Collections: eng-bukhari, eng-muslim, eng-abudawud, eng-ibnmajah, eng-tirmidhi
 * No authentication required - CORS-friendly via CDN!
 */

const API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// Collection metadata with CDN-friendly names
export const HADITH_COLLECTIONS = {
    bukhari: {
        name: 'Sahih al-Bukhari',
        edition: 'eng-bukhari',
        count: 7563,
        color: '#10B981'
    },
    muslim: {
        name: 'Sahih Muslim',
        edition: 'eng-muslim',
        count: 3032,
        color: '#3B82F6'
    },
    abudawud: {
        name: 'Sunan Abu Dawud',
        edition: 'eng-abudawud',
        count: 3998,
        color: '#F59E0B'
    },
    ibnmajah: {
        name: 'Sunan Ibn Majah',
        edition: 'eng-ibnmajah',
        count: 4342,
        color: '#8B5CF6'
    },
    tirmidhi: {
        name: 'Jami at-Tirmidhi',
        edition: 'eng-tirmidhi',
        count: 3956,
        color: '#EF4444'
    }
};

// Simple in-memory cache
const hadithCache = new Map();

/**
 * Fetch a single hadith by collection and ID
 * @param {string} collection - Collection name (bukhari, muslim, etc.)
 * @param {number|string} id - Hadith number
 * @returns {Promise<Object>} Hadith data
 */
export const getHadith = async (collection, id) => {
    const collectionLower = collection.toLowerCase();
    const cacheKey = `${collectionLower}-${id}`;

    // Check cache first
    if (hadithCache.has(cacheKey)) {
        console.log(`📚 Hadith cache hit: ${collection} ${id}`);
        return hadithCache.get(cacheKey);
    }

    const collectionInfo = HADITH_COLLECTIONS[collectionLower];
    if (!collectionInfo) {
        console.error(`❌ Unknown collection: ${collection}`);
        return null;
    }

    try {
        console.log(`📖 Fetching hadith: ${collection} ${id}`);

        // Use the CDN URL format: /editions/{edition}/{hadithNumber}.json
        const url = `${API_BASE}/editions/${collectionInfo.edition}/${id}.json`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch hadith: ${response.status}`);
        }

        const data = await response.json();

        // The API returns hadiths array, get the first one
        const hadithData = data.hadiths?.[0];
        if (!hadithData) {
            throw new Error('No hadith data found');
        }

        // Process and normalize the response
        const hadith = {
            id: hadithData.hadithnumber || id,
            collection: collectionLower,
            collectionName: data.metadata?.name || collectionInfo.name,
            narrator: '', // Will extract from text
            text: hadithData.text || '',
            reference: `${collectionInfo.name} ${hadithData.hadithnumber || id}`,
            bookName: data.metadata?.section?.[hadithData.reference?.book] || '',
            chapterName: '',
            grades: hadithData.grades || [],
            color: collectionInfo.color
        };

        // Extract narrator from text (usually at the start)
        const narratorMatch = hadith.text.match(/^(Narrated\s+[^:]+):/i);
        if (narratorMatch) {
            hadith.narrator = narratorMatch[1];
            hadith.text = hadith.text.substring(narratorMatch[0].length).trim();
        }

        // Cache the result
        hadithCache.set(cacheKey, hadith);

        return hadith;
    } catch (error) {
        console.error(`❌ Error fetching hadith ${collection} ${id}:`, error);
        return null;
    }
};

/**
 * Parse hadith reference and fetch
 * Supports: "bukhari:1", "muslim:123", etc.
 * @param {string} reference - Hadith reference string
 * @returns {Promise<Object>} Hadith data
 */
export const parseAndFetchHadith = async (reference) => {
    // Clean the reference
    const cleanRef = reference.replace(/[\[\]]/g, '').trim().toLowerCase();

    // Parse collection:id format
    const match = cleanRef.match(/^(bukhari|muslim|abudawud|ibnmajah|tirmidhi)[:\s]+(\d+)$/i);

    if (match) {
        const [, collection, id] = match;
        return getHadith(collection.toLowerCase(), parseInt(id));
    }

    console.warn(`⚠️ Could not parse hadith reference: ${reference}`);
    return null;
};

/**
 * Extract hadith citations from AI response text
 * Looks for patterns like [HADITH:bukhari:1]
 * @param {string} text - Text to search for citations
 * @returns {Array<Object>} Array of citation objects
 */
export const extractHadithCitations = (text) => {
    const citations = [];

    // Match [HADITH:collection:id] format
    const pattern = /\[HADITH:(bukhari|muslim|abudawud|ibnmajah|tirmidhi):(\d+)\]/gi;
    let match;

    while ((match = pattern.exec(text)) !== null) {
        citations.push({
            fullMatch: match[0],
            collection: match[1].toLowerCase(),
            id: parseInt(match[2])
        });
    }

    return citations;
};

/**
 * Get a random hadith from a collection
 * @param {string} collection - Collection name
 * @returns {Promise<Object>} Random hadith
 */
export const getRandomHadith = async (collection = 'bukhari') => {
    const collectionLower = collection.toLowerCase();
    const collectionInfo = HADITH_COLLECTIONS[collectionLower];
    if (!collectionInfo) return null;

    const maxId = collectionInfo.count || 1000;
    const randomId = Math.floor(Math.random() * Math.min(maxId, 500)) + 1; // Limit to first 500 for reliability

    return getHadith(collectionLower, randomId);
};
