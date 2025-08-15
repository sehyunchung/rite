/**
 * Effect-based file upload utilities for type-safe, composable file operations
 *
 * Why Effect for file uploads?
 * - Type-safe error handling: All errors are tracked at compile time
 * - Built-in retry logic: Essential for unreliable mobile networks
 * - Concurrent uploads: Fine-grained control over parallel operations
 * - Progress tracking: Stream-based architecture for real-time updates
 * - Resource safety: Automatic cleanup of file handles and connections
 *
 * See docs/effect-library-rationale.md for detailed architectural decisions
 */
import { Effect, Data, pipe, Schedule, Chunk, Stream, Ref, Option, Schema } from 'effect';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, formatFileSize, } from './file-validation';
// ============================================================================
// Error Types
// ============================================================================
export class FileTooLargeError extends Data.TaggedError('FileTooLargeError') {
}
export class InvalidFileTypeError extends Data.TaggedError('InvalidFileTypeError') {
}
export class UploadNetworkError extends Data.TaggedError('UploadNetworkError') {
}
export class StorageError extends Data.TaggedError('StorageError') {
}
// ============================================================================
// Schemas
// ============================================================================
export const UploadFileMetadataSchema = Schema.Struct({
    fileName: Schema.NonEmptyString,
    fileType: Schema.String,
    fileSize: Schema.Number.pipe(Schema.positive()),
    storageId: Schema.String,
});
export const UploadResultSchema = Schema.Struct({
    fileName: Schema.NonEmptyString,
    storageId: Schema.String,
    url: Schema.optional(Schema.String),
    uploadedAt: Schema.Date,
});
/**
 * Validates a file's size and type using Effect
 */
export const validateFileEffect = (file) => Effect.gen(function* () {
    // Validate size
    if (file.size > MAX_FILE_SIZE) {
        return yield* Effect.fail(new FileTooLargeError({
            fileName: file.name,
            size: file.size,
            maxSize: MAX_FILE_SIZE,
        }));
    }
    // Validate type
    const normalizedType = file.mimeType.toLowerCase().trim();
    if (!ALLOWED_FILE_TYPES.includes(normalizedType)) {
        return yield* Effect.fail(new InvalidFileTypeError({
            fileName: file.name,
            type: file.mimeType,
            allowedTypes: ALLOWED_FILE_TYPES,
        }));
    }
    return file;
});
/**
 * Creates a ref for tracking upload progress
 */
export const createProgressTracker = () => Ref.make(null);
/**
 * Updates progress for a file upload
 */
export const updateProgress = (ref, progress) => Ref.set(ref, progress);
// ============================================================================
// File Upload Effects
// ============================================================================
/**
 * Generates an upload URL from the backend
 */
