import { z } from 'zod';
export declare const createDocumentSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        pastedContent: z.ZodOptional<z.ZodString>;
        groupId: z.ZodOptional<z.ZodString>;
        submissionId: z.ZodOptional<z.ZodString>;
        createdWith: z.ZodOptional<z.ZodDefault<z.ZodEnum<["PASTE", "UPLOAD"]>>>;
        contentFormat: z.ZodOptional<z.ZodDefault<z.ZodEnum<["HTML", "TEXT"]>>>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        groupId?: string | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        submissionId?: string | undefined;
        pastedContent?: string | undefined;
    }, {
        title?: string | undefined;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        groupId?: string | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        submissionId?: string | undefined;
        pastedContent?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        groupId?: string | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        submissionId?: string | undefined;
        pastedContent?: string | undefined;
    };
}, {
    body: {
        title?: string | undefined;
        createdWith?: "PASTE" | "UPLOAD" | undefined;
        groupId?: string | undefined;
        contentFormat?: "HTML" | "TEXT" | undefined;
        submissionId?: string | undefined;
        pastedContent?: string | undefined;
    };
}>;
export declare const listDocumentsSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
        groupId: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        search?: string | undefined;
        groupId?: string | undefined;
    }, {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        groupId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        search?: string | undefined;
        groupId?: string | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        page?: string | undefined;
        limit?: string | undefined;
        groupId?: string | undefined;
    };
}>;
export declare const getDocumentSchema: z.ZodObject<{
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
export declare const updateDocumentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        content?: string | undefined;
    }, {
        title?: string | undefined;
        content?: string | undefined;
    }>, {
        title?: string | undefined;
        content?: string | undefined;
    }, {
        title?: string | undefined;
        content?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        content?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        title?: string | undefined;
        content?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const deleteDocumentSchema: z.ZodObject<{
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
export declare const createVersionSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        submissionId: z.ZodOptional<z.ZodString>;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        content: string;
        title?: string | undefined;
        submissionId?: string | undefined;
    }, {
        content: string;
        title?: string | undefined;
        submissionId?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        content: string;
        title?: string | undefined;
        submissionId?: string | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        content: string;
        title?: string | undefined;
        submissionId?: string | undefined;
    };
    params: {
        id: string;
    };
}>;
export declare const listVersionsSchema: z.ZodObject<{
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
