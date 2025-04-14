import { z } from 'zod';
export declare const analyzeDocumentSchema: z.ZodObject<{
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
export declare const getAnalysisSchema: z.ZodObject<{
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
export declare const getSectionsSchema: z.ZodObject<{
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
export declare const getMetricsSchema: z.ZodObject<{
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
export declare const updateAnalysisStatusSchema: z.ZodObject<{
    body: z.ZodObject<{
        status: z.ZodEnum<["PENDING", "COMPLETED", "FAILED"]>;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "FAILED" | "PENDING" | "COMPLETED";
        message?: string | undefined;
    }, {
        status: "FAILED" | "PENDING" | "COMPLETED";
        message?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        status: "FAILED" | "PENDING" | "COMPLETED";
        message?: string | undefined;
    };
}, {
    body: {
        status: "FAILED" | "PENDING" | "COMPLETED";
        message?: string | undefined;
    };
}>;
export declare const submitAnalysisFeedbackSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        isAccurate: z.ZodBoolean;
        comments: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isAccurate: boolean;
        comments?: string | undefined;
    }, {
        isAccurate: boolean;
        comments?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        isAccurate: boolean;
        comments?: string | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        isAccurate: boolean;
        comments?: string | undefined;
    };
}>;
export declare const reanalyzeDocumentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        force: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        force: boolean;
    }, {
        force?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        force: boolean;
    };
}, {
    params: {
        id: string;
    };
    body: {
        force?: boolean | undefined;
    };
}>;
