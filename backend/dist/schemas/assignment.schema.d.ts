import { z } from 'zod';
/**
 * Schema for creating an assignment
 */
export declare const createAssignmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        dueDate: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, Date | null, string | null | undefined>;
        createdWith: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PASTE", "UPLOAD"]>>>;
        contentFormat: z.ZodDefault<z.ZodEnum<["HTML", "TEXT"]>>;
        pastedContent: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        contentFormat: "HTML" | "TEXT";
        description: string;
        dueDate: Date | null;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        pastedContent?: string | null | undefined;
    }, {
        title: string;
        description: string;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        dueDate?: string | null | undefined;
        pastedContent?: string | null | undefined;
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
        contentFormat: "HTML" | "TEXT";
        description: string;
        dueDate: Date | null;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        pastedContent?: string | null | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        title: string;
        description: string;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        dueDate?: string | null | undefined;
        pastedContent?: string | null | undefined;
    };
    params: {
        id: string;
    };
}>;
/**
 * Schema for updating an assignment
*/
export declare const updateAssignmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        dueDate: z.ZodEffects<z.ZodNullable<z.ZodOptional<z.ZodString>>, Date | null, string | null | undefined>;
        documentUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        documentName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        documentType: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        dueDate: Date | null;
        title?: string | undefined;
        description?: string | undefined;
        documentUrl?: string | null | undefined;
        documentName?: string | null | undefined;
        documentType?: string | null | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        dueDate?: string | null | undefined;
        documentUrl?: string | null | undefined;
        documentName?: string | null | undefined;
        documentType?: string | null | undefined;
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
        dueDate: Date | null;
        title?: string | undefined;
        description?: string | undefined;
        documentUrl?: string | null | undefined;
        documentName?: string | null | undefined;
        documentType?: string | null | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        title?: string | undefined;
        description?: string | undefined;
        dueDate?: string | null | undefined;
        documentUrl?: string | null | undefined;
        documentName?: string | null | undefined;
        documentType?: string | null | undefined;
    };
    params: {
        id: string;
    };
}>;
/**
 * Schema for group params
 */
export declare const groupParamsSchema: z.ZodObject<{
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
 * Schema for assignment params
 */
export declare const assignmentParamsSchema: z.ZodObject<{
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
 * Schema for submitting an assignment
 */
export declare const submitAssignmentSchema: z.ZodObject<{
    body: z.ZodObject<{
        groupId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        groupId: string;
    }, {
        groupId: string;
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
        groupId: string;
    };
    params: {
        id: string;
    };
}, {
    body: {
        groupId: string;
    };
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
