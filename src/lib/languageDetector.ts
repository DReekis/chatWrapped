// Language Detection Utility for Ishq Audit 2026
// Analyzes chat content to detect dominant language

import { globalSentiment, slangDictionary } from './sentiment_data';

export interface LanguageResult {
    dominantLanguage: string;
    confidence: number;
    languageScores: Record<string, number>;
    slangCount: number;
}

/**
 * Detects the dominant language in WhatsApp chat content
 * Scans first 500 lines and counts keyword matches
 */
export function detectLanguage(chatContent: string): LanguageResult {
    const lines = chatContent.split('\n').slice(0, 500);
    const textContent = lines.join(' ').toLowerCase();

    const languageScores: Record<string, number> = {};
    let totalHits = 0;

    // Count hits for each language
    for (const [langCode, categories] of Object.entries(globalSentiment)) {
        let langScore = 0;

        for (const categoryWords of Object.values(categories)) {
            for (const word of categoryWords) {
                // Use word boundary matching for accuracy
                const regex = new RegExp(`\\b${escapeRegex(word.toLowerCase())}\\b`, 'gi');
                const matches = textContent.match(regex);
                if (matches) {
                    langScore += matches.length;
                }
            }
        }

        languageScores[langCode] = langScore;
        totalHits += langScore;
    }

    // Count slang usage (universal)
    let slangCount = 0;
    for (const slang of slangDictionary) {
        const regex = new RegExp(`\\b${escapeRegex(slang.toLowerCase())}\\b`, 'gi');
        const matches = textContent.match(regex);
        if (matches) {
            slangCount += matches.length;
        }
    }

    // Find dominant language
    let dominantLanguage = 'en'; // Default to English
    let maxScore = 0;

    for (const [langCode, score] of Object.entries(languageScores)) {
        if (score > maxScore) {
            maxScore = score;
            dominantLanguage = langCode;
        }
    }

    // Calculate confidence (0-100)
    const confidence = totalHits > 0
        ? Math.min(100, Math.round((maxScore / totalHits) * 100))
        : 0;

    return {
        dominantLanguage,
        confidence,
        languageScores,
        slangCount
    };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default detectLanguage;
