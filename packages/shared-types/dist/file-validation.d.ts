/**
 * Shared file validation utilities for both web and mobile platforms
 */
export declare const MAX_FILE_SIZE: number;
export declare const ALLOWED_FILE_TYPES: readonly ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/mov", "video/avi", "video/quicktime", "application/pdf"];
export type AllowedFileType = (typeof ALLOWED_FILE_TYPES)[number];
export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}
export interface FileMetadata {
    fileName: string;
    fileType: string;
    fileSize: number;
}
/**
 * Validate file size against the maximum allowed size
 */
export declare function validateFileSize(fileSizeBytes: number): FileValidationResult;
/**
 * Validate file type against the allowed types list
 */
export declare function validateFileType(fileType: string): FileValidationResult;
/**
 * Comprehensive file validation (size + type)
 */
export declare function validateFile(file: FileMetadata): FileValidationResult;
/**
 * Format file size in human readable format
 */
export declare function formatFileSize(bytes: number): string;
/**
 * Get file extension from filename
 */
export declare function getFileExtension(filename: string): string;
/**
 * Check if file extension matches MIME type expectations
 */
export declare function validateFileExtensionMatch(filename: string, mimeType: string): FileValidationResult;
/**
 * Validate multiple files
 */
export declare function validateFiles(files: FileMetadata[]): FileValidationResult;
//# sourceMappingURL=file-validation.d.ts.map