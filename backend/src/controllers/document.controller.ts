import { Request, Response } from 'express';
import * as documentService from '../services/document.service';
import * as pdfService from '../services/pdf.service';
import { ApiResponse } from '../types/response';
import { uploadFileToSupabase } from '../utils/supabase'; // Adjust the import path as needed
import { DocumentSection, TextMetricsData } from '../types/analysis.types';
import { AIWordSuggestion } from '../types/word-suggestion.types';
import { openai } from '../lib/openai';
import prisma from '../config/config';
import { createLogger } from '../utils/logger';


const logger = createLogger('DocumentController');

type FeedbackMetricsVersion2 = {
    structuralComparison: {
        sentenceLengthChange: number; // 0 - 100
        paragraphStructureScore: number; // 0 - 100
        headingConsistencyScore: number; // 0 - 100
    };
    vocabularyMetrics: {
        lexicalDiversityChange: number; // 0 - 100
        wordRepetitionScore: number; // 0 - 100
        formalityShift: number; // 0 - 100
    };
    styleMetrics: {
        readabilityChange: number; // 0 - 100
        voiceConsistencyScore: number; // 0 - 100
        perspectiveShift: number; // 0 - 100
        descriptiveLanguageScore: number; // 0 - 100
    };
    grammarAndMechanics: {
        punctuationChangeScore: number; // 0 - 100
        grammarPatternScore: number; // 0 - 100
        spellingVariationScore: number; // 0 - 100
    };
    topicThematicElements: {
        thematicConsistencyScore: number; // 0 - 100
        keywordFrequencyChange: number; // 0 - 100
        argumentDevelopmentScore: number; // 0 - 100
    };
    similarityMetrics: {
        nGramSimilarityScore: number; // 0 - 100
        tfIdfSimilarityScore: number; // 0 - 100
        jaccardSimilarityScore: number; // 0 - 100
    };
    aIDetection: {
        originalityShiftScore: number; // 0 - 100
    };
};


/**
 * Upload and create a new document
 */
