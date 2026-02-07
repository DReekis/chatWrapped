// WhatsApp Chat Parser for Ishq Audit 2026
// Runs entirely client-side - NO data leaves the browser

import JSZip from 'jszip';
import { globalSentiment, slangDictionary } from './sentiment_data';
import { detectLanguage, LanguageResult } from './languageDetector';
import {
    redFlagKeywords,
    apologyKeywords,
    jealousyKeywords,
    selfFocusedKeywords,
    convoKillerKeywords,
    loveKeywords,
    flirtyKeywords,
    getAllKeywords
} from './viral_keywords';

// Custom nicknames input from user
export interface CustomNicknames {
    partnerA_Nicknames: string[]; // What YOU call them
    partnerB_Nicknames: string[]; // What THEY call you
}

// Individual parsed message
export interface ParsedMessage {
    timestamp: Date;
    sender: string;
    message: string;
    hour: number;
    wordCount: number;
}

// Sentiment analysis results
export interface SentimentStats {
    romance: number;
    fight: number;
    food: number;
    marriage: number;
    waiting: number;
    slang: number;
}

// Deep analytics stats
export interface DeepStats {
    dryTextCount: number;
    dryTextByUser: Record<string, number>;
    longMessageCount: number;
    longMessageByUser: Record<string, number>;
    ghostingScore: number;
    ghostingByUser: Record<string, number>;
    initiationScore: Record<string, number>;
    conversationStarters: Record<string, number>;
}

// Viral audit stats
export interface ViralStats {
    // 🚩 Red Flag Counter
    redFlagCount: number;
    redFlagByUser: Record<string, number>;
    topRedFlags: string[];

    // 😅 Apology Olympics
    apologyCount: number;
    apologyByUser: Record<string, number>;

    // 👀 Jealousy Radar
    jealousyCount: number;
    jealousyByUser: Record<string, number>;

    // ✨ Main Character Energy
    mainCharacterScore: Record<string, number>; // % of self-focused messages

    // 💀 Conversation Killer
    convoKillerCount: number;
    convoKillerByUser: Record<string, number>;

    // 💕 Love & Flirt Score
    loveScore: number;
    loveByUser: Record<string, number>;
    flirtScore: number;
    flirtByUser: Record<string, number>;

    // 💯 Compatibility Score (calculated from all metrics)
    compatibilityScore: number;
    compatibilityVerdict: string;
}

// Complete analysis results
export interface AnalysisResult {
    // Basic stats
    totalMessages: number;
    messagesByUser: Record<string, number>;
    mostActiveSender: string;
    averageReplyTime: number; // in minutes

    // Time-based stats
    nightOwlScore: number; // % of texts between 1-5 AM
    morningPersonScore: number; // % of texts between 6-10 AM

    // Sentiment
    sentimentStats: SentimentStats;
    sentimentByUser: Record<string, SentimentStats>;

    // Deep analytics
    deepStats: DeepStats;

    // Viral audit stats
    viralStats: ViralStats;

    // Nickname tracking
    nicknameCount: Record<string, number>;
    nicknamesByUser: Record<string, Record<string, number>>;

    // Language detection
    language: LanguageResult;

    // Fun metrics
    longestStreak: number;
    mostActiveDay: string;
    mostActiveHour: number;
    emojiCount: number;

    // Partner names
    partnerA: string;
    partnerB: string;
}

// Regex patterns for WhatsApp formats
const ANDROID_PATTERN = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2})\s*([APap][Mm])?\s*-\s*([^:]+):\s*(.+)$/;
const IOS_PATTERN = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*([APap][Mm])?\]\s*([^:]+):\s*(.+)$/;

// System messages to filter out
const SYSTEM_MESSAGES = [
    'media omitted',
    'image omitted',
    'video omitted',
    'audio omitted',
    'sticker omitted',
    'gif omitted',
    'document omitted',
    'contact card omitted',
    'location omitted',
    'end-to-end encrypted',
    'messages and calls are end-to-end encrypted',
    'you deleted this message',
    'this message was deleted',
    'missed voice call',
    'missed video call',
    'null',
    'changed the subject',
    'changed this group',
    'added you',
    'left',
    'removed',
    'changed the group',
    'created group'
];

