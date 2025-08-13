'use dom';

import { useState, useRef, DragEvent, ChangeEvent, createContext, useContext } from 'react';

type DropzoneProps = {
	onDrop?: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
	accept?: Record<string, string[]>;
	maxFiles?: number;
	maxSize?: number;
	minSize?: number;
	disabled?: boolean;
	className?: string;
	children?: React.ReactNode;
};

type FileRejection = {
	file: File;
	errors: Array<{ code: string; message: string }>;
};

const formatBytes = (bytes: number): string => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const validateFile = (
	file: File,
	accept?: Record<string, string[]>,
	maxSize?: number,
	minSize?: number
): FileRejection | null => {
	const errors: Array<{ code: string; message: string }> = [];

	// Check file type and extension
	if (accept) {
		const acceptedTypes = Object.keys(accept).flatMap((key) => accept[key]);
		const fileType = file.type;
		const fileName = file.name.toLowerCase();
		const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

		const isTypeAccepted = acceptedTypes.some((type) => {
			if (type.endsWith('/*')) {
				return fileType.startsWith(type.slice(0, -1));
			}
			return fileType === type;
		});

		// Also check extensions for enhanced security
		const acceptedExtensions = Object.keys(accept);
		const isExtensionAccepted = acceptedExtensions.some((ext) => {
			if (ext.startsWith('.')) {
				return fileExtension === ext.toLowerCase();
			}
			return false;
		});

		// File is accepted if either MIME type OR extension matches
		if (!isTypeAccepted && !isExtensionAccepted) {
			errors.push({
				code: 'file-invalid-type',
				message: `File type ${fileType} or extension ${fileExtension} is not accepted`,
			});
		}
	}

	// Check file size
	if (maxSize && file.size > maxSize) {
		errors.push({
			code: 'file-too-large',
			message: `File is larger than ${formatBytes(maxSize)}`,
		});
	}

	if (minSize && file.size < minSize) {
		errors.push({
			code: 'file-too-small',
			message: `File is smaller than ${formatBytes(minSize)}`,
		});
	}

	return errors.length > 0 ? { file, errors } : null;
};

const Dropzone = ({
	onDrop,
	accept,
	maxFiles = 1,
	maxSize,
	minSize,
	disabled = false,
	className = '',
	children,
}: DropzoneProps) => {
	const [isDragActive, setIsDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const processFiles = (files: FileList | File[]) => {
		const fileArray = Array.from(files);
		const limitedFiles = maxFiles ? fileArray.slice(0, maxFiles) : fileArray;

		const acceptedFiles: File[] = [];
		const rejectedFiles: FileRejection[] = [];

		limitedFiles.forEach((file) => {
			const rejection = validateFile(file, accept, maxSize, minSize);
			if (rejection) {
				rejectedFiles.push(rejection);
			} else {
				acceptedFiles.push(file);
			}
		});

		onDrop?.(acceptedFiles, rejectedFiles);
	};

	const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		setIsDragActive(true);
	};

	const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;
		setIsDragActive(false);
	};

	const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = (e: DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		if (disabled) return;

		setIsDragActive(false);
		const files = e.dataTransfer.files;
		processFiles(files);
	};

	const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		if (disabled) return;
		const files = e.target.files;
		if (files) {
			processFiles(files);
		}
	};

	const handleClick = () => {
		if (disabled) return;
		fileInputRef.current?.click();
	};

	// Build accept string for input element
	const acceptString = accept
		? Object.keys(accept)
			.flatMap((key) => accept[key])
			.join(',')
		: undefined;

	return (
		<div
			className={`
        relative border-2 border-dashed border-gray-300 rounded-lg p-8
        transition-colors duration-200 cursor-pointer
        hover:border-gray-400 hover:bg-gray-50
        ${isDragActive ? 'border-blue-400 bg-blue-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			onClick={handleClick}
		>
			<input
				ref={fileInputRef}
				type="file"
				className="hidden"
				multiple={maxFiles !== 1}
				accept={acceptString}
				onChange={handleFileInput}
				disabled={disabled}
			/>

			{children || (
				<div className="text-center">
					<div className="mb-4">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							stroke="currentColor"
							fill="none"
							viewBox="0 0 48 48"
						>
							<path
								d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</div>
					<p className="text-lg font-medium text-gray-900">
						{isDragActive ? 'Drop files here' : 'Drag and drop files here'}
					</p>
					<p className="text-sm text-gray-500 mt-1">or click to select files</p>
					{maxFiles && (
						<p className="text-xs text-gray-400 mt-2">
							Up to {maxFiles} file{maxFiles > 1 ? 's' : ''} allowed
						</p>
					)}
					{maxSize && (
						<p className="text-xs text-gray-400">
							Maximum file size: {formatBytes(maxSize)}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

// Context and compound components for consistency with existing API
type DropzoneContextType = {
	files?: File[];
	accept?: Record<string, string[]>;
	maxSize?: number;
	minSize?: number;
	maxFiles?: number;
};

const DropzoneContext = createContext<DropzoneContextType | undefined>(undefined);

const DropzoneProvider = ({
	children,
	files,
	accept,
	maxSize,
	minSize,
	maxFiles,
}: {
	children: React.ReactNode;
	files?: File[];
	accept?: Record<string, string[]>;
	maxSize?: number;
	minSize?: number;
	maxFiles?: number;
}) => (
	<DropzoneContext.Provider value={{ files, accept, maxSize, minSize, maxFiles }}>
		{children}
	</DropzoneContext.Provider>
);

const useDropzoneContext = () => {
	const context = useContext(DropzoneContext);
	if (!context) {
		throw new Error('useDropzoneContext must be used within a DropzoneProvider');
	}
	return context;
};

// Default export with all components and types
 
export default {
	Dropzone,
	DropzoneProvider,
	useDropzoneContext,
	// Export types as properties for compatibility
	DropzoneProps: {} as DropzoneProps,
	FileRejection: {} as FileRejection,
};
