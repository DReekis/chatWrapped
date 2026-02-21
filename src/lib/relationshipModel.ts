/**
 * Relationship Synergy Model (RSM)
 * 
 * A language-agnostic scoring system for relationship analysis.
 * Works for Banglish, Hinglish, mixed Indian chats without translation or sentiment APIs.
 * 
 * 6 Signal Groups:
 * 1. Structural Behavior (40%) - Initiation, message length, double-texting
 * 2. Timing & Priority (20%) - Reply time analysis
 * 3. Persistence (15%) - Who revives dead chats
 * 4. Phonetic Emotion (10%) - Character stretching, softeners
 * 5. Emoji Coupling (10%) - Emojis in context
 * 6. Language Switching (5%) - Code-switching detection
 */

import { ParsedMessage } from './parseChat';

// ============================================================================
// TYPES
// ============================================================================

export interface RSMResult {
    // Final Scores
    synergyScore: number;           // 0-100 overall relationship score
    relationshipType: string;       // Mapped from score

    // Crush Probabilities
    crushProbability: {
        AtoB: number;               // 0-100%
        BtoA: number;               // 0-100%
    };

    // Power Balance
    powerBalance: {
        status: 'balanced' | 'tilted';
        leadingPartner: string | null;
        tiltPercentage: number;
    };

    // Individual Signal Scores (0-100 each)
    signals: {
        structural: SignalScore;
        timing: SignalScore;
        persistence: SignalScore;
        phonetic: SignalScore;
        emoji: SignalScore;
        languageSwitch: SignalScore;
    };

    // Explainability
    breakdown: string[];            // Human-readable explanations
}

export interface SignalScore {
    partnerA: number;
    partnerB: number;
    combined: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const WEIGHTS = {
    structural: 0.40,
    timing: 0.20,
    persistence: 0.15,
    phonetic: 0.10,
    emoji: 0.10,
    languageSwitch: 0.05
};

// Gap threshold for "conversation restart" (in milliseconds)
const CONVERSATION_GAP_MS = 6 * 60 * 60 * 1000; // 6 hours

// Phonetic patterns for emotion detection (works for Banglish/Hinglish)
const PHONETIC_PATTERNS = {
    // Character stretching indicates emotional intensity
    stretching: /(.)\1{2,}/g,  // aaa, mmm, hhh, etc.

    // Softeners indicate comfort/familiarity
    softeners: /\b(acha|arre|oye|re|uff|yaar|na|haan|hmm|okk+|kk+|hehe|haha|lol|aww+|ohh+)\b/gi,

    // Emotional fillers
    fillers: /\b(hmm+|haan+|naaa+|yaa+|arre+|ufff+|aww+)\b/gi,

    // Cold/low investment replies
    coldReplies: /^(ok|k|hmm|hm|fine|bye|ya|yep|nope|cool|nice)$/i,

    // Question marks indicate engagement
    questions: /\?+/g,

    // Exclamation indicates enthusiasm
    exclamations: /!+/g
};

// Emoji detection
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2764}]|[\u{FE0F}]/gu;

// Language detection patterns (for code-switching)
const LANGUAGE_PATTERNS = {
    english: /\b(the|is|are|was|were|have|has|will|would|could|should|this|that|what|when|where|why|how|you|your|my|me|we|us|they|them|it|its|for|with|from|about|into|through|can|just|also|too|very|much|more|most|some|any|all|each|every|both|few|many|other|another|such|no|not|only|own|same|than|then|now|here|there)\b/gi,

    hindi: /\b(hai|ho|hain|tha|thi|the|kar|karo|kiya|karna|hum|tum|aap|mujhe|tumhe|usko|isko|woh|yeh|kya|kab|kahan|kaun|kaise|kyun|nahi|mat|aur|lekin|ya|par|se|ke|ka|ki|ko|mein|pe|tak)\b/gi,

    bengali: /\b(ami|tumi|apni|tui|koro|korbo|korchi|bolbo|bolchi|ache|acho|acche|kichu|keno|kothay|kokhon|ke|ki|ta|to|na|hobe|hoye|gelo|jabo|jabe|eshe|dekha|bolo)\b/gi
};