/**
 * Extract chat content from a ZIP file
 */
export async function extractFromZip(file: File): Promise<string> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    // Find the chat .txt file
    const chatFiles = Object.keys(contents.files).filter(
        name => name.endsWith('.txt') && (
            name.includes('chat') ||
            name.includes('WhatsApp') ||
            name === '_chat.txt'
        )
    );

    if (chatFiles.length === 0) {
        // Try to find any .txt file
        const anyTxt = Object.keys(contents.files).find(name => name.endsWith('.txt'));
        if (!anyTxt) {
            throw new Error('No chat file found in ZIP. Make sure it contains a .txt export.');
        }
        return await contents.files[anyTxt].async('text');
    }

    // Prefer _chat.txt or the first chat file found
    const preferredFile = chatFiles.find(f => f.includes('_chat')) || chatFiles[0];
    return await contents.files[preferredFile].async('text');
}

/**
 * Check if file is a ZIP
 */
export function isZipFile(file: File): boolean {
    return file.type === 'application/zip' ||
        file.type === 'application/x-zip-compressed' ||
        file.name.toLowerCase().endsWith('.zip');
}

/**
 * Parse a WhatsApp chat export file
 * @param fileContent - Raw text content of the .txt file
 * @param customNicknames - Optional custom nicknames for enhanced analysis
 * @returns Complete analysis results
 */
export function parseChat(
    fileContent: string,
    customNicknames?: CustomNicknames
): AnalysisResult {
    const lines = fileContent.split('\n');
    const messages: ParsedMessage[] = [];

    // Parse all messages
    for (const line of lines) {
        const parsed = parseLine(line);
        if (parsed && !isSystemMessage(parsed.message)) {
            messages.push(parsed);
        }
    }

    if (messages.length === 0) {
        throw new Error('No valid messages found in the chat file');
    }

    // Get unique senders (partners)
    const senders = [...new Set(messages.map(m => m.sender))];
    const partnerA = senders[0] || 'Partner A';
    const partnerB = senders[1] || 'Partner B';

    // Count messages by user
    const messagesByUser: Record<string, number> = {};
    for (const msg of messages) {
        messagesByUser[msg.sender] = (messagesByUser[msg.sender] || 0) + 1;
    }

    // Find most active sender
    const mostActiveSender = Object.entries(messagesByUser)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || partnerA;

    // Calculate average reply time
    const averageReplyTime = calculateAverageReplyTime(messages);

    // Calculate night owl score (1-5 AM)
    const nightMessages = messages.filter(m => m.hour >= 1 && m.hour <= 5);
    const nightOwlScore = Math.round((nightMessages.length / messages.length) * 100);

    // Calculate morning person score (6-10 AM)
    const morningMessages = messages.filter(m => m.hour >= 6 && m.hour <= 10);
    const morningPersonScore = Math.round((morningMessages.length / messages.length) * 100);

    // Detect language
    const language = detectLanguage(fileContent);

    // Analyze sentiment
    const { sentimentStats, sentimentByUser } = analyzeSentiment(messages, language.dominantLanguage);

    // Calculate deep stats
    const deepStats = calculateDeepStats(messages);

    // Count nicknames
    const { nicknameCount, nicknamesByUser } = countNicknames(messages, customNicknames);

    // Calculate longest streak
    const longestStreak = calculateLongestStreak(messages);

    // Find most active day and hour
    const { mostActiveDay, mostActiveHour } = findMostActiveTime(messages);

    // Count emojis
    const emojiCount = countEmojis(messages);

    // Calculate viral audit stats
    const viralStats = calculateViralStats(messages, partnerA, partnerB);

    return {
        totalMessages: messages.length,
        messagesByUser,
        mostActiveSender,
        averageReplyTime,
        nightOwlScore,
        morningPersonScore,
        sentimentStats,
        sentimentByUser,
        deepStats,
        viralStats,
        nicknameCount,
        nicknamesByUser,
        language,
        longestStreak,
        mostActiveDay,
        mostActiveHour,
        emojiCount,
        partnerA,
        partnerB
    };
}

/**
 * Calculate deep analytics stats
 */
function calculateDeepStats(messages: ParsedMessage[]): DeepStats {
    const deepStats: DeepStats = {
        dryTextCount: 0,
        dryTextByUser: {},
        longMessageCount: 0,
        longMessageByUser: {},
        ghostingScore: 0,
        ghostingByUser: {},
        initiationScore: {},
        conversationStarters: {}
    };

    // Count dry texts and long messages
    for (const msg of messages) {
        // Dry text: < 3 words
        if (msg.wordCount < 3) {
            deepStats.dryTextCount++;
            deepStats.dryTextByUser[msg.sender] = (deepStats.dryTextByUser[msg.sender] || 0) + 1;
        }

        // Long message: > 50 words ("The Yapper")
        if (msg.wordCount > 50) {
            deepStats.longMessageCount++;
            deepStats.longMessageByUser[msg.sender] = (deepStats.longMessageByUser[msg.sender] || 0) + 1;
        }
    }

    // Calculate ghosting and initiation scores
    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

    for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];
        const timeDiff = curr.timestamp.getTime() - prev.timestamp.getTime();

        // Ghosting: Reply gap > 4 hours (different sender)
        if (prev.sender !== curr.sender && timeDiff > FOUR_HOURS_MS) {
            deepStats.ghostingScore++;
            // The person who "ghosted" is the previous sender
            deepStats.ghostingByUser[prev.sender] = (deepStats.ghostingByUser[prev.sender] || 0) + 1;
        }

        // Initiative: Who starts after 6+ hour break
        if (timeDiff > SIX_HOURS_MS) {
            deepStats.initiationScore[curr.sender] = (deepStats.initiationScore[curr.sender] || 0) + 1;
            deepStats.conversationStarters[curr.sender] = (deepStats.conversationStarters[curr.sender] || 0) + 1;
        }
    }

    return deepStats;
}

/**
 * Parse a single line from the chat
 */
function parseLine(line: string): ParsedMessage | null {
    const trimmed = line.trim();
    if (!trimmed) return null;

    // Try Android format first
    let match = trimmed.match(ANDROID_PATTERN);
    if (match) {
        const [, dateStr, timeStr, ampm, sender, message] = match;
        const timestamp = parseDateTime(dateStr, timeStr, ampm);
        const wordCount = countWords(message);
        return {
            timestamp,
            sender: sender.trim(),
            message: message.trim(),
            hour: timestamp.getHours(),
            wordCount
        };
    }

    // Try iOS format
    match = trimmed.match(IOS_PATTERN);
    if (match) {
        const [, dateStr, timeStr, ampm, sender, message] = match;
        const timestamp = parseDateTime(dateStr, timeStr, ampm);
        const wordCount = countWords(message);
        return {
            timestamp,
            sender: sender.trim(),
            message: message.trim(),
            hour: timestamp.getHours(),
            wordCount
        };
    }

    return null;
}

/**
 * Count words in a message
 */
