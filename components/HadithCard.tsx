'use client';

import React, { useState, useEffect, CSSProperties } from 'react';
import { getHadith, HADITH_COLLECTIONS } from '@/services/hadithService';
import '@/components/HadithCard.css';

interface HadithCardProps {
    collection: string;
    hadithId: number | string;
    compact?: boolean;
}

interface HadithData {
    collectionName?: string;
    reference?: string;
    chapterName?: string;
    bookName?: string;
    narrator?: string;
    text?: string;
}

const HadithCard: React.FC<HadithCardProps> = ({ collection, hadithId, compact = false }) => {
    const [hadith, setHadith] = useState<HadithData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const collectionInfo = HADITH_COLLECTIONS[collection.toLowerCase() as keyof typeof HADITH_COLLECTIONS] || {};

    return (
        <div
            className={`hadith-card ${compact ? 'hadith-card--compact' : ''}`}
            style={{ '--hadith-accent': collectionInfo.color || '#6B7280' } as CSSProperties}
        >
            <div className="hadith-card__header">
                <span className="hadith-card__collection">{hadith.collectionName}</span>
                <span className="hadith-card__reference">{hadith.reference}</span>
            </div>

            {hadith.chapterName && (
                <div className="hadith-card__chapter">
                    {hadith.bookName && <span className="hadith-card__book">{hadith.bookName}</span>}
                    <span className="hadith-card__chapter-name">{hadith.chapterName}</span>
                </div>
            )}

            {hadith.narrator && (
                <div className="hadith-card__narrator">
                    {hadith.narrator}
                </div>
            )}

            <div className="hadith-card__text">
                {hadith.text}
            </div>

            <div className="hadith-card__footer">
                <a
                    href={`https://sunnah.com/search?q=${encodeURIComponent(hadith.reference || '')}`}
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
