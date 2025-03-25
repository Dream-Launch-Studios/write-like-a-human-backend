import { z } from 'zod';
/**
 * Schema for submission params
 */
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
    body: {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    };
    params: {
        id: string;
    };
}, {
    body: {
        status: "DRAFT" | "SUBMITTED" | "GRADED" | "RETURNED";
    };
    params: {
        id: string;
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
    body: {
        title: string;
    };
    params: {
        id: string;
    };
}, {
    body: {
        title: string;
    };
    params: {
        id: string;
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
    body: {
        content: string;
    };
    params: {
        id: string;
    };
}, {
    body: {
        content: string;
    };
    params: {
        id: string;
    };
}>;