function countWords(message: string): number {
    return message.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Parse date and time strings into a Date object
 */
function parseDateTime(dateStr: string, timeStr: string, ampm?: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    let [hours, minutes, seconds] = timeStr.split(':').map(Number);

    // Handle 12-hour format
    if (ampm) {
        const isPM = ampm.toLowerCase() === 'pm';
        if (isPM && hours !== 12) hours += 12;
        if (!isPM && hours === 12) hours = 0;
    }

    // Handle 2-digit year
    const fullYear = year < 100 ? 2000 + year : year;

    return new Date(fullYear, month - 1, day, hours, minutes || 0, seconds || 0);
}

/**
 * Check if a message is a system message
 */
function isSystemMessage(message: string): boolean {
    const lower = message.toLowerCase();
    return SYSTEM_MESSAGES.some(sys => lower.includes(sys));
}

/**
 * Calculate average reply time in minutes
 */
function calculateAverageReplyTime(messages: ParsedMessage[]): number {
    if (messages.length < 2) return 0;

    const replyTimes: number[] = [];

    for (let i = 1; i < messages.length; i++) {
        const prev = messages[i - 1];
        const curr = messages[i];

        // Only count if different sender
        if (prev.sender !== curr.sender) {
            const diffMs = curr.timestamp.getTime() - prev.timestamp.getTime();
            const diffMins = diffMs / (1000 * 60);

            // Only count reasonable reply times (< 24 hours)
            if (diffMins > 0 && diffMins < 1440) {
                replyTimes.push(diffMins);
            }
        }
    }

    if (replyTimes.length === 0) return 0;

    const avg = replyTimes.reduce((a, b) => a + b, 0) / replyTimes.length;
    return Math.round(avg * 10) / 10;
}

/**
 * Analyze sentiment of messages
 */
function analyzeSentiment(
    messages: ParsedMessage[],
    language: string
): { sentimentStats: SentimentStats; sentimentByUser: Record<string, SentimentStats> } {
    const sentimentStats: SentimentStats = {
        romance: 0,
        fight: 0,
        food: 0,
        marriage: 0,
        waiting: 0,
        slang: 0
    };

    const sentimentByUser: Record<string, SentimentStats> = {};

    // Get language-specific sentiment words
    const langSentiment = globalSentiment[language] || globalSentiment['en'];

    for (const msg of messages) {
        const lower = msg.message.toLowerCase();

        // Initialize user sentiment if needed
        if (!sentimentByUser[msg.sender]) {
            sentimentByUser[msg.sender] = {
                romance: 0,
                fight: 0,
                food: 0,
                marriage: 0,
                waiting: 0,
                slang: 0
            };
        }

        // Check each category
        for (const [category, words] of Object.entries(langSentiment)) {
            for (const word of words) {
                if (lower.includes(word.toLowerCase())) {
                    sentimentStats[category as keyof SentimentStats]++;
                    sentimentByUser[msg.sender][category as keyof SentimentStats]++;
                    break; // Count once per category per message
                }
            }
        }

        // Check slang (universal)
        for (const slang of slangDictionary) {
            if (lower.includes(slang.toLowerCase())) {
                sentimentStats.slang++;
                sentimentByUser[msg.sender].slang++;
                break;
            }
        }
    }

    return { sentimentStats, sentimentByUser };
}

/**
 * Count usage of custom nicknames
 */
function countNicknames(
    messages: ParsedMessage[],
    customNicknames?: CustomNicknames
): { nicknameCount: Record<string, number>; nicknamesByUser: Record<string, Record<string, number>> } {
    const nicknameCount: Record<string, number> = {};
    const nicknamesByUser: Record<string, Record<string, number>> = {};

    // Combine all nicknames
    const allNicknames = [
        ...(customNicknames?.partnerA_Nicknames || []),
        ...(customNicknames?.partnerB_Nicknames || [])
    ];

    // Also add common nicknames from romance category
    const commonNicknames = [
        'babu', 'shona', 'baby', 'jaan', 'jaanu', 'love', 'babe',
        'honey', 'sweetheart', 'darling', 'cutie'
    ];

    const nicknamesToCheck = [...new Set([...allNicknames, ...commonNicknames])];

    for (const msg of messages) {
        const lower = msg.message.toLowerCase();

        for (const nickname of nicknamesToCheck) {
            const regex = new RegExp(`\\b${escapeRegex(nickname.toLowerCase())}\\b`, 'gi');
            const matches = lower.match(regex);

            if (matches) {
                const count = matches.length;
                nicknameCount[nickname] = (nicknameCount[nickname] || 0) + count;

                if (!nicknamesByUser[msg.sender]) {
                    nicknamesByUser[msg.sender] = {};
                }
                nicknamesByUser[msg.sender][nickname] =
                    (nicknamesByUser[msg.sender][nickname] || 0) + count;
            }
        }
    }

    return { nicknameCount, nicknamesByUser };
}

/**
 * Calculate longest consecutive days with messages
 */
function calculateLongestStreak(messages: ParsedMessage[]): number {
    if (messages.length === 0) return 0;

    const dates = [...new Set(messages.map(m =>
        m.timestamp.toISOString().split('T')[0]
    ))].sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

/**
 * Find most active day of week and hour of day
 */
function findMostActiveTime(messages: ParsedMessage[]): { mostActiveDay: string; mostActiveHour: number } {
    const dayCount: Record<string, number> = {};
    const hourCount: Record<number, number> = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (const msg of messages) {
        const day = days[msg.timestamp.getDay()];
        dayCount[day] = (dayCount[day] || 0) + 1;
        hourCount[msg.hour] = (hourCount[msg.hour] || 0) + 1;
    }

    const mostActiveDay = Object.entries(dayCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Saturday';

    const mostActiveHour = Object.entries(hourCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || '20';

    return { mostActiveDay, mostActiveHour: parseInt(mostActiveHour as string) };
}

/**
 * Count emoji usage in messages
 */
function countEmojis(messages: ParsedMessage[]): number {
    // Unicode emoji regex (simplified)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

    let count = 0;
    for (const msg of messages) {
        const matches = msg.message.match(emojiRegex);
        if (matches) count += matches.length;
    }

    return count;
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
}

/**
 * Calculate viral audit stats (multi-language)
 */
function calculateViralStats(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string
): ViralStats {
    // Helper function to match keywords with word boundaries
    // This prevents 'k' from matching 'book', 'fine' from matching 'define'
    const matchesKeyword = (text: string, keyword: string): boolean => {
        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        // For single characters like 'k', only match if it's the entire message or standalone
        if (lowerKeyword.length === 1) {
            return lowerText === lowerKeyword ||
                lowerText.startsWith(lowerKeyword + ' ') ||
                lowerText.endsWith(' ' + lowerKeyword) ||
                lowerText.includes(' ' + lowerKeyword + ' ');
        }

        // For longer keywords, use word boundary matching
        // Escape special regex characters
        const escaped = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\s|[^a-z])${escaped}($|\\s|[^a-z])`, 'i');
        return regex.test(lowerText);
    };

    const allRedFlags = getAllKeywords(redFlagKeywords);
    const allApologies = getAllKeywords(apologyKeywords);
    const allJealousy = getAllKeywords(jealousyKeywords);
    const allSelfFocused = getAllKeywords(selfFocusedKeywords);
    const allConvoKillers = getAllKeywords(convoKillerKeywords);
    const allLove = getAllKeywords(loveKeywords);
    const allFlirty = getAllKeywords(flirtyKeywords);

    const stats: ViralStats = {
        redFlagCount: 0,
        redFlagByUser: { [partnerA]: 0, [partnerB]: 0 },
        topRedFlags: [],
        apologyCount: 0,
        apologyByUser: { [partnerA]: 0, [partnerB]: 0 },
        jealousyCount: 0,
        jealousyByUser: { [partnerA]: 0, [partnerB]: 0 },
        mainCharacterScore: { [partnerA]: 0, [partnerB]: 0 },
        convoKillerCount: 0,
        convoKillerByUser: { [partnerA]: 0, [partnerB]: 0 },
        loveScore: 0,
        loveByUser: { [partnerA]: 0, [partnerB]: 0 },
        flirtScore: 0,
        flirtByUser: { [partnerA]: 0, [partnerB]: 0 },
        compatibilityScore: 0,
        compatibilityVerdict: ''
    };

    const redFlagFound: Record<string, number> = {};
    const selfFocusedCount: Record<string, number> = { [partnerA]: 0, [partnerB]: 0 };
    const totalMessagesByUser: Record<string, number> = { [partnerA]: 0, [partnerB]: 0 };

    for (const msg of messages) {
        const lowerMsg = msg.message.toLowerCase();
        const sender = msg.sender;
        totalMessagesByUser[sender] = (totalMessagesByUser[sender] || 0) + 1;

        // Red flags - use word boundary matching
        for (const keyword of allRedFlags) {
            if (matchesKeyword(msg.message, keyword)) {
                stats.redFlagCount++;
                stats.redFlagByUser[sender] = (stats.redFlagByUser[sender] || 0) + 1;
                redFlagFound[keyword] = (redFlagFound[keyword] || 0) + 1;
                break; // Only count once per message
            }
        }

        // Apologies - use word boundary matching
        for (const keyword of allApologies) {
            if (matchesKeyword(msg.message, keyword)) {
                stats.apologyCount++;
                stats.apologyByUser[sender] = (stats.apologyByUser[sender] || 0) + 1;
                break;
            }
        }

        // Jealousy - use word boundary matching
        for (const keyword of allJealousy) {
            if (matchesKeyword(msg.message, keyword)) {
                stats.jealousyCount++;
                stats.jealousyByUser[sender] = (stats.jealousyByUser[sender] || 0) + 1;
                break;
            }
        }

        // Self-focused (Main Character) - use includes for these as they're common words
        for (const keyword of allSelfFocused) {
            if (lowerMsg.includes(keyword.toLowerCase())) {
                selfFocusedCount[sender] = (selfFocusedCount[sender] || 0) + 1;
                break;
            }
        }

        // Conversation killer (short replies) - for these, match exact or near-exact
        const isShortReply = msg.wordCount <= 2;
        if (isShortReply) {
            for (const keyword of allConvoKillers) {
                if (lowerMsg === keyword.toLowerCase() || lowerMsg.trim() === keyword.toLowerCase()) {
                    stats.convoKillerCount++;
                    stats.convoKillerByUser[sender] = (stats.convoKillerByUser[sender] || 0) + 1;
                    break;
                }
            }
        }

        // Love expressions - use word boundary matching
        for (const keyword of allLove) {
            if (matchesKeyword(msg.message, keyword)) {
                stats.loveScore++;
                stats.loveByUser[sender] = (stats.loveByUser[sender] || 0) + 1;
                break;
            }
        }

        // Flirty messages - use word boundary matching
        for (const keyword of allFlirty) {
            if (matchesKeyword(msg.message, keyword)) {
                stats.flirtScore++;
                stats.flirtByUser[sender] = (stats.flirtByUser[sender] || 0) + 1;
                break;
            }
        }
    }

    // Calculate main character percentage
    stats.mainCharacterScore[partnerA] = totalMessagesByUser[partnerA] > 0
        ? Math.round((selfFocusedCount[partnerA] / totalMessagesByUser[partnerA]) * 100)
        : 0;
    stats.mainCharacterScore[partnerB] = totalMessagesByUser[partnerB] > 0
        ? Math.round((selfFocusedCount[partnerB] / totalMessagesByUser[partnerB]) * 100)
        : 0;

    // Get top red flags
    stats.topRedFlags = Object.entries(redFlagFound)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([flag]) => flag);

    // Calculate compatibility score (weighted formula)
    const totalMsgs = messages.length;
    const lovePercent = (stats.loveScore / totalMsgs) * 100;
    const redFlagPercent = (stats.redFlagCount / totalMsgs) * 100;
    const jealousyPercent = (stats.jealousyCount / totalMsgs) * 100;
    const apologyBalance = Math.min(
        stats.apologyByUser[partnerA] || 1,
        stats.apologyByUser[partnerB] || 1
    ) / Math.max(
        stats.apologyByUser[partnerA] || 1,
        stats.apologyByUser[partnerB] || 1
    );

    // Base score of 50, adjust based on metrics
    let compatibility = 50;
    compatibility += Math.min(lovePercent * 3, 30); // Love adds up to 30 points
    compatibility -= Math.min(redFlagPercent * 2, 20); // Red flags subtract up to 20
    compatibility -= Math.min(jealousyPercent * 2, 15); // Jealousy subtracts up to 15
    compatibility += apologyBalance * 10; // Balanced apologies add up to 10
    compatibility += stats.flirtScore > 50 ? 5 : 0; // Flirting bonus

    stats.compatibilityScore = Math.max(0, Math.min(100, Math.round(compatibility)));

    // Determine verdict
    if (stats.compatibilityScore >= 85) {
        stats.compatibilityVerdict = 'Soulmate Material \ud83d\udc96';
    } else if (stats.compatibilityScore >= 70) {
        stats.compatibilityVerdict = 'Couple Goals \ud83d\udc91';
    } else if (stats.compatibilityScore >= 55) {
        stats.compatibilityVerdict = 'Work in Progress \ud83d\udee0\ufe0f';
    } else if (stats.compatibilityScore >= 40) {
        stats.compatibilityVerdict = 'Situationship Energy \ud83e\udee0';
    } else {
        stats.compatibilityVerdict = 'Red Flag Central \ud83d\udea9';
    }

    return stats;
}

export default parseChat;
