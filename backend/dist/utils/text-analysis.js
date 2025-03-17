"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTextMetrics = exports.calculateReadabilityScore = void 0;
/**
 * Calculate readability score (Flesch-Kincaid)
 */
const calculateReadabilityScore = (text) => {
    // Count sentences
    const sentenceCount = countSentences(text);
    if (sentenceCount === 0)
        return 0;
    // Count words
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    if (wordCount === 0)
        return 0;
    // Count syllables
    const syllableCount = words.reduce((count, word) => count + countSyllables(word), 0);
    // Flesch-Kincaid Grade Level formula
    const score = 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
    // Clamp to reasonable range
    return Math.max(0, Math.min(100, score));
};
exports.calculateReadabilityScore = calculateReadabilityScore;
/**
 * Count syllables in a word
 */
const countSyllables = (word) => {
    word = word.toLowerCase();
    // Count vowel groups
    let count = 0;
    let isVowel = false;
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const isCurrentVowel = 'aeiouy'.includes(char);
        if (isCurrentVowel && !isVowel) {
            count++;
        }
        isVowel = isCurrentVowel;
    }
    // Adjust for common patterns
    if (word.length > 2 && word.endsWith('e') && !word.endsWith('le')) {
        count--;
    }
    // Every word has at least one syllable
    return Math.max(1, count);
};
/**
 * Count sentences in text
 */
const countSentences = (text) => {
    // Simple sentence counting based on punctuation
    const sentenceEndings = text.match(/[.!?]+/g);
    return sentenceEndings ? sentenceEndings.length : 0;
};
/**
 * Calculate lexical diversity (Type-Token Ratio)
 */
const calculateLexicalDiversity = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0)
        return 0;
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
};
/**
 * Detect passive voice percentage
 */
const calculatePassiveVoicePercentage = (text) => {
    // Simple passive voice detection (more accurate detection would require NLP)
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    if (sentences.length === 0)
        return 0;
    // Look for common passive voice patterns
    const passivePatterns = [
        /\b(?:am|is|are|was|were|be|being|been)\s+\w+ed\b/i,
        /\b(?:am|is|are|was|were|be|being|been)\s+\w+en\b/i,
        /\b(?:has|have|had)\s+been\s+\w+ed\b/i,
        /\b(?:has|have|had)\s+been\s+\w+en\b/i
    ];
    let passiveCount = 0;
    for (const sentence of sentences) {
        if (passivePatterns.some(pattern => pattern.test(sentence))) {
            passiveCount++;
        }
    }
    return (passiveCount / sentences.length) * 100;
};
/**
 * Calculate first person percentage
 */
const calculateFirstPersonPercentage = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0)
        return 0;
    const firstPersonPronouns = ['i', 'me', 'my', 'mine', 'myself', 'we', 'us', 'our', 'ours', 'ourselves'];
    let firstPersonCount = 0;
    for (const word of words) {
        if (firstPersonPronouns.includes(word)) {
            firstPersonCount++;
        }
    }
    return (firstPersonCount / words.length) * 100;
};
/**
 * Calculate third person percentage
 */
const calculateThirdPersonPercentage = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0)
        return 0;
    const thirdPersonPronouns = ['he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves'];
    let thirdPersonCount = 0;
    for (const word of words) {
        if (thirdPersonPronouns.includes(word)) {
            thirdPersonCount++;
        }
    }
    return (thirdPersonCount / words.length) * 100;
};
/**
 * Calculate punctuation density
 */
const calculatePunctuationDensity = (text) => {
    const characters = text.length;
    if (characters === 0)
        return 0;
    const punctuationCount = (text.match(/[.,;:!?"\[\]\(\)\{\}'"-]/g) || []).length;
    return punctuationCount / characters;
};
/**
 * Calculate n-gram uniqueness
 */
const calculateNGramUniqueness = (text, n = 3) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length < n)
        return 1; // If text is shorter than n, uniqueness is 100%
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ');
        ngrams.push(ngram);
    }
    const uniqueNgrams = new Set(ngrams);
    return uniqueNgrams.size / ngrams.length;
};
/**
 * Calculate predictability score
 */