// ============================================================================
// MAIN FUNCTION
// ============================================================================

export function calculateRSM(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string
): RSMResult {
    // Validate inputs
    if (!messages || messages.length < 10) {
        return getDefaultResult(partnerA, partnerB);
    }

    const breakdown: string[] = [];

    // Calculate all 6 signals
    const structural = calculateStructuralSignals(messages, partnerA, partnerB, breakdown);
    const timing = calculateTimingSignals(messages, partnerA, partnerB, breakdown);
    const persistence = calculatePersistenceSignals(messages, partnerA, partnerB, breakdown);
    const phonetic = calculatePhoneticSignals(messages, partnerA, partnerB, breakdown);
    const emoji = calculateEmojiSignals(messages, partnerA, partnerB, breakdown);
    const languageSwitch = calculateLanguageSwitchSignals(messages, partnerA, partnerB, breakdown);

    // Calculate weighted synergy score
    const synergyScore = Math.round(
        structural.combined * WEIGHTS.structural +
        timing.combined * WEIGHTS.timing +
        persistence.combined * WEIGHTS.persistence +
        phonetic.combined * WEIGHTS.phonetic +
        emoji.combined * WEIGHTS.emoji +
        languageSwitch.combined * WEIGHTS.languageSwitch
    );

    // Map to relationship type
    const relationshipType = mapScoreToType(synergyScore);

    // Calculate crush probabilities
    const crushProbability = calculateCrushProbability(
        structural, timing, persistence, phonetic,
        partnerA, partnerB
    );

    // Calculate power balance
    const powerBalance = calculatePowerBalance(
        structural, persistence, phonetic,
        partnerA, partnerB
    );

    return {
        synergyScore,
        relationshipType,
        crushProbability,
        powerBalance,
        signals: {
            structural,
            timing,
            persistence,
            phonetic,
            emoji,
            languageSwitch
        },
        breakdown
    };
}

// ============================================================================
// SIGNAL 1: STRUCTURAL BEHAVIOR (40%)
// ============================================================================

function calculateStructuralSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Measures:
     * - Conversation initiation ratio (who starts after 6+ hour gaps)
     * - Message length variance (investment level)
     * - Double-texting behavior (sending without response)
     * - Re-initiation after gaps
     */

    const stats = {
        [partnerA]: { initiations: 0, totalLength: 0, msgCount: 0, doubleTexts: 0 },
        [partnerB]: { initiations: 0, totalLength: 0, msgCount: 0, doubleTexts: 0 }
    };

    let prevSender = '';
    let prevTime: Date | null = null;
    let consecutiveCount = 0;

    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const sender = msg.sender;

        if (sender !== partnerA && sender !== partnerB) continue;

        if (!stats[sender]) {
            stats[sender] = { initiations: 0, totalLength: 0, msgCount: 0, doubleTexts: 0 };
        }

        stats[sender].msgCount++;
        stats[sender].totalLength += msg.message.length;

        // Check for conversation initiation (after 6+ hour gap)
        if (prevTime) {
            const gap = msg.timestamp.getTime() - prevTime.getTime();
            if (gap >= CONVERSATION_GAP_MS) {
                stats[sender].initiations++;
            }
        } else {
            // First message is an initiation
            stats[sender].initiations++;
        }

        // Check for double-texting (consecutive messages without response)
        if (sender === prevSender) {
            consecutiveCount++;
            if (consecutiveCount >= 2) {
                stats[sender].doubleTexts++;
            }
        } else {
            consecutiveCount = 1;
        }

        prevSender = sender;
        prevTime = msg.timestamp;
    }

    // Calculate scores
    const totalInitiations = stats[partnerA].initiations + stats[partnerB].initiations;
    const initiationRatioA = totalInitiations > 0
        ? stats[partnerA].initiations / totalInitiations
        : 0.5;

    const avgLengthA = stats[partnerA].msgCount > 0
        ? stats[partnerA].totalLength / stats[partnerA].msgCount
        : 0;
    const avgLengthB = stats[partnerB].msgCount > 0
        ? stats[partnerB].totalLength / stats[partnerB].msgCount
        : 0;

    // Normalize message length (optimal ~100 chars)
    const lengthScoreA = Math.min(100, (avgLengthA / 100) * 100);
    const lengthScoreB = Math.min(100, (avgLengthB / 100) * 100);

    // Double-texting score (some is good, too much is concerning)
    const dtRatioA = stats[partnerA].msgCount > 0
        ? stats[partnerA].doubleTexts / stats[partnerA].msgCount
        : 0;
    const dtRatioB = stats[partnerB].msgCount > 0
        ? stats[partnerB].doubleTexts / stats[partnerB].msgCount
        : 0;

    // Optimal double-text ratio is 10-20%
    const dtScoreA = dtRatioA > 0.3 ? 50 : Math.min(100, dtRatioA * 500);
    const dtScoreB = dtRatioB > 0.3 ? 50 : Math.min(100, dtRatioB * 500);

    // Combine sub-scores
    const scoreA = (initiationRatioA * 100 * 0.5) + (lengthScoreA * 0.3) + (dtScoreA * 0.2);
    const scoreB = ((1 - initiationRatioA) * 100 * 0.5) + (lengthScoreB * 0.3) + (dtScoreB * 0.2);

    // Add explanations
    const initiationPercent = Math.round(initiationRatioA * 100);
    if (initiationPercent > 60) {
        breakdown.push(`${partnerA} initiates conversations ${initiationPercent}% of the time`);
    } else if (initiationPercent < 40) {
        breakdown.push(`${partnerB} initiates conversations ${100 - initiationPercent}% of the time`);
    } else {
        breakdown.push(`Both partners share conversation initiation fairly`);
    }

    if (Math.abs(avgLengthA - avgLengthB) > 30) {
        const longer = avgLengthA > avgLengthB ? partnerA : partnerB;
        breakdown.push(`${longer} sends more detailed messages on average`);
    }

    return {
        partnerA: Math.round(scoreA),
        partnerB: Math.round(scoreB),
        combined: Math.round((scoreA + scoreB) / 2)
    };
}

