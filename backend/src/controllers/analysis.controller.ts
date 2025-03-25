import { Request, Response } from 'express';
import * as documentService from '../services/document.service';
import * as analysisService from '../services/analysis.service';
import { ApiResponse } from '../types/response';

/**
 * Analyze a document for AI content
 */
export const analyzeDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(id);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Check if analysis already exists
        const existingAnalysis = await analysisService.getAnalysisByDocumentId(id);
        if (existingAnalysis) {
            const response: ApiResponse = {
                success: true,
                message: 'Document analysis already exists',
                analysisId: existingAnalysis.id
            };
            res.status(200).json(response);
            return;
        }

        const analysisJob = await analysisService.initiateAnalysis(document);

        const response: ApiResponse = {
            success: true,
            message: 'Document analysis initiated',
            analysisId: analysisJob.id
        };

        res.status(202).json(response);
    } catch (error) {
        console.error('Error analyzing document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to analyze document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get AI analysis results for a document
 */
export const getAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(id);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get analysis results
        const analysis = await analysisService.getAnalysisByDocumentId(id);

        if (!analysis) {
            const response: ApiResponse = {
                success: false,
                message: 'Analysis not found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            analysis
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting analysis:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get analysis',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get document sections with AI detection
 */
export const getDocumentSections = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(id);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get sections
        const sections = await analysisService.getDocumentSections(id);

        if (!sections || sections.length === 0) {
            const response: ApiResponse = {
                success: false,
                message: 'No sections found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            sections
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting document sections:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get document sections',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Get document text metrics
 */
export const getTextMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get document from service
        const document = await documentService.getDocumentById(id);

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (document.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, document.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get metrics
        const metrics = await analysisService.getTextMetrics(id);

        if (!metrics) {
            const response: ApiResponse = {
                success: false,
                message: 'No metrics found. You may need to initiate analysis first.'
            };
            res.status(404).json(response);
            return;
        }

        const response: ApiResponse = {
            success: true,
            metrics
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting text metrics:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get text metrics',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};