const calculatePredictabilityScore = (text) => {
    // Calculate predictability based on n-gram uniqueness
    const bigrams = calculateNGramUniqueness(text, 2);
    const trigrams = calculateNGramUniqueness(text, 3);
    const quadgrams = calculateNGramUniqueness(text, 4);
    // Higher uniqueness means lower predictability
    return 1 - ((bigrams + trigrams + quadgrams) / 3);
};
/**
 * Calculate academic language score
 */
const calculateAcademicLanguageScore = (text) => {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0)
        return 0;
    // List of common academic words
    const academicWords = new Set([
        'analysis', 'approach', 'assessment', 'assume', 'authority', 'available', 'benefit', 'concept',
        'consistent', 'constitutional', 'context', 'contract', 'create', 'data', 'definition', 'derived',
        'distribution', 'economic', 'environment', 'established', 'estimate', 'evidence', 'export', 'factors',
        'financial', 'formula', 'function', 'identified', 'income', 'indicate', 'individual', 'interpretation',
        'involvement', 'issues', 'legal', 'legislation', 'major', 'method', 'occurrence', 'percent', 'period',
        'policy', 'principle', 'procedure', 'process', 'required', 'research', 'response', 'role', 'section',
        'significant', 'similar', 'source', 'specific', 'structure', 'theory', 'variables', 'therefore',
        'furthermore', 'however', 'nevertheless', 'thus', 'consequently', 'hence', 'moreover', 'whereas',
        'nonetheless', 'subsequently', 'accordingly', 'alternatively', 'conversely', 'initially',
        'ultimately', 'namely', 'potentially', 'previously', 'primarily', 'relatively', 'approximately',
        'significantly', 'substantially', 'sufficiently', 'predominantly', 'arguably', 'crucially',
        'fundamental', 'considerable', 'constitute', 'demonstrate', 'establish', 'illustrate', 'imply',
        'indicate', 'obtain', 'perceive', 'propose', 'pursue', 'reflect', 'suggest', 'determine', 'implement'
    ]);
    // Count academic words
    let academicWordCount = 0;
    for (const word of words) {
        if (academicWords.has(word.replace(/[.,;:!?()]/g, ''))) {
            academicWordCount++;
        }
    }
    // Calculate the percentage of academic words
    const academicPercentage = academicWordCount / words.length;
    // Normalize to a 0-1 scale where:
    // - 0% academic words = 0
    // - 10%+ academic words = 1 (academic papers typically have 10-20% academic words)
    return Math.min(academicPercentage * 10, 1);
};
/**
 * Calculate comprehensive text metrics
 */
const calculateTextMetrics = (text) => {
    // Count words
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const totalWordCount = words.length;
    // Count sentences
    const sentenceCount = countSentences(text);
    // Calculate average sentence length
    const averageSentenceLength = sentenceCount > 0 ? totalWordCount / sentenceCount : 0;
    // Calculate unique word count
    const uniqueWords = new Set(words);
    const uniqueWordCount = uniqueWords.size;
    // Calculate all metrics
    return {
        // Word and Structure Metrics
        totalWordCount,
        sentenceCount,
        averageSentenceLength,
        readabilityScore: (0, exports.calculateReadabilityScore)(text),
        // Vocabulary Metrics
        lexicalDiversity: calculateLexicalDiversity(text),
        uniqueWordCount,
        academicLanguageScore: calculateAcademicLanguageScore(text),
        // Style Metrics
        passiveVoicePercentage: calculatePassiveVoicePercentage(text),
        firstPersonPercentage: calculateFirstPersonPercentage(text),
        thirdPersonPercentage: calculateThirdPersonPercentage(text),
        // Grammar & Mechanics
        punctuationDensity: calculatePunctuationDensity(text),
        grammarErrorCount: 0, // Would require more sophisticated NLP
        spellingErrorCount: 0, // Would require dictionary lookup or spell-checking library
        // Additional AI Detection Metrics
        predictabilityScore: calculatePredictabilityScore(text),
        nGramUniqueness: calculateNGramUniqueness(text)
    };
};
exports.calculateTextMetrics = calculateTextMetrics;
