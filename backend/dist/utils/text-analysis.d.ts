import { TextMetricsData } from '../types/analysis.types';
/**
 * Calculate readability score (Flesch-Kincaid)
 */
export declare const calculateReadabilityScore: (text: string) => number;
/**
 * Calculate comprehensive text metrics
 */
export declare const calculateTextMetrics: (text: string) => TextMetricsData;
