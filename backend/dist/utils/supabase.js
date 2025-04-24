"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToSupabase = exports.supabaseAdmin = exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const uuidv4_1 = require("uuidv4");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_KEY;
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const uploadFileToSupabase = async (fileBuffer, originalFilename, mimeType, userId, bucketName = 'documents') => {
    var _a;
    try {
        // Get file extension and generate unique filename
        const fileExtension = (_a = originalFilename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        const fileName = `${(0, uuidv4_1.uuid)()}${fileExtension}`;
        // Create path with user ID for better organization
        const filePath = `/${userId}/${fileName}`;
        // Upload file to Supabase Storage
        const { data, error } = await exports.supabase
            .storage
            .from(bucketName)
            .upload(filePath, fileBuffer, {
            contentType: mimeType,
            upsert: false
        });
        if (error) {
            console.error('Supabase Storage upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
        // Generate public URL for the file
        const { data: publicUrlData } = exports.supabase
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);
        console.log(`file uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
        return {
            success: true,
            fileUrl: publicUrlData.publicUrl,
            filePath
        };
    }
    catch (error) {
        console.error('File upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error'
        };
    }
};
exports.uploadFileToSupabase = uploadFileToSupabase;
