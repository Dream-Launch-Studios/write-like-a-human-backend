export interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    errors?: any;
    [key: string]: any;
}
export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}