// ============================================================================
// SIGNAL 2: TIMING & PRIORITY (20%)
// ============================================================================

function calculateTimingSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Measures reply speed as indicator of priority.
     * priority_index = global_avg_reply_time / chat_specific_reply_time
     * Higher = more prioritization of this conversation.
     */

    const replyTimes: Record<string, number[]> = {
        [partnerA]: [],
        [partnerB]: []
    };

    let lastMsg: ParsedMessage | null = null;

    for (const msg of messages) {
        const sender = msg.sender;
        if (sender !== partnerA && sender !== partnerB) continue;

        if (!replyTimes[sender]) replyTimes[sender] = [];

        if (lastMsg && lastMsg.sender !== sender) {
            // This is a reply
            const replyTime = msg.timestamp.getTime() - lastMsg.timestamp.getTime();
            // Only count reasonable reply times (< 24 hours)
            if (replyTime > 0 && replyTime < 24 * 60 * 60 * 1000) {
                replyTimes[sender].push(replyTime);
            }
        }

        lastMsg = msg;
    }

    // Calculate average reply times
    const avgReplyA = replyTimes[partnerA].length > 0
        ? replyTimes[partnerA].reduce((a, b) => a + b, 0) / replyTimes[partnerA].length
        : Infinity;
    const avgReplyB = replyTimes[partnerB].length > 0
        ? replyTimes[partnerB].reduce((a, b) => a + b, 0) / replyTimes[partnerB].length
        : Infinity;

    // Convert to minutes for display
    const avgReplyMinA = avgReplyA / (60 * 1000);
    const avgReplyMinB = avgReplyB / (60 * 1000);

    // Score based on reply speed (faster = higher score)
    // Optimal: < 10 min = 100, > 120 min = 20
    const scoreA = Math.max(20, Math.min(100, 100 - (avgReplyMinA - 10) * 0.8));
    const scoreB = Math.max(20, Math.min(100, 100 - (avgReplyMinB - 10) * 0.8));

    // Add explanations
    if (avgReplyMinA < avgReplyMinB * 0.5) {
        const ratio = (avgReplyMinB / avgReplyMinA).toFixed(1);
        breakdown.push(`${partnerA} replies ${ratio}× faster than ${partnerB}`);
    } else if (avgReplyMinB < avgReplyMinA * 0.5) {
        const ratio = (avgReplyMinA / avgReplyMinB).toFixed(1);
        breakdown.push(`${partnerB} replies ${ratio}× faster than ${partnerA}`);
    }

    if (avgReplyMinA < 15 && avgReplyMinB < 15) {
        breakdown.push(`Both respond quickly – high mutual priority`);
    }

    return {
        partnerA: Math.round(scoreA),
        partnerB: Math.round(scoreB),
        combined: Math.round((scoreA + scoreB) / 2)
    };
}

// ============================================================================
// SIGNAL 3: PERSISTENCE (15%)
// ============================================================================

function calculatePersistenceSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Measures who keeps the conversation alive:
     * - Reviving dead chats (messages after long silence)
     * - Sending messages without prompts
     * - Random check-ins
     */

    const stats = {
        [partnerA]: { revivals: 0, unprompted: 0, checkIns: 0, total: 0 },
        [partnerB]: { revivals: 0, unprompted: 0, checkIns: 0, total: 0 }
    };

    // Check-in pattern detection
    const checkInPatterns = /\b(kya kar raha|kya kar rahe|kya chal raha|what('s| is)? up|wassup|sup|how('s| is)? it going|thinking (of|about) you|miss(ing)? you|where are you|kahan ho|kya ho raha|sab theek|are you (ok|okay|fine)|ki korcho|ki hocche|busy ho|free ho)\b/gi;

    let lastSender = '';
    let lastTime: Date | null = null;
    let consecutiveFromSame = 0;

    for (const msg of messages) {
        const sender = msg.sender;
        if (sender !== partnerA && sender !== partnerB) continue;

        if (!stats[sender]) {
            stats[sender] = { revivals: 0, unprompted: 0, checkIns: 0, total: 0 };
        }

        stats[sender].total++;

        // Check for revival (message after 6+ hour gap)
        if (lastTime) {
            const gap = msg.timestamp.getTime() - lastTime.getTime();
            if (gap >= CONVERSATION_GAP_MS) {
                stats[sender].revivals++;
            }
        }

        // Check for unprompted messages (2+ consecutive without response)
        if (sender === lastSender) {
            consecutiveFromSame++;
            if (consecutiveFromSame >= 2) {
                stats[sender].unprompted++;
            }
        } else {
            consecutiveFromSame = 1;
        }

        // Check for check-in patterns
        if (checkInPatterns.test(msg.message)) {
            stats[sender].checkIns++;
        }

        lastSender = sender;
        lastTime = msg.timestamp;
    }

    // Calculate persistence score
    const persistenceA =
        (stats[partnerA].revivals * 3) +
        (stats[partnerA].unprompted * 1) +
        (stats[partnerA].checkIns * 2);
    const persistenceB =
        (stats[partnerB].revivals * 3) +
        (stats[partnerB].unprompted * 1) +
        (stats[partnerB].checkIns * 2);

    const totalPersistence = persistenceA + persistenceB || 1;
    const ratioA = persistenceA / totalPersistence;
    const ratioB = persistenceB / totalPersistence;

    const scoreA = Math.round(ratioA * 100);
    const scoreB = Math.round(ratioB * 100);

    // Add explanations
    if (stats[partnerA].revivals > stats[partnerB].revivals * 1.5) {
        breakdown.push(`${partnerA} keeps reviving dead conversations`);
    } else if (stats[partnerB].revivals > stats[partnerA].revivals * 1.5) {
        breakdown.push(`${partnerB} keeps reviving dead conversations`);
    }

    if (stats[partnerA].checkIns > 5 || stats[partnerB].checkIns > 5) {
        const moreCheckIns = stats[partnerA].checkIns > stats[partnerB].checkIns ? partnerA : partnerB;
        breakdown.push(`${moreCheckIns} frequently checks in unprompted`);
    }

    return {
        partnerA: scoreA,
        partnerB: scoreB,
        combined: Math.round((scoreA + scoreB) / 2 +
            Math.min(persistenceA + persistenceB, 50)) // Bonus for overall persistence
    };
}