export const generateUploadUrl = (fileName) => Effect.tryPromise({
    try: async () => {
        // This would be replaced with actual Convex mutation call
        // For now, returning a mock response
        return {
            uploadUrl: `https://storage.example.com/upload/${Date.now()}`,
            storageId: `storage_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };
    },
    catch: (error) => new StorageError({
        fileName,
        message: `Failed to generate upload URL: ${String(error)}`,
    }),
});
/**
 * Uploads a file to the storage service
 */
export const uploadFileToStorage = (file, uploadUrl, onProgress) => Effect.async((resume) => {
    return Effect.void; // Default return for both paths
    // For React Native, we'd use a different approach
    // This example shows web-based upload with XMLHttpRequest for progress tracking
    if (typeof XMLHttpRequest === 'undefined') {
        // React Native path using fetch (without progress)
        const formData = new FormData();
        if (file.uri) {
            formData.append('file', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType,
            });
        }
        fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
            .then((data) => {
            resume(Effect.succeed({
                fileName: file.name,
                storageId: data.storageId,
                url: data.url,
                uploadedAt: new Date(),
            }));
        })
            .catch((error) => {
            resume(Effect.fail(new UploadNetworkError({
                fileName: file.name,
                message: String(error),
            })));
        });
        return Effect.void;
    }
    else {
        // Web path with progress tracking
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress({
                    fileName: file.name,
                    loaded: event.loaded,
                    total: event.total,
                    percentage: Math.round((event.loaded / event.total) * 100),
                });
            }
        });
        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resume(Effect.succeed({
                        fileName: file.name,
                        storageId: response.storageId,
                        url: response.url,
                        uploadedAt: new Date(),
                    }));
                }
                catch (error) {
                    resume(Effect.fail(new UploadNetworkError({
                        fileName: file.name,
                        message: 'Invalid response format',
                    })));
                }
            }
            else {
                resume(Effect.fail(new UploadNetworkError({
                    fileName: file.name,
                    message: `HTTP ${xhr.status}`,
                    statusCode: xhr.status,
                })));
            }
        });
        xhr.addEventListener('error', () => {
            resume(Effect.fail(new UploadNetworkError({
                fileName: file.name,
                message: 'Network error',
            })));
        });
        if (!file.blob) {
            // If no blob, we can't proceed with web upload
            resume(Effect.fail(new UploadNetworkError({
                fileName: file.name,
                message: 'No blob data available for upload',
            })));
            return Effect.void;
        }
        const formData = new FormData();
        // TypeScript needs explicit type assertion here due to control flow limitations
        formData.append('file', file.blob, file.name);
        xhr.open('POST', uploadUrl);
        xhr.send(formData);
        // Return cleanup effect for cancellation
        return Effect.sync(() => {
            xhr.abort();
            console.log(`Upload cancelled: ${file.name}`);
        });
    }
});
/**
 * Complete file upload pipeline with validation, URL generation, and upload
 */
export const uploadFile = (file, options) => pipe(
// Validate file
validateFileEffect(file), 
// Generate upload URL
Effect.flatMap(() => generateUploadUrl(file.name)), 
// Upload file
Effect.flatMap(({ uploadUrl, storageId }) => uploadFileToStorage(file, uploadUrl, options?.onProgress).pipe(Effect.map((result) => ({
    ...result,
    storageId, // Use the storageId from URL generation
})))), 
// Add retry logic with exponential backoff
Effect.retry(options?.retrySchedule ||
    Schedule.exponential('1 second').pipe(Schedule.intersect(Schedule.recurs(3)))), 
// Add timeout
Effect.timeout('5 minutes'));
// ============================================================================
// Parallel Upload Effects
// ============================================================================
/**
 * Uploads multiple files in parallel with concurrency control
 */
export const uploadMultipleFiles = (files, options) => {
    const concurrency = options?.concurrency ?? 3;
    const mode = options?.continueOnError ? 'either' : 'default';
    return Effect.all(files.map((file) => uploadFile(file, {
        onProgress: (progress) => options?.onProgress?.(file.name, progress),
    })), { concurrency, mode });
};
// ============================================================================
// Stream-based Upload for Large Files
// ============================================================================
/**
 * Creates a stream for chunked file upload
 */
export const createFileStream = (file, _chunkSize = 1024 * 1024) => Stream.async((emit) => {
    const reader = file.stream().getReader();
    const readChunk = async () => {
        try {
            const { done, value } = await reader.read();
            if (done) {
                emit(Effect.fail(Option.none()));
            }
            else {
                emit(Effect.succeed(Chunk.of(value)));
                await readChunk();
            }
        }
        catch (error) {
            emit(Effect.fail(Option.some(new Error(String(error)))));
        }
    };
    readChunk();
    // Cleanup
    return Effect.sync(() => {
        reader.cancel();
    });
});
// ============================================================================
// Utility Functions
// ============================================================================
// formatFileSize is imported from './file-validation' and used internally
/**
 * Creates a human-readable error message from FileUploadError
 */
export const formatUploadError = (error) => {
    switch (error._tag) {
        case 'FileTooLargeError':
            return `File "${error.fileName}" is too large (${formatFileSize(error.size)}). Maximum size is ${formatFileSize(error.maxSize)}.`;
        case 'InvalidFileTypeError':
            return `File "${error.fileName}" has invalid type "${error.type}". Allowed types: ${error.allowedTypes.join(', ')}.`;
        case 'UploadNetworkError':
            return `Failed to upload "${error.fileName}": ${error.message}`;
        case 'StorageError':
            return `Storage error for "${error.fileName}": ${error.message}`;
    }
};
