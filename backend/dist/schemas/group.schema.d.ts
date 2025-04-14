import { z } from 'zod';
/**
 * Schema for creating a group
 */
export declare const createGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        description?: string | undefined;
    };
}, {
    body: {
        name: string;
        description?: string | undefined;
    };
}>;
/**
 * Schema for updating a group
 */
export declare const updateGroupSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | null | undefined;
    }, {
        name?: string | undefined;
        description?: string | null | undefined;
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
        name?: string | undefined;
        description?: string | null | undefined;
    };
}, {
    params: {
        id: string;
    };
    body: {
        name?: string | undefined;
        description?: string | null | undefined;
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
 * Schema for joining a group with token
 */
export declare const joinGroupSchema: z.ZodObject<{
    params: z.ZodObject<{
        token: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        token: string;
    }, {
        token: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        token: string;
    };
}, {
    params: {
        token: string;
    };
}>;
/**
 * Schema for adding a member to a group
 */
export declare const addGroupMemberSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
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
        email: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        email: string;
    };
}>;
/**
 * Schema for removing a member from a group
 */
export declare const removeGroupMemberSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
    }, {
        id: string;
        userId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
        userId: string;
    };
}, {
    params: {
        id: string;
        userId: string;
    };
}>;
