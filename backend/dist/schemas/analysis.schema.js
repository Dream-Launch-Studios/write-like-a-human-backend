"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reanalyzeDocumentSchema = exports.submitAnalysisFeedbackSchema = exports.updateAnalysisStatusSchema = exports.getMetricsSchema = exports.getSectionsSchema = exports.getAnalysisSchema = exports.analyzeDocumentSchema = void 0;
// src/schemas/analysisSchema.ts
const zod_1 = require("zod");
// Schema for analyzing a document
exports.analyzeDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
// Schema for getting AI analysis results
exports.getAnalysisSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid analysis ID' })
    })
});
// Schema for getting document sections
exports.getSectionsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
// Schema for getting text metrics
exports.getMetricsSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid({ message: 'Invalid document ID' })
    })
});
// Schema for updating analysis status (internal use)
exports.updateAnalysisStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['PENDING', 'COMPLETED', 'FAILED']),
        message: zod_1.z.string().optional()
    })
});
// Schema for feedback on analysis accuracy
exports.submitAnalysisFeedbackSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid analysis ID' })
    }),
    body: zod_1.z.object({
        isAccurate: zod_1.z.boolean(),
        comments: zod_1.z.string().optional()
    })
});
// Schema for requesting re-analysis
exports.reanalyzeDocumentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid({ message: 'Invalid document ID' })
    }),
    body: zod_1.z.object({
        force: zod_1.z.boolean().optional().default(false)
    })
});
