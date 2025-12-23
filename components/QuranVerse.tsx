'use client';

import React, { useState, useEffect } from 'react';
import { getVerse, getChapter } from '@/services/quranService';
import '@/components/QuranVerse.css';

interface QuranVerseProps {
    verseKey: string;
    showArabic?: boolean;
    showTranslation?: boolean;
    compact?: boolean;
}

interface VerseData {
    arabicText?: string;
    translation?: string;
}

interface ChapterData {
    nameArabic?: string;
    nameSimple?: string;
    englishName?: string;
}

const QuranVerse: React.FC<QuranVerseProps> = ({
    verseKey,
    showArabic = true,
    showTranslation = true,
    compact = false
}) => {
    const [verse, setVerse] = useState<VerseData | null>(null);
    const [chapter, setChapter] = useState<ChapterData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!verseKey) return;

            setLoading(true);
            setError(null);

            try {
                const chapterId = parseInt(verseKey.split(':')[0]);

                const [verseData, chapterData] = await Promise.all([
                    getVerse(verseKey),
                    getChapter(chapterId)
                ]);

                if (!verseData) {
                    setError('Verse not found');
                    return;
                }

                setVerse(verseData);
                setChapter(chapterData);
            } catch (err) {
                console.error('Error fetching verse:', err);
                setError('Failed to load verse');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [verseKey]);

    if (loading) {
        return (
            <div className={`quran-verse quran-verse--loading ${compact ? 'quran-verse--compact' : ''}`}>
                <div className="quran-verse__loader">
                    <span className="quran-verse__loader-icon">📖</span>
                    <span>Loading verse...</span>
                </div>
            </div>
        );
    }

    if (error || !verse) {
        return (
            <div className={`quran-verse quran-verse--error ${compact ? 'quran-verse--compact' : ''}`}>
                <span className="quran-verse__error-icon">⚠️</span>
                <span>Could not load {verseKey}</span>
            </div>
        );
    }

    const cleanTranslation = verse.translation
        ? verse.translation.replace(/<[^>]*>/g, '')
        : null;

    return (
        <div className={`quran-verse ${compact ? 'quran-verse--compact' : ''}`}>
            <div className="quran-verse__header">
                <span className="quran-verse__surah-arabic">{chapter?.nameArabic}</span>
                <span className="quran-verse__surah-english">
                    {chapter?.nameSimple} ({chapter?.englishName})
                </span>
                <span className="quran-verse__reference">{verseKey}</span>
            </div>

            {showArabic && verse.arabicText && (
                <div className="quran-verse__arabic" dir="rtl" lang="ar">
                    {verse.arabicText}
                </div>
            )}

            {showTranslation && cleanTranslation && (
                <div className="quran-verse__translation">
                    <span className="quran-verse__translation-label">Translation:</span>
                    <p className="quran-verse__translation-text">&quot;{cleanTranslation}&quot;</p>
                </div>
            )}

            <div className="quran-verse__footer">
                <a
                    href={`https://quran.com/${verseKey.replace(':', '/')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quran-verse__link"
                >
                    View on Quran.com ↗
                </a>
            </div>
        </div>
    );
};

export default QuranVerse;
