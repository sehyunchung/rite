/**
 * Shared file validation utilities for both web and mobile platforms
 */

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'video/mp4',
	'video/mov',
	'video/avi',
	'video/quicktime',
	'application/pdf',
] as const;

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
export function validateFileSize(fileSizeBytes: number): FileValidationResult {
	if (fileSizeBytes < 0) {
		return {
			isValid: false,
			error: 'File size must be a positive number',
		};
	}

	if (fileSizeBytes > MAX_FILE_SIZE) {
		const sizeMB = Math.round(fileSizeBytes / (1024 * 1024));
		const maxSizeMB = Math.round(MAX_FILE_SIZE / (1024 * 1024));
		return {
			isValid: false,
			error: `File size ${sizeMB}MB exceeds maximum allowed size of ${maxSizeMB}MB`,
		};
	}

	return { isValid: true };
}

/**
 * Validate file type against the allowed types list
 */
export function validateFileType(fileType: string): FileValidationResult {
	if (!fileType || typeof fileType !== 'string') {
		return {
			isValid: false,
			error: 'File type is required and must be a string',
		};
	}

	// Convert to lowercase for comparison (validation will reject if original wasn't lowercase)
	const normalizedType = fileType.toLowerCase().trim();

	if (!normalizedType.includes('/')) {
		return {
			isValid: false,
			error: 'Invalid MIME type format',
		};
	}

	if (!ALLOWED_FILE_TYPES.includes(normalizedType as AllowedFileType)) {
		return {
			isValid: false,
			error: `File type ${fileType} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
		};
	}

	return { isValid: true };
}

/**
 * Comprehensive file validation (size + type)
 */
export function validateFile(file: FileMetadata): FileValidationResult {
	// Validate file size
	const sizeValidation = validateFileSize(file.fileSize);
	if (!sizeValidation.isValid) {
		return sizeValidation;
	}

	// Validate file type
	const typeValidation = validateFileType(file.fileType);
	if (!typeValidation.isValid) {
		return typeValidation;
	}

	return { isValid: true };
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
	return `${Math.round(bytes / (1024 * 1024))} MB`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	const lastDot = filename.lastIndexOf('.');
	if (lastDot === -1) return '';
	return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Check if file extension matches MIME type expectations
 */
export function validateFileExtensionMatch(
	filename: string,
	mimeType: string
): FileValidationResult {
	const extension = getFileExtension(filename);
	const normalizedMimeType = mimeType.toLowerCase().trim();

	// Define expected extensions for each MIME type
	const mimeToExtensions: Record<string, string[]> = {
		'image/jpeg': ['jpg', 'jpeg'],
		'image/png': ['png'],
		'image/gif': ['gif'],
		'image/webp': ['webp'],
		'video/mp4': ['mp4'],
		'video/mov': ['mov'],
		'video/avi': ['avi'],
		'video/quicktime': ['mov', 'qt'],
		'application/pdf': ['pdf'],
	};

	const expectedExtensions = mimeToExtensions[normalizedMimeType];
	if (!expectedExtensions) {
		return {
			isValid: false,
			error: `Unknown MIME type: ${mimeType}`,
		};
	}

	if (!expectedExtensions.includes(extension)) {
		return {
			isValid: false,
			error: `File extension '${extension}' does not match MIME type '${mimeType}'. Expected: ${expectedExtensions.join(', ')}`,
		};
	}

	return { isValid: true };
}

/**
 * Validate multiple files
 */
export function validateFiles(files: FileMetadata[]): FileValidationResult {
	for (const file of files) {
		const validation = validateFile(file);
		if (!validation.isValid) {
			return {
				isValid: false,
				error: `File "${file.fileName}": ${validation.error}`,
			};
		}

		// Also validate filename/MIME type consistency
		const extensionValidation = validateFileExtensionMatch(file.fileName, file.fileType);
		if (!extensionValidation.isValid) {
			return {
				isValid: false,
				error: `File "${file.fileName}": ${extensionValidation.error}`,
			};
		}
	}

	return { isValid: true };
}
