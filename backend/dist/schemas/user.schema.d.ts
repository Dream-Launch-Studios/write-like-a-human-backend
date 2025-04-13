import { z } from 'zod';
export declare const listUsersSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
        limit: z.ZodEffects<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, number, string | undefined>;
        role: z.ZodOptional<z.ZodEnum<["STUDENT", "TEACHER", "ADMIN"]>>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
    }, {
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        page: number;
        limit: number;
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
    };
}, {
    query: {
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
        page?: string | undefined;
        limit?: string | undefined;
    };
}>;
export declare const getUserByIdSchema: z.ZodObject<{
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
export declare const updateUserRoleSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        role: z.ZodEnum<["STUDENT", "TEACHER", "ADMIN"]>;
    }, "strip", z.ZodTypeAny, {
        role: "STUDENT" | "TEACHER" | "ADMIN";
    }, {
        role: "STUDENT" | "TEACHER" | "ADMIN";
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        role: "STUDENT" | "TEACHER" | "ADMIN";
    };
    params: {
        id: string;
    };
}, {
    body: {
        role: "STUDENT" | "TEACHER" | "ADMIN";
    };
    params: {
        id: string;
    };
}>;
export declare const userSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    name: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    role: z.ZodEnum<["STUDENT", "TEACHER", "ADMIN"]>;
    isEmailVerified: z.ZodBoolean;
    createdAt: z.ZodDate;
    updatedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    name?: string | null | undefined;
}, {
    id: string;
    email: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    name?: string | null | undefined;
}>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        role: z.ZodDefault<z.ZodOptional<z.ZodEnum<["STUDENT", "TEACHER", "ADMIN"]>>>;
        isEmailVerified: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        role: "STUDENT" | "TEACHER" | "ADMIN";
        isEmailVerified: boolean;
        name?: string | undefined;
    }, {
        email: string;
        name?: string | undefined;
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
        isEmailVerified?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        role: "STUDENT" | "TEACHER" | "ADMIN";
        isEmailVerified: boolean;
        name?: string | undefined;
    };
}, {
    body: {
        email: string;
        name?: string | undefined;
        role?: "STUDENT" | "TEACHER" | "ADMIN" | undefined;
        isEmailVerified?: boolean | undefined;
    };
}>;
export declare const updateUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        isEmailVerified: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        isEmailVerified?: boolean | undefined;
    }, {
        name?: string | undefined;
        isEmailVerified?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        isEmailVerified?: boolean | undefined;
    };
    params: {
        id: string;
    };
}, {
    body: {
        name?: string | undefined;
        isEmailVerified?: boolean | undefined;
    };
    params: {
        id: string;
    };
}>;
