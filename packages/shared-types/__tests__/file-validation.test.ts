import { describe, it, expect } from 'vitest';
import {
	validateFile,
	validateFileSize,
	validateFileType,
	validateFiles,
	validateFileExtensionMatch,
	formatFileSize,
	getFileExtension,
	MAX_FILE_SIZE,
	ALLOWED_FILE_TYPES,
} from '../src/file-validation';

describe('File Validation Utilities', () => {
	describe('validateFileSize', () => {
		it('should accept files under the size limit', () => {
			const result = validateFileSize(1024 * 1024); // 1MB
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should accept files at the exact size limit', () => {
			const result = validateFileSize(MAX_FILE_SIZE);
			expect(result.isValid).toBe(true);
			expect(result.error).toBeUndefined();
		});

		it('should reject files over the size limit', () => {
			const oversizeFile = MAX_FILE_SIZE + 1;
			const result = validateFileSize(oversizeFile);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('exceeds maximum allowed size');
		});

		it('should reject negative file sizes', () => {
			const result = validateFileSize(-1);
			expect(result.isValid).toBe(false);
			expect(result.error).toBe('File size must be a positive number');
		});

		it('should accept zero byte files', () => {
			const result = validateFileSize(0);
			expect(result.isValid).toBe(true);
		});
	});

	describe('validateFileType', () => {
		it('should accept all allowed file types', () => {
			ALLOWED_FILE_TYPES.forEach((fileType) => {
				const result = validateFileType(fileType);
				expect(result.isValid).toBe(true);
				expect(result.error).toBeUndefined();
			});
		});

		it('should reject disallowed file types', () => {
			const disallowedTypes = [
				'application/exe',
				'text/javascript',
				'application/zip',
				'text/html',
			];

			disallowedTypes.forEach((fileType) => {
				const result = validateFileType(fileType);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain('is not allowed');
			});
		});

		it('should reject malformed MIME types', () => {
			const malformedTypes = ['', 'invalidtype', 'image/', '/jpeg', 'image//jpeg'];

			malformedTypes.forEach((fileType) => {
				const result = validateFileType(fileType);
				expect(result.isValid).toBe(false);
				expect(result.error).toBeDefined();
			});
		});

		it('should normalize file types (lowercase, trim)', () => {
			const result = validateFileType(' IMAGE/JPEG ');
			expect(result.isValid).toBe(false); // Should fail because it's uppercase
		});

		it('should handle null/undefined file types', () => {
			const nullResult = validateFileType(null as any);
			expect(nullResult.isValid).toBe(false);

			const undefinedResult = validateFileType(undefined as any);
			expect(undefinedResult.isValid).toBe(false);
		});
	});

	describe('validateFile', () => {
		it('should validate a valid file', () => {
			const validFile = {
				fileName: 'test.jpg',
				fileType: 'image/jpeg',
				fileSize: 1024 * 1024, // 1MB
			};

			const result = validateFile(validFile);
			expect(result.isValid).toBe(true);
		});

		it('should reject files with invalid size', () => {
			const oversizedFile = {
				fileName: 'large.jpg',
				fileType: 'image/jpeg',
				fileSize: MAX_FILE_SIZE + 1,
			};

			const result = validateFile(oversizedFile);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('exceeds maximum allowed size');
		});

		it('should reject files with invalid type', () => {
			const invalidTypeFile = {
				fileName: 'malware.exe',
				fileType: 'application/exe',
				fileSize: 1024,
			};

			const result = validateFile(invalidTypeFile);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('is not allowed');
		});
	});

	describe('validateFiles', () => {
		it('should validate multiple valid files', () => {
			const files = [
				{
					fileName: 'photo.jpg',
					fileType: 'image/jpeg',
					fileSize: 1024 * 1024,
				},
				{
					fileName: 'video.mp4',
					fileType: 'video/mp4',
					fileSize: 5 * 1024 * 1024,
				},
			];

			const result = validateFiles(files);
			expect(result.isValid).toBe(true);
		});

		it('should reject if any file is invalid', () => {
			const files = [
				{
					fileName: 'photo.jpg',
					fileType: 'image/jpeg',
					fileSize: 1024 * 1024,
				},
				{
					fileName: 'large.jpg',
					fileType: 'image/jpeg',
					fileSize: MAX_FILE_SIZE + 1,
				},
			];

			const result = validateFiles(files);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('large.jpg');
		});

		it('should validate filename and MIME type consistency', () => {
			const files = [
				{
					fileName: 'video.jpg', // Wrong extension for MP4
					fileType: 'video/mp4',
					fileSize: 1024 * 1024,
				},
			];

			const result = validateFiles(files);
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('does not match MIME type');
		});
	});

	describe('formatFileSize', () => {
		it('should format bytes correctly', () => {
			expect(formatFileSize(500)).toBe('500 B');
			expect(formatFileSize(1024)).toBe('1 KB');
			expect(formatFileSize(1536)).toBe('2 KB'); // Rounded
			expect(formatFileSize(1024 * 1024)).toBe('1 MB');
			expect(formatFileSize(1.5 * 1024 * 1024)).toBe('2 MB'); // Rounded
		});
	});

	describe('getFileExtension', () => {
		it('should extract file extensions correctly', () => {
			expect(getFileExtension('test.jpg')).toBe('jpg');
			expect(getFileExtension('document.pdf')).toBe('pdf');
			expect(getFileExtension('video.MP4')).toBe('mp4'); // Lowercase
			expect(getFileExtension('no-extension')).toBe('');
			expect(getFileExtension('multiple.dots.file.txt')).toBe('txt');
		});
	});

	describe('validateFileExtensionMatch', () => {
		it('should validate matching extensions and MIME types', () => {
			const testCases = [
				{ filename: 'photo.jpg', mimeType: 'image/jpeg' },
				{ filename: 'photo.jpeg', mimeType: 'image/jpeg' },
				{ filename: 'image.png', mimeType: 'image/png' },
				{ filename: 'video.mp4', mimeType: 'video/mp4' },
				{ filename: 'document.pdf', mimeType: 'application/pdf' },
			];

			testCases.forEach(({ filename, mimeType }) => {
				const result = validateFileExtensionMatch(filename, mimeType);
				expect(result.isValid).toBe(true);
			});
		});

		it('should reject mismatched extensions and MIME types', () => {
			const testCases = [
				{ filename: 'photo.png', mimeType: 'image/jpeg' },
				{ filename: 'video.jpg', mimeType: 'video/mp4' },
				{ filename: 'document.txt', mimeType: 'application/pdf' },
			];

			testCases.forEach(({ filename, mimeType }) => {
				const result = validateFileExtensionMatch(filename, mimeType);
				expect(result.isValid).toBe(false);
				expect(result.error).toContain('does not match MIME type');
			});
		});

		it('should handle unknown MIME types', () => {
			const result = validateFileExtensionMatch('file.xyz', 'application/unknown');
			expect(result.isValid).toBe(false);
			expect(result.error).toContain('Unknown MIME type');
		});
	});
});