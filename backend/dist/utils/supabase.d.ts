export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const supabaseAdmin: import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
export declare const uploadFileToSupabase: (fileBuffer: Buffer, originalFilename: string, mimeType: string, userId: string, bucketName?: string) => Promise<{
    success: boolean;
    fileUrl?: string;
    filePath?: string;
    error?: string;
}>;