export const createDocument = async (req: Request, res: Response): Promise<void> => {
    try {

        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        // Extract text from the PDF
        const pdfBuffer = req.file.buffer;
        let content: string;

        try {
            // content = await pdfService.extractTextFromPdf(pdfBuffer);
            content = await pdfService.extractHtmlFromPdf(pdfBuffer);

            console.log(`📃 PDF content: ${content}`);
        } catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            const response: ApiResponse = {
                success: false,
                message: 'Error processing document',
                error: pdfError instanceof Error ? pdfError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }

        // Get document data from validated request
        // @ts-ignore
        const { title = req.file.originalname, groupId, contentFormat } = req.body;

        // Create document in the database
        const document = await documentService.createDocument({
            title,
            content,
            // @ts-ignore
            fileName: req.file.originalname,
            fileUrl: '', // Not storing the file, just the content
            // @ts-ignore
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            userId: req.user.id,
            groupId: groupId || null,
            contentFormat: contentFormat
        });

        const response: ApiResponse = {
            success: true,
            message: 'Document uploaded successfully',
            document: {
                id: document.id,
                title: document.title,
                fileName: document.fileName,
                createdAt: document.createdAt
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};

/**
 * Convert a PDF file to HTML
 * For use in rich text editors
 */
export const convertPdfToHtml = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        // Validate the PDF
        const pdfBuffer = req.file.buffer;
        const isValidPdf = await pdfService.validatePdf(pdfBuffer);

        if (!isValidPdf) {
            const response: ApiResponse = {
                success: false,
                message: 'Invalid PDF file'
            };
            res.status(422).json(response);
            return;
        }

        try {
            // Extract HTML content from the PDF
            const htmlContent = await pdfService.extractHtmlFromPdf(pdfBuffer);

            const response: ApiResponse = {
                success: true,
                message: 'PDF converted to HTML successfully',
                data: {
                    html: htmlContent,
                    fileName: req.file.originalname,
                    fileSize: req.file.size
                }
            };

            res.status(200).json(response);
        } catch (conversionError) {
            console.error('PDF conversion error:', conversionError);
            const response: ApiResponse = {
                success: false,
                message: 'Error converting PDF to HTML',
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
    } catch (error) {
        console.error('Error in PDF to HTML conversion:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to convert PDF to HTML',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const createDocumentFromHtml = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Validate based on file type
        let isValid = false;
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);
            if (!isValid) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Invalid PDF file'
                };
                res.status(422).json(response);
                return;
            }
        } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            isValid = await pdfService.validateDocx(fileBuffer);
            if (!isValid) {
                const response: ApiResponse = {
                    success: false,
                    message: 'Invalid DOCX file'
                };
                res.status(422).json(response);
                return;
            }
        } else {
            const response: ApiResponse = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            };
            res.status(422).json(response);
            return;
        }

        let htmlContent: string;
        try {
            // Extract HTML using the appropriate method
            htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);
        } catch (conversionError) {
            console.error('Document conversion error:', conversionError);
            const response: ApiResponse = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }

        // Upload file to Supabase storage (unchanged)
        const uploadResult = await uploadFileToSupabase(
            fileBuffer,
            req.file.originalname,
            mimeType,
            req.user.id
        );

        // Handle upload failure (unchanged)
        if (!uploadResult.success) {
            const response: ApiResponse = {
                success: false,
                message: 'Failed to upload file to storage',
                error: uploadResult.error
            };
            res.status(500).json(response);
            return;
        }

        // Get document data from validated request
        const title = req.body.title || req.file.originalname;
        const groupId = req.body.groupId;

        // Create document in the database with HTML content and file URL
        const document = await documentService.createDocument({
            title,
            content: htmlContent, // Store HTML content instead of plain text
            contentFormat: 'HTML', // Add this field to your document model
            fileName: req.file.originalname,
            fileUrl: uploadResult.fileUrl ?? "", // Now storing the file URL from Supabase
            fileType: mimeType,
            fileSize: req.file.size,
            userId: req.user.id,
            groupId: groupId || null
        });

        const response: ApiResponse = {
            success: true,
            message: `Document created from ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} with HTML formatting`,
            document: {
                id: document.id,
                title: document.title,
                fileName: document.fileName,
                fileUrl: document.fileUrl, // Include the file URL in the response
                createdAt: document.createdAt,
                contentFormat: 'html'
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating HTML document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create HTML document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};



export const createAndAnalyzeDocumentWithAI = async (req: Request, res: Response): Promise<void> => {
    const processingTimer = logger.startTimer();
    const requestId = `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    logger.info(`Starting document processing`, {
        requestId,
        fileSize: req.file?.size,
        fileType: req.file?.mimetype,
        userId: req.user?.id
    });

    try {
        // Step 1: Validate request and extract file
        if (!req.file) {
            logger.warn(`No file uploaded`, { requestId });
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        logger.info(`File received for processing`, {
            requestId,
            fileSize: fileBuffer.length,
            mimeType,
            fileName: req.file.originalname
        });

        // Step 2: Extract HTML content from the document
        logger.info(`Starting HTML extraction`, { requestId });
        const htmlExtractionTimer = logger.startTimer();
        let htmlContent: string;
        try {
            // Extract HTML using the appropriate method
            htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);
            logger.logTimed('info', `HTML extraction completed`, htmlExtractionTimer(), {
                requestId,
                contentLength: htmlContent.length
            });
        } catch (conversionError) {
            logger.error('Document conversion failed', conversionError as Error, { requestId });
            const response: ApiResponse = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }

        // Step 3: Upload file to Supabase storage
        logger.info(`Starting file upload to storage`, { requestId });
        const uploadTimer = logger.startTimer();
        const uploadResult = await uploadFileToSupabase(
            fileBuffer,
            req.file.originalname,
            mimeType,
            req.user.id
        );

        logger.logTimed('info', `File upload completed`, uploadTimer(), {
            requestId,
            success: uploadResult.success,
            fileUrl: uploadResult.fileUrl
        });

        // Handle upload failure
        if (!uploadResult.success) {
            logger.error('File upload failed', new Error(uploadResult.error || 'Unknown upload error'), { requestId });
            const response: ApiResponse = {
                success: false,
                message: 'Failed to upload file to storage',
                error: uploadResult.error
            };
            res.status(500).json(response);
            return;
        }

        // Step 4: Call OpenAI API to analyze the document
        logger.info(`Starting OpenAI analysis`, { requestId });
        const aiAnalysisTimer = logger.startTimer();

        const prompt = `
    You have the analyze the document content, Return data in the following JSON:
    {
      "textMetrics": {
        "totalWordCount": "number",
        "sentenceCount": "number",
        "averageSentenceLength": "number",
        "readabilityScore": "number (0% - 100%)",
        "lexicalDiversity": "number (0% - 1%)",
        "uniqueWordCount": "number",
        "academicLanguageScore": "number (0 - 1)",
        "passiveVoicePercentage": "number (0% - 100%)",
        "firstPersonPercentage": "number (0% - 100%)",
        "thirdPersonPercentage": "number (0% - 100%)",
        "punctuationDensity": "number (0 - 1)",
        "grammarErrorCount": "number",
        "spellingErrorCount": "number",
        "predictabilityScore": "number (0 - 1)",
        "nGramUniqueness": "number (0 - 1)"
      },
      "sections": [
        {
          "startOffset": "number",
          "endOffset": "number",
          "content": "string",
          "isAiGenerated": "boolean",
          "aiConfidence": "number (0% - 100%)",
          "suggestions": "string"
        },
        ...
      ],
      "wordSuggestions": [
        {
          "originalWord": "string",
          "suggestedWord": "string",
          "position": "number",
          "startOffset": "number",
          "endOffset": "number",
          "context": "string",
          "aiConfidence": "number (0% - 100%)"
        }
      ],
      "feedbackMetrics": {
        "structuralComparison": {
          "sentenceLengthChange": "number (0 - 100)",
          "paragraphStructureScore": "number (0 - 100)",
          "headingConsistencyScore": "number (0 - 100)"
        },
        "vocabularyMetrics": {
          "lexicalDiversityChange": "number (0 - 100)",
          "wordRepetitionScore": "number (0 - 100)" ,
          "formalityShift": "number (0 - 100)"
        },
        "styleMetrics": {
          "readabilityChange": "number (0 - 100)",
          "voiceConsistencyScore": "number (0 - 100)",
          "perspectiveShift": "number (0 - 100)",
          "descriptiveLanguageScore": "number (0 - 100)"
        },
        "grammarAndMechanics": {
          "punctuationChangeScore": "number (0 - 100)",
          "grammarPatternScore": "number (0 - 100)",
          "spellingVariationScore": "number (0 - 100)"
        },
        "topicThematicElements": {
          "thematicConsistencyScore": "number (0 - 100)",
          "keywordFrequencyChange": "number (0 - 100)",
          "argumentDevelopmentScore": "number (0 - 100)"
        },
        "similarityMetrics": {
          "nGramSimilarityScore": "number (0 - 100)",
          "tfIdfSimilarityScore": "number (0 - 100)",
          "jaccardSimilarityScore": "number (0 - 100)"
        },
        "aIDetection": {
          "originalityShiftScore": "number (0 - 100)"
        }
      },
      "overallAiScore": "number (0 - 100) (How much of the content is likely to be AI-generated)",
      "humanWrittenPercent": "number (0% - 100%)",
      "aiGeneratedPercent" : "number (0% - 100%)"
    }

   To generate the "wordSuggestions" identify words or phrases that could be improved to make the writing appear more human-like and less AI-generated. and to generate "sections" divide the given document content in sections/parts and evaluate. Here is the document content:
   
    ${htmlContent}
    `;

        let parsedResponse: {
            textMetrics: TextMetricsData;
            sections: Omit<DocumentSection, "id" | "aiAnalysisId">[];
            wordSuggestions: AIWordSuggestion[];
            feedbackMetrics: FeedbackMetricsVersion2;
            overallAiScore: number;
            humanWrittenPercent: number;
            aiGeneratedPercent: number;
        };

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [{
                    content: prompt,
                    role: "system",
                }],
                response_format: { type: "json_object" },
                temperature: 0.3,
            });

            const responseContent = response.choices[0].message.content || "{}";
            parsedResponse = JSON.parse(responseContent);

            logger.logTimed('info', `OpenAI analysis completed`, aiAnalysisTimer(), {
                requestId,
                overallAiScore: parsedResponse.overallAiScore,
                wordCount: parsedResponse.textMetrics.totalWordCount,
                sectionCount: parsedResponse.sections.length,
                suggestionCount: parsedResponse.wordSuggestions.length
            });
        } catch (aiError) {
            logger.error('OpenAI analysis failed', aiError as Error, { requestId });
            res.status(500).json({
                success: false,
                message: 'Failed to analyze document content',
                error: aiError instanceof Error ? aiError.message : 'Unknown error'
            });
            return;
        }

        // Step 5: Create all database records in a transaction
        logger.info(`Starting database transaction`, { requestId });
        const dbTimer = logger.startTimer();
        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Create document
                const title = req.body.title || req?.file?.originalname;
                logger.debug(`Creating document record`, { requestId, title });
                const document = await tx.document.create({
                    data: {
                        title: title,
                        content: htmlContent,
                        fileName: req?.file?.originalname ?? title,
                        fileUrl: uploadResult?.fileUrl ?? "",
                        fileType: mimeType,
                        fileSize: req?.file?.size ?? 0,
                        userId: req.user.id,
                        versionNumber: 1,
                        createdWith: "PASTE",
                        isLatest: true,
                        contentFormat: "HTML"
                    }
                });

                // 2. Set document as its own root
                logger.debug(`Setting document root reference`, { requestId, documentId: document.id });
                await tx.document.update({
                    where: { id: document.id },
                    data: { rootDocumentId: document.id }
                });

                // 3. Create document version
                logger.debug(`Creating document version record`, { requestId, documentId: document.id });
                await tx.documentVersion.create({
                    data: {
                        rootDocumentId: document.id,
                        versionedDocId: document.id,
                        versionNumber: 1,
                    }
                });

                // 4. Create AI analysis
                logger.debug(`Creating AI analysis record`, { requestId, documentId: document.id });
                const analysis = await tx.aIAnalysis.create({
                    data: {
                        documentId: document.id,
                        overallAiScore: parsedResponse.overallAiScore ?? 0,
                        humanWrittenPercent: parsedResponse.humanWrittenPercent ?? 0,
                        aiGeneratedPercent: parsedResponse.aiGeneratedPercent ?? 0,
                        analysisDate: new Date()
                    }
                });

                // 5. Create text metrics
                logger.debug(`Creating text metrics`, { requestId, documentId: document.id });
                await tx.textMetrics.create({
                    data: {
                        aiAnalysisId: analysis.id,
                        totalWordCount: parsedResponse.textMetrics.totalWordCount,
                        sentenceCount: parsedResponse.textMetrics.sentenceCount,
                        averageSentenceLength: parsedResponse.textMetrics.averageSentenceLength,
                        readabilityScore: parsedResponse.textMetrics.readabilityScore,
                        lexicalDiversity: parsedResponse.textMetrics.lexicalDiversity,
                        uniqueWordCount: parsedResponse.textMetrics.uniqueWordCount,
                        academicLanguageScore: parsedResponse.textMetrics.academicLanguageScore,
                        passiveVoicePercentage: parsedResponse.textMetrics.passiveVoicePercentage,
                        firstPersonPercentage: parsedResponse.textMetrics.firstPersonPercentage,
                        thirdPersonPercentage: parsedResponse.textMetrics.thirdPersonPercentage,
                        punctuationDensity: parsedResponse.textMetrics.punctuationDensity,
                        grammarErrorCount: parsedResponse.textMetrics.grammarErrorCount,
                        spellingErrorCount: parsedResponse.textMetrics.spellingErrorCount,
                        predictabilityScore: parsedResponse.textMetrics.predictabilityScore,
                        nGramUniqueness: parsedResponse.textMetrics.nGramUniqueness
                    }
                });

                // 6. Create document sections
                if (parsedResponse.sections.length > 0) {
                    logger.debug(`Creating ${parsedResponse.sections.length} document sections`, { requestId });
                    await Promise.all(parsedResponse.sections.map(section =>
                        tx.documentSection.create({
                            data: {
                                aiAnalysisId: analysis.id,
                                startOffset: section.startOffset,
                                endOffset: section.endOffset,
                                content: section.content,
                                isAiGenerated: section.isAiGenerated,
                                aiConfidence: section.aiConfidence,
                                suggestions: section.suggestions
                            }
                        })
                    ));
                }

                // 7. Create word suggestions
                if (parsedResponse.wordSuggestions.length > 0) {
                    logger.debug(`Creating ${parsedResponse.wordSuggestions.length} word suggestions`, { requestId });
                    await Promise.all(parsedResponse.wordSuggestions.map(suggestion =>
                        tx.wordSuggestion.create({
                            data: {
                                originalWord: suggestion.originalWord,
                                suggestedWord: suggestion.suggestedWord,
                                position: suggestion.position,
                                startOffset: suggestion.startOffset,
                                endOffset: suggestion.endOffset,
                                context: suggestion.context,
                                aiConfidence: suggestion.aiConfidence,
                                documentId: document.id,
                                userId: req.user.id,
                                highlighted: true,
                            }
                        })
                    ));
                }

                // 8. Create feedback
                logger.debug(`Creating feedback record`, { requestId });
                const feedback = await tx.feedback.create({
                    data: {
                        content: "",
                        status: 'PENDING',
                        userId: req.user.id,
                        documentId: document.id,
                        // groupId: data.groupId
                    }
                });

                // 9. Create feedback metrics
                logger.debug(`Creating feedback metrics`, { requestId });
                await tx.feedbackMetrics.create({
                    data: {
                        feedbackId: feedback.id,
                        // Structure metrics
                        sentenceLengthChange: parsedResponse.feedbackMetrics.structuralComparison.sentenceLengthChange,
                        paragraphStructureScore: parsedResponse.feedbackMetrics.structuralComparison.paragraphStructureScore,
                        headingConsistencyScore: parsedResponse.feedbackMetrics.structuralComparison.headingConsistencyScore,

                        // Vocabulary metrics
                        lexicalDiversityChange: parsedResponse.feedbackMetrics.vocabularyMetrics.lexicalDiversityChange,
                        wordRepetitionScore: parsedResponse.feedbackMetrics.vocabularyMetrics.wordRepetitionScore,
                        formalityShift: parsedResponse.feedbackMetrics.vocabularyMetrics.formalityShift,

                        // Style metrics
                        readabilityChange: parsedResponse.feedbackMetrics.styleMetrics.readabilityChange,
                        voiceConsistencyScore: parsedResponse.feedbackMetrics.styleMetrics.voiceConsistencyScore,
                        perspectiveShift: parsedResponse.feedbackMetrics.styleMetrics.perspectiveShift,
                        descriptiveLanguageScore: parsedResponse.feedbackMetrics.styleMetrics.descriptiveLanguageScore,

                        // Grammar metrics
                        punctuationChangeScore: parsedResponse.feedbackMetrics.grammarAndMechanics.punctuationChangeScore,
                        grammarPatternScore: parsedResponse.feedbackMetrics.grammarAndMechanics.grammarPatternScore,
                        spellingVariationScore: parsedResponse.feedbackMetrics.grammarAndMechanics.spellingVariationScore,

                        // Thematic metrics
                        thematicConsistencyScore: parsedResponse.feedbackMetrics.topicThematicElements.thematicConsistencyScore,
                        keywordFrequencyChange: parsedResponse.feedbackMetrics.topicThematicElements.keywordFrequencyChange,
                        argumentDevelopmentScore: parsedResponse.feedbackMetrics.topicThematicElements.argumentDevelopmentScore,

                        // Similarity metrics
                        nGramSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.nGramSimilarityScore,
                        tfIdfSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.tfIdfSimilarityScore,
                        jaccardSimilarityScore: parsedResponse.feedbackMetrics.similarityMetrics.jaccardSimilarityScore,

                        // AI detection
                        originalityShiftScore: parsedResponse.feedbackMetrics.aIDetection.originalityShiftScore
                    }
                });

                // 10. Update feedback status
                logger.debug(`Updating feedback status`, { requestId });
                await tx.feedback.update({
                    where: { id: feedback.id },
                    data: { status: "ANALYZED" }
                });

                // 11. Update document with feedback metrics reference
                logger.debug(`Updating document with feedback metrics reference`, { requestId });
                await tx.document.update({
                    where: { id: document.id },
                    data: { feedbackMetricsId: feedback.id }
                });

                // Return the document and analysis for response
                return {
                    document,
                    analysis
                };
            }, {
                maxWait: 20000, // 20s max wait time
                timeout: 120000 // 120s timeout
            });

            logger.logTimed('info', `Database transaction completed`, dbTimer(), {
                requestId,
                documentId: result.document.id,
                analysisId: result.analysis.id
            });

            // Step 6: Return success response
            logger.logTimed('info', `Document processing completed successfully`, processingTimer(), {
                requestId,
                documentId: result.document.id
            });

            const response: ApiResponse = {
                success: true,
                message: `Document created from ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} with HTML formatting`,
                document: {
                    id: result.document.id,
                    title: result.document.title,
                    fileName: result.document.fileName,
                    fileUrl: result.document.fileUrl,
                    createdAt: result.document.createdAt,
                    contentFormat: 'html'
                }
            };

            res.status(201).json(response);

        } catch (dbError) {
            logger.error('Database transaction failed', dbError as Error, { requestId });

            res.status(500).json({
                success: false,
                message: 'Failed to save document analysis',
                error: dbError instanceof Error ? dbError.message : 'Unknown error'
            });
        }

    } catch (error) {
        const totalTime = processingTimer();
        logger.error('Unhandled error in document processing', error as Error, {
            requestId,
            totalProcessingTimeMs: totalTime
        });

        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};


export const convertDocumentToHtml = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check if file was uploaded
        if (!req.file) {
            const response: ApiResponse = {
                success: false,
                message: 'No file uploaded'
            };
            res.status(400).json(response);
            return;
        }

        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;

        // Check if supported file type
        if (mimeType !== 'application/pdf' &&
            mimeType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const response: ApiResponse = {
                success: false,
                message: 'Unsupported file type. Only PDF and DOCX are supported.'
            };
            res.status(422).json(response);
            return;
        }

        // Validate the document based on type
        let isValid = false;
        if (mimeType === 'application/pdf') {
            isValid = await pdfService.validatePdf(fileBuffer);
        } else {
            isValid = await pdfService.validateDocx(fileBuffer);
        }

        if (!isValid) {
            const response: ApiResponse = {
                success: false,
                message: `Invalid ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} file`
            };
            res.status(422).json(response);
            return;
        }

        try {
            // Extract HTML content using the appropriate method based on file type
            const htmlContent = await pdfService.extractHtmlFromDocument(fileBuffer, mimeType);

            // Get metadata if PDF
            let pageCount = 0;
            if (mimeType === 'application/pdf') {
                const metadata = await pdfService.getPdfMetadata(fileBuffer);
                pageCount = metadata.pageCount;
            }

            const response: ApiResponse = {
                success: true,
                message: `${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} converted to HTML successfully`,
                data: {
                    html: htmlContent,
                    pageCount,
                    fileName: req.file.originalname,
                    fileSize: req.file.size,
                    fileType: mimeType
                }
            };

            res.status(200).json(response);
        } catch (conversionError) {
            console.error('Document conversion error:', conversionError);
            const response: ApiResponse = {
                success: false,
                message: `Error converting ${mimeType === 'application/pdf' ? 'PDF' : 'DOCX'} to HTML`,
                error: conversionError instanceof Error ? conversionError.message : 'Unknown error'
            };
            res.status(422).json(response);
            return;
        }
    } catch (error) {
        console.error('Error in document to HTML conversion:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to convert document to HTML',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};



export const listDocuments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, groupId, search } = req.query;

        // Get documents from service
        const { documents, pagination } = await documentService.listDocuments({
            userId: req.user.id,
            page: Number(page),
            limit: Number(limit),
            groupId: groupId as string || undefined,
            search: search as string || undefined
        });

        const response: ApiResponse = {
            success: true,
            documents,
            pagination
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error listing documents:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to list documents',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const getDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log(`id ${id} in getDocument`)

        // Get document from service
        const document = await documentService.getDocumentById(id);
        console.log(`document`)
        console.log(document)

        if (!document) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        console.log(`user id ${req.user.id} in getDocument`)
        console.log(`document user id ${document.userId} in getDocument`)
        console.log(`document group id ${document.groupId} in getDocument`)

        // Check if user has access to this document
        if (document.userId !== req.user.id && document.groupId === null) {
            console.log(`⭕ Document has no group and doesn't belong to user`)
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

        const response: ApiResponse = {
            success: true,
            document
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error getting document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to get document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const updateDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);

        if (!existingDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to update the document
        if (existingDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to update this document'
            };
            res.status(403).json(response);
            return;
        }

        // Update document
        const updatedDocument = await documentService.updateDocument(id, {
            title,
            content
        });

        const response: ApiResponse = {
            success: true,
            message: 'Document updated successfully',
            document: {
                id: updatedDocument.id,
                title: updatedDocument.title,
                updatedAt: updatedDocument.updatedAt
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error updating document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to update document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get existing document
        const existingDocument = await documentService.getDocumentById(id);

        if (!existingDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to delete the document
        if (existingDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to delete this document'
            };
            res.status(403).json(response);
            return;
        }

        // Delete document
        await documentService.deleteDocument(id);

        const response: ApiResponse = {
            success: true,
            message: 'Document deleted successfully'
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error deleting document:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to delete document',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const createVersion = async (req: Request, res: Response): Promise<void> => {
    try {

        const { id: parentDocumentId } = req.params;
        const { title, content } = req.body;

        // Get parent document
        const parentDocument = await documentService.getDocumentById(parentDocumentId);

        if (!parentDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Parent document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user is authorized to create a version
        if (parentDocument.userId !== req.user.id) {
            const response: ApiResponse = {
                success: false,
                message: 'You are not authorized to create a version of this document'
            };
            res.status(403).json(response);
            return;
        }

        // Extract text from the PDF
        // const pdfBuffer = req.file.buffer;
        // let content: string;

        // try {
        //     content = await pdfService.extractTextFromPdf(pdfBuffer);
        // } catch (pdfError) {
        //     console.error('PDF processing error:', pdfError);
        //     const response: ApiResponse = {
        //         success: false,
        //         message: 'Error processing PDF',
        //         error: pdfError instanceof Error ? pdfError.message : 'Unknown error'
        //     };
        //     res.status(422).json(response);
        //     return;
        // }

        // Create a new version
        const newVersion = await documentService.createDocumentVersion({
            parentDocumentId,
            title: title || parentDocument.title,
            content,
            // @ts-ignore
            fileName: parentDocument.fileName,
            fileUrl: '', // Not storing the file, just the content
            // @ts-ignore
            fileType: parentDocument.fileType,
            fileSize: parentDocument.fileSize,
            userId: req.user.id,
            groupId: parentDocument.groupId,
            contentFormat: parentDocument.contentFormat
        });

        const response: ApiResponse = {
            success: true,
            message: 'New version created successfully',
            document: {
                id: newVersion.id,
                title: newVersion.title,
                versionNumber: newVersion.versionNumber,
                isLatest: newVersion.isLatest,
                createdAt: newVersion.createdAt
            }
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating document version:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to create document version',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};


export const listVersions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Get the original document (first version)
        const originalDocument = await documentService.getDocumentById(id);

        if (!originalDocument) {
            const response: ApiResponse = {
                success: false,
                message: 'Document not found'
            };
            res.status(404).json(response);
            return;
        }

        // Check if user has access to this document
        if (originalDocument.userId !== req.user.id && originalDocument.groupId === null) {
            // If document has no group and doesn't belong to user, deny access
            const response: ApiResponse = {
                success: false,
                message: 'You do not have access to this document'
            };
            res.status(403).json(response);
            return;
        }

        if (originalDocument.groupId !== null) {
            // Check if user is a member of the group
            const isMember = await documentService.isUserInGroup(req.user.id, originalDocument.groupId);
            if (!isMember) {
                const response: ApiResponse = {
                    success: false,
                    message: 'You do not have access to this document'
                };
                res.status(403).json(response);
                return;
            }
        }

        // Get document versions
        const versions = await documentService.getDocumentVersions(id);

        const response: ApiResponse = {
            success: true,
            versions
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error listing document versions:', error);

        const response: ApiResponse = {
            success: false,
            message: 'Failed to list document versions',
            error: error instanceof Error ? error.message : 'Unknown error'
        };

        res.status(500).json(response);
    }
};