// ============================================================================
// SIGNAL 4: PHONETIC EMOTION DETECTION (10%)
// ============================================================================

function calculatePhoneticSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Language-agnostic emotion detection via:
     * - Character stretching (hiii, yessss, nooo)
     * - Softeners (acha, arre, oye, yaar)
     * - Emotional fillers (hmm, haan, naaa)
     * - Cold replies (k, ok, fine)
     */

    const stats = {
        [partnerA]: { stretching: 0, softeners: 0, cold: 0, enthusiasm: 0, total: 0 },
        [partnerB]: { stretching: 0, softeners: 0, cold: 0, enthusiasm: 0, total: 0 }
    };

    for (const msg of messages) {
        const sender = msg.sender;
        if (sender !== partnerA && sender !== partnerB) continue;

        if (!stats[sender]) {
            stats[sender] = { stretching: 0, softeners: 0, cold: 0, enthusiasm: 0, total: 0 };
        }

        stats[sender].total++;
        const text = msg.message;

        // Stretching detection
        const stretchMatches = text.match(PHONETIC_PATTERNS.stretching);
        if (stretchMatches) {
            stats[sender].stretching += stretchMatches.length;
        }

        // Softener detection
        const softenerMatches = text.match(PHONETIC_PATTERNS.softeners);
        if (softenerMatches) {
            stats[sender].softeners += softenerMatches.length;
        }

        // Cold reply detection
        if (PHONETIC_PATTERNS.coldReplies.test(text.trim())) {
            stats[sender].cold++;
        }

        // Enthusiasm (questions + exclamations)
        const questions = text.match(PHONETIC_PATTERNS.questions);
        const exclamations = text.match(PHONETIC_PATTERNS.exclamations);
        if (questions) stats[sender].enthusiasm += questions.length;
        if (exclamations) stats[sender].enthusiasm += exclamations.length;
    }

    // Calculate emotional intensity scores
    const intensityA = stats[partnerA].total > 0
        ? ((stats[partnerA].stretching + stats[partnerA].softeners + stats[partnerA].enthusiasm) / stats[partnerA].total) * 30
        - (stats[partnerA].cold / stats[partnerA].total) * 50
        : 0;
    const intensityB = stats[partnerB].total > 0
        ? ((stats[partnerB].stretching + stats[partnerB].softeners + stats[partnerB].enthusiasm) / stats[partnerB].total) * 30
        - (stats[partnerB].cold / stats[partnerB].total) * 50
        : 0;

    const scoreA = Math.max(0, Math.min(100, 50 + intensityA));
    const scoreB = Math.max(0, Math.min(100, 50 + intensityB));

    // Add explanations
    const coldRatioA = stats[partnerA].total > 0 ? stats[partnerA].cold / stats[partnerA].total : 0;
    const coldRatioB = stats[partnerB].total > 0 ? stats[partnerB].cold / stats[partnerB].total : 0;

    if (coldRatioA > 0.1) {
        breakdown.push(`${partnerA} uses cold replies ${Math.round(coldRatioA * 100)}% of the time`);
    }
    if (coldRatioB > 0.1) {
        breakdown.push(`${partnerB} uses cold replies ${Math.round(coldRatioB * 100)}% of the time`);
    }

    if (stats[partnerA].stretching > 20 || stats[partnerB].stretching > 20) {
        breakdown.push(`High emotional expression detected (letter stretching)`);
    }

    if (stats[partnerA].softeners > 30 && stats[partnerB].softeners > 30) {
        breakdown.push(`Both use casual/comfortable language indicators`);
    }

    return {
        partnerA: Math.round(scoreA),
        partnerB: Math.round(scoreB),
        combined: Math.round((scoreA + scoreB) / 2)
    };
}

// ============================================================================
// SIGNAL 5: EMOJI COUPLING (10%)
// ============================================================================

function calculateEmojiSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Context-aware emoji analysis:
     * - Emojis with text = positive
     * - Emoji-only messages = lower investment
     * - Emojis during emotional moments = bonus
     */

    const stats = {
        [partnerA]: { withText: 0, emojiOnly: 0, total: 0, totalEmojis: 0 },
        [partnerB]: { withText: 0, emojiOnly: 0, total: 0, totalEmojis: 0 }
    };

    for (const msg of messages) {
        const sender = msg.sender;
        if (sender !== partnerA && sender !== partnerB) continue;

        if (!stats[sender]) {
            stats[sender] = { withText: 0, emojiOnly: 0, total: 0, totalEmojis: 0 };
        }

        const emojis = msg.message.match(EMOJI_REGEX);
        if (!emojis) continue;

        stats[sender].total++;
        stats[sender].totalEmojis += emojis.length;

        // Check if emoji-only (after removing emojis, is there text?)
        const textOnly = msg.message.replace(EMOJI_REGEX, '').trim();
        if (textOnly.length < 3) {
            stats[sender].emojiOnly++;
        } else {
            stats[sender].withText++;
        }
    }

    // Calculate scores (withText is positive, emojiOnly is neutral/slightly negative)
    const scoreA = stats[partnerA].total > 0
        ? Math.min(100, (stats[partnerA].withText / stats[partnerA].total) * 100 +
            (stats[partnerA].totalEmojis > 50 ? 20 : 0))
        : 50;

    const scoreB = stats[partnerB].total > 0
        ? Math.min(100, (stats[partnerB].withText / stats[partnerB].total) * 100 +
            (stats[partnerB].totalEmojis > 50 ? 20 : 0))
        : 50;

    // Add explanations
    const totalEmojis = stats[partnerA].totalEmojis + stats[partnerB].totalEmojis;
    if (totalEmojis > 200) {
        breakdown.push(`Heavy emoji usage detected – expressive conversation`);
    }

    if (stats[partnerA].emojiOnly > stats[partnerA].withText) {
        breakdown.push(`${partnerA} often responds with just emojis`);
    }
    if (stats[partnerB].emojiOnly > stats[partnerB].withText) {
        breakdown.push(`${partnerB} often responds with just emojis`);
    }

    return {
        partnerA: Math.round(scoreA),
        partnerB: Math.round(scoreB),
        combined: Math.round((scoreA + scoreB) / 2)
    };
}

// ============================================================================
// SIGNAL 6: LANGUAGE SWITCHING (5%)
// ============================================================================

function calculateLanguageSwitchSignals(
    messages: ParsedMessage[],
    partnerA: string,
    partnerB: string,
    breakdown: string[]
): SignalScore {
    /**
     * Detects code-switching (mixing English/Hindi/Bengali).
     * Increased code-switching during emotional moments = higher involvement.
     */

    const stats = {
        [partnerA]: { switchCount: 0, total: 0 },
        [partnerB]: { switchCount: 0, total: 0 }
    };

    let prevLang: Record<string, string> = {};

    for (const msg of messages) {
        const sender = msg.sender;
        if (sender !== partnerA && sender !== partnerB) continue;

        if (!stats[sender]) {
            stats[sender] = { switchCount: 0, total: 0 };
        }

        stats[sender].total++;

        // Detect dominant language
        const text = msg.message;
        const engWords = (text.match(LANGUAGE_PATTERNS.english) || []).length;
        const hindiWords = (text.match(LANGUAGE_PATTERNS.hindi) || []).length;
        const bengaliWords = (text.match(LANGUAGE_PATTERNS.bengali) || []).length;

        let currentLang = 'mixed';
        const maxWords = Math.max(engWords, hindiWords, bengaliWords);
        if (maxWords > 2) {
            if (engWords === maxWords) currentLang = 'english';
            else if (hindiWords === maxWords) currentLang = 'hindi';
            else currentLang = 'bengali';
        }

        // Check for language switch
        if (prevLang[sender] && prevLang[sender] !== currentLang && currentLang !== 'mixed') {
            stats[sender].switchCount++;
        }

        if (currentLang !== 'mixed') {
            prevLang[sender] = currentLang;
        }
    }

    // Higher switching = more emotional engagement
    const switchRatioA = stats[partnerA].total > 0 ? stats[partnerA].switchCount / stats[partnerA].total : 0;
    const switchRatioB = stats[partnerB].total > 0 ? stats[partnerB].switchCount / stats[partnerB].total : 0;

    // Optimal switch rate is around 10-20%
    const scoreA = Math.min(100, 50 + switchRatioA * 500);
    const scoreB = Math.min(100, 50 + switchRatioB * 500);

    // Add explanations
    if (switchRatioA > 0.1 || switchRatioB > 0.1) {
        breakdown.push(`Language mirroring detected – natural code-switching`);
    }

    return {
        partnerA: Math.round(scoreA),
        partnerB: Math.round(scoreB),
        combined: Math.round((scoreA + scoreB) / 2)
    };
}

// ============================================================================
// CRUSH PROBABILITY CALCULATION
// ============================================================================

function calculateCrushProbability(
    structural: SignalScore,
    timing: SignalScore,
    persistence: SignalScore,
    phonetic: SignalScore,
    partnerA: string,
    partnerB: string
): { AtoB: number; BtoA: number } {
    /**
     * Crush(X → Y) = 
     *   0.35 * initiation_X +
     *   0.30 * emotional_load_X +
     *   0.20 * persistence_X +
     *   0.15 * priority_X
     */

    const crushAtoB = Math.round(
        0.35 * structural.partnerA +  // Initiation
        0.30 * phonetic.partnerA +    // Emotional load
        0.20 * persistence.partnerA + // Persistence
        0.15 * timing.partnerA        // Priority
    );

    const crushBtoA = Math.round(
        0.35 * structural.partnerB +
        0.30 * phonetic.partnerB +
        0.20 * persistence.partnerB +
        0.15 * timing.partnerB
    );

    return {
        AtoB: Math.min(100, crushAtoB),
        BtoA: Math.min(100, crushBtoA)
    };
}

// ============================================================================
// POWER BALANCE CALCULATION
// ============================================================================

function calculatePowerBalance(
    structural: SignalScore,
    persistence: SignalScore,
    phonetic: SignalScore,
    partnerA: string,
    partnerB: string
): { status: 'balanced' | 'tilted'; leadingPartner: string | null; tiltPercentage: number } {
    /**
     * Compare initiation, persistence, emotional load.
     * If one leads by ≥15% → tilted
     */

    const avgA = (structural.partnerA + persistence.partnerA + phonetic.partnerA) / 3;
    const avgB = (structural.partnerB + persistence.partnerB + phonetic.partnerB) / 3;

    const total = avgA + avgB || 1;
    const ratioA = avgA / total;
    const ratioB = avgB / total;

    const tilt = Math.abs(ratioA - ratioB) * 100;

    if (tilt >= 15) {
        return {
            status: 'tilted',
            leadingPartner: ratioA > ratioB ? partnerA : partnerB,
            tiltPercentage: Math.round(tilt)
        };
    }

    return {
        status: 'balanced',
        leadingPartner: null,
        tiltPercentage: Math.round(tilt)
    };
}

// ============================================================================
// RELATIONSHIP TYPE MAPPING
// ============================================================================

function mapScoreToType(score: number): string {
    if (score >= 81) return 'Deep Emotional Bond 💕';
    if (score >= 66) return 'Mutual Romantic Interest 💘';
    if (score >= 46) return 'Emotional Attachment Forming 💭';
    if (score >= 26) return 'Friendly Bond 🤝';
    return 'Casual / Low Emotional Relevance 👋';
}

// ============================================================================
// DEFAULT RESULT (for insufficient data)
// ============================================================================

function getDefaultResult(partnerA: string, partnerB: string): RSMResult {
    const defaultSignal: SignalScore = { partnerA: 50, partnerB: 50, combined: 50 };

    return {
        synergyScore: 50,
        relationshipType: 'Insufficient Data 📊',
        crushProbability: { AtoB: 50, BtoA: 50 },
        powerBalance: { status: 'balanced', leadingPartner: null, tiltPercentage: 0 },
        signals: {
            structural: defaultSignal,
            timing: defaultSignal,
            persistence: defaultSignal,
            phonetic: defaultSignal,
            emoji: defaultSignal,
            languageSwitch: defaultSignal
        },
        breakdown: ['Not enough messages to analyze accurately']
    };
}

export default calculateRSM;
