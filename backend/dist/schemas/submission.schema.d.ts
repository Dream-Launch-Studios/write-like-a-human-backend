import { z } from 'zod';
/**
 * Schema for submission params
 */
export declare const userSubmissionByAssignmentIdParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const submissionParamsSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
/**
 * Schema for updating submission status
 */
export declare const updateSubmissionStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["DRAFT", "SUBMITTED", "GRADED", "RETURNED"]>;
    }, "strip", z.ZodTypeAny, {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    }, {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    };
}>;
/**
 * Schema for resubmitting an assignment
 */
export declare const resubmitAssignmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        title: string;
    }, {
        title: string;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        title: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        title: string;
    };
}>;
export declare const finalSubmitAssignmentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        documentId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        documentId: string;
    }, {
        documentId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        documentId: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        documentId: string;
    };
}>;
export declare const evaluateSubmissionSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        feedback: z.ZodOptional<z.ZodString>;
        grade: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        feedback?: string | undefined;
        grade?: string | undefined;
    }, {
        feedback?: string | undefined;
        grade?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        feedback?: string | undefined;
        grade?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        feedback?: string | undefined;
        grade?: string | undefined;
    };
}>;
/**
 * Schema for adding submission feedback
 */
export declare const addSubmissionFeedbackSchema: z.ZodObject<{
    body: z.ZodObject<{
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
    }, {
        content: string;
    }>;
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        content: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        content: string;
    };
}>;
