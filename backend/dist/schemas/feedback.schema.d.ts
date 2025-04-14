import { z } from 'zod';
export declare const createFeedbackSchema: z.ZodObject<{
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
export declare const getDocumentFeedbackSchema: z.ZodObject<{
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
export declare const getFeedbackSchema: z.ZodObject<{
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
export declare const updateFeedbackSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodEffects<z.ZodObject<{
        content: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<["PENDING", "ANALYZED", "REVIEWED"]>>;
        response: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    }, {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    }>, {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    }, {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        status?: "PENDING" | "ANALYZED" | "REVIEWED" | undefined;
        content?: string | undefined;
        response?: string | undefined;
    };
}>;
export declare const deleteFeedbackSchema: z.ZodObject<{
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
export declare const getFeedbackMetricsSchema: z.ZodObject<{
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
export declare const generateFeedbackMetricsSchema: z.ZodObject<{
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
