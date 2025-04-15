export interface ApiResponse {
    success: boolean;
    message?: string;
    error?: string;
    errors?: any;
    [key: string]: any; // Additional properties like users, user, pagination, etc.
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    pages: number;
}