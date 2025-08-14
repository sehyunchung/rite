/**
 * Effect-based file upload utilities for type-safe, composable file operations
 */
import { Effect, Schedule, Stream, Ref, Schema } from 'effect';
declare const FileTooLargeError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "FileTooLargeError";
} & Readonly<A>;
export declare class FileTooLargeError extends FileTooLargeError_base<{
    readonly fileName: string;
    readonly size: number;
    readonly maxSize: number;
}> {
}
declare const InvalidFileTypeError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidFileTypeError";
} & Readonly<A>;
export declare class InvalidFileTypeError extends InvalidFileTypeError_base<{
    readonly fileName: string;
    readonly type: string;
    readonly allowedTypes: readonly string[];
}> {
}
declare const UploadNetworkError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "UploadNetworkError";
} & Readonly<A>;
export declare class UploadNetworkError extends UploadNetworkError_base<{
    readonly fileName: string;
    readonly message: string;
    readonly statusCode?: number;
}> {
}
declare const StorageError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "StorageError";
} & Readonly<A>;
export declare class StorageError extends StorageError_base<{
    readonly fileName: string;
    readonly message: string;
}> {
}
export type FileUploadError = FileTooLargeError | InvalidFileTypeError | UploadNetworkError | StorageError;
export declare const UploadFileMetadataSchema: Schema.Struct<{
    fileName: typeof Schema.NonEmptyString;
    fileType: typeof Schema.String;
    fileSize: Schema.filter<typeof Schema.Number>;
    storageId: typeof Schema.String;
}>;
export declare const UploadResultSchema: Schema.Struct<{
    fileName: typeof Schema.NonEmptyString;
    storageId: typeof Schema.String;
    url: Schema.optional<typeof Schema.String>;
    uploadedAt: typeof Schema.Date;
}>;
export type UploadFileMetadata = Schema.Schema.Type<typeof UploadFileMetadataSchema>;
export type UploadResult = Schema.Schema.Type<typeof UploadResultSchema>;
export interface FileToUpload {
    name: string;
    mimeType: string;
    size: number;
    uri?: string;
    blob?: Blob;
}
/**
 * Validates a file's size and type using Effect
 */
export declare const validateFileEffect: (file: FileToUpload) => Effect.Effect<FileToUpload, FileTooLargeError | InvalidFileTypeError, never>;
export interface UploadProgress {
    fileName: string;
    loaded: number;
    total: number;
    percentage: number;
}
/**
 * Creates a ref for tracking upload progress
 */
export declare const createProgressTracker: () => Effect.Effect<Ref.Ref<UploadProgress | null>, never, never>;
/**
 * Updates progress for a file upload
 */
export declare const updateProgress: (ref: Ref.Ref<UploadProgress | null>, progress: UploadProgress) => Effect.Effect<void, never, never>;
/**
 * Generates an upload URL from the backend
 */
export declare const generateUploadUrl: (fileName: string) => Effect.Effect<{
    uploadUrl: string;
    storageId: string;
}, StorageError, never>;
/**
 * Uploads a file to the storage service
 */
export declare const uploadFileToStorage: (file: FileToUpload, uploadUrl: string, onProgress?: (progress: UploadProgress) => void) => Effect.Effect<{
    readonly fileName: string;
    readonly storageId: string;
    readonly url?: string | undefined;
    readonly uploadedAt: Date;
}, UploadNetworkError, never>;
/**
 * Complete file upload pipeline with validation, URL generation, and upload
 */
export declare const uploadFile: (file: FileToUpload, options?: {
    onProgress?: (progress: UploadProgress) => void;
    retrySchedule?: Schedule.Schedule<any, any, any>;
}) => Effect.Effect<{
    storageId: string;
    fileName: string;
    url?: string | undefined;
    uploadedAt: Date;
}, FileTooLargeError | InvalidFileTypeError | UploadNetworkError | StorageError | import("effect/Cause").TimeoutException, any>;
/**
 * Uploads multiple files in parallel with concurrency control
 */
export declare const uploadMultipleFiles: (files: FileToUpload[], options?: {
    concurrency?: number;
    onProgress?: (fileName: string, progress: UploadProgress) => void;
    continueOnError?: boolean;
}) => Effect.Effect<{
    storageId: string;
    fileName: string;
    url?: string | undefined;
    uploadedAt: Date;
}[] | import("effect/Either").Either<{
    storageId: string;
    fileName: string;
    url?: string | undefined;
    uploadedAt: Date;
}, FileTooLargeError | InvalidFileTypeError | UploadNetworkError | StorageError | import("effect/Cause").TimeoutException>[], FileTooLargeError | InvalidFileTypeError | UploadNetworkError | StorageError | import("effect/Cause").TimeoutException, any>;
/**
 * Creates a stream for chunked file upload
 */
export declare const createFileStream: (file: Blob, _chunkSize?: number) => Stream.Stream<Uint8Array<ArrayBufferLike>, Error, never>;
/**
 * Creates a human-readable error message from FileUploadError
 */
export declare const formatUploadError: (error: FileUploadError) => string;
export {};
//# sourceMappingURL=file-upload-effect.d.ts.map