import { createClient } from "@supabase/supabase-js";
import { uuid } from 'uuidv4';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFileToSupabase = async (
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    userId: string,
    bucketName: string = 'documents'
): Promise<{
    success: boolean;
    fileUrl?: string;
    filePath?: string;
    error?: string;
}> => {
    try {
        // Get file extension and generate unique filename
        const fileExtension = originalFilename.split('.').pop()?.toLowerCase();
        const fileName = `${uuid()}${fileExtension}`;

        // Create path with user ID for better organization
        const filePath = `documents/${userId}/${fileName}`;

        // Upload file to Supabase Storage
        const { data, error } = await supabase
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
        const { data: publicUrlData } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(filePath);


        console.log(`file uploaded to Supabase Storage: ${publicUrlData.publicUrl}`);
        return {
            success: true,
            fileUrl: publicUrlData.publicUrl,
            filePath
        };
    } catch (error) {
        console.error('File upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error'
        };
    }
};
