// src/schemas/analysisSchema.ts
import { z } from 'zod';

// Schema for analyzing a document
export const analyzeDocumentSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});

// Schema for getting AI analysis results
export const getAnalysisSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid analysis ID' })
    })
});

// Schema for getting document sections
export const getSectionsSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});

// Schema for getting text metrics
export const getMetricsSchema = z.object({
    params: z.object({
        id: z.string().cuid({ message: 'Invalid document ID' })
    })
});

// Schema for updating analysis status (internal use)
export const updateAnalysisStatusSchema = z.object({
    body: z.object({
        status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
        message: z.string().optional()
    })
});

// Schema for feedback on analysis accuracy
export const submitAnalysisFeedbackSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid analysis ID' })
    }),
    body: z.object({
        isAccurate: z.boolean(),
        comments: z.string().optional()
    })
});

// Schema for requesting re-analysis
export const reanalyzeDocumentSchema = z.object({
    params: z.object({
        id: z.string().uuid({ message: 'Invalid document ID' })
    }),
    body: z.object({
        force: z.boolean().optional().default(false)
    })
});