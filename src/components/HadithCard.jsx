import React, { useState, useEffect } from 'react';
import { getHadith, HADITH_COLLECTIONS } from '../services/hadithService';
import './HadithCard.css';

/**
 * HadithCard Component
 * Displays a Hadith with narrator, text, and source citation
 * 
 * @param {string} collection - Collection name (bukhari, muslim, etc.)
 * @param {number|string} hadithId - Hadith number
 * @param {boolean} compact - Use compact styling (default: false)
 */
const HadithCard = ({ collection, hadithId, compact = false }) => {
    const [hadith, setHadith] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!collection || !hadithId) return;

            setLoading(true);
            setError(null);

            try {
                const data = await getHadith(collection, hadithId);

                if (!data) {
                    setError('Hadith not found');
                    return;
                }

                setHadith(data);
            } catch (err) {
                console.error('Error fetching hadith:', err);
                setError('Failed to load hadith');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [collection, hadithId]);

    if (loading) {
        return (
            <div className={`hadith-card hadith-card--loading ${compact ? 'hadith-card--compact' : ''}`}>
                <div className="hadith-card__loader">
                    <span className="hadith-card__loader-icon">📚</span>
                    <span>Loading hadith...</span>
                </div>
            </div>
        );
    }

    if (error || !hadith) {
        return (
            <div className={`hadith-card hadith-card--error ${compact ? 'hadith-card--compact' : ''}`}>
                <span className="hadith-card__error-icon">⚠️</span>
                <span>Could not load {collection} #{hadithId}</span>
            </div>
        );
    }

    const collectionInfo = HADITH_COLLECTIONS[collection.toLowerCase()] || {};

    return (
        <div
            className={`hadith-card ${compact ? 'hadith-card--compact' : ''}`}
            style={{ '--hadith-accent': collectionInfo.color || '#6B7280' }}
        >
            {/* Header with collection name */}
            <div className="hadith-card__header">
                <span className="hadith-card__collection">{hadith.collectionName}</span>
                <span className="hadith-card__reference">{hadith.reference}</span>
            </div>

            {/* Chapter info if available */}
            {hadith.chapterName && (
                <div className="hadith-card__chapter">
                    {hadith.bookName && <span className="hadith-card__book">{hadith.bookName}</span>}
                    <span className="hadith-card__chapter-name">{hadith.chapterName}</span>
                </div>
            )}

            {/* Narrator */}
            {hadith.narrator && (
                <div className="hadith-card__narrator">
                    {hadith.narrator}
                </div>
            )}

            {/* Hadith Text */}
            <div className="hadith-card__text">
                {hadith.text}
            </div>

            {/* Footer with link */}
            <div className="hadith-card__footer">
                <a
                    href={`https://sunnah.com/search?q=${encodeURIComponent(hadith.reference)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hadith-card__link"
                >
                    View on Sunnah.com ↗
                </a>
            </div>
        </div>
    );
};

export default HadithCard;
