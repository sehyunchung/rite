import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireAuth } from './auth';
import { computeEventCapabilities } from './eventStatus';
import { encryptSensitiveData, decryptSensitiveData, hashData } from './encryption';

// File validation constants
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'video/mp4',
	'video/mov',
	'video/avi',
	'video/quicktime',
	'application/pdf',
];

// Magic number validation constants
const MAGIC_NUMBERS = {
	'image/jpeg': [
		[0xff, 0xd8, 0xff], // JPEG/JFIF
	],
	'image/png': [
		[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], // PNG
	],
	'image/gif': [
		[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
		[0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
	],
	'image/webp': [
		[0x52, 0x49, 0x46, 0x46], // RIFF (need to check WEBP at offset 8-11)
	],
	'video/mp4': [
		// MP4 files have 'ftyp' box at bytes 4-7
		[0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70], // ....ftyp (simplified check)
	],
	'application/pdf': [
		[0x25, 0x50, 0x44, 0x46], // %PDF
	],
};

/**
 * Validate file content matches declared MIME type using magic numbers
 */
async function validateFileContent(
	ctx: any,
	storageId: string,
	declaredType: string
): Promise<void> {
	if (!MAGIC_NUMBERS[declaredType as keyof typeof MAGIC_NUMBERS]) {
		// If we don't have magic numbers for this type, skip validation
		return;
	}

	const blob = await ctx.storage.get(storageId);
	if (!blob) {
		throw new Error('File not found in storage');
	}

	const arrayBuffer = await blob.arrayBuffer();
	const bytes = new Uint8Array(arrayBuffer);

	const validMagicNumbers = MAGIC_NUMBERS[declaredType as keyof typeof MAGIC_NUMBERS];

	// Check if file starts with any of the valid magic numbers for this type
	for (const magicNumber of validMagicNumbers) {
		if (bytes.length >= magicNumber.length) {
			let matches = true;
			for (let i = 0; i < magicNumber.length; i++) {
				if (bytes[i] !== magicNumber[i]) {
					matches = false;
					break;
				}
			}
			if (matches) {
				// Special case for WebP: need to check WEBP signature at offset 8
				if (declaredType === 'image/webp') {
					if (bytes.length >= 12) {
						const webpSignature = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
						let webpMatches = true;
						for (let i = 0; i < webpSignature.length; i++) {
							if (bytes[8 + i] !== webpSignature[i]) {
								webpMatches = false;
								break;
							}
						}
						if (webpMatches) return; // Valid WebP
					}
				} else {
					return; // Valid magic number found
				}
			}
		}
	}

	throw new Error('File content does not match declared MIME type');
}

// Generate upload URL for file storage with validation
export const generateUploadUrl = mutation({
	args: {
		fileType: v.string(),
		fileSize: v.number(),
	},
	handler: async (ctx, args) => {
		// Validate file size - reject negative sizes
		if (args.fileSize < 0) {
			throw new Error('File size must be a positive number');
		}

		// Validate file size - reject files exceeding maximum
		if (args.fileSize > MAX_FILE_SIZE) {
			throw new Error(
				`File size ${Math.round(args.fileSize / 1024 / 1024)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
			);
		}

		// Validate file type
		if (!ALLOWED_FILE_TYPES.includes(args.fileType)) {
			throw new Error(
				`File type ${args.fileType} is not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`
			);
		}

		// Generate a short-lived upload URL for file upload
		return await ctx.storage.generateUploadUrl();
	},
});

// Create or update a submission
export const saveSubmission = mutation({
	args: {
		eventId: v.id('events'),
		timeslotId: v.id('timeslots'),
		submissionToken: v.string(),
		promoFiles: v.array(
			v.object({
				fileName: v.string(),
				fileType: v.string(),
				fileSize: v.number(),
				storageId: v.id('_storage'),
			})
		),
		promoDescription: v.string(),
		guestList: v.array(
			v.object({
				name: v.string(),
				phone: v.optional(v.string()),
			})
		),
		paymentInfo: v.object({
			accountHolder: v.string(),
			bankName: v.string(),
			accountNumber: v.string(),
			residentNumber: v.string(),
			preferDirectContact: v.boolean(),
		}),
		djContact: v.object({
			email: v.string(),
			phone: v.optional(v.string()),
			preferredContactMethod: v.optional(
				v.union(v.literal('email'), v.literal('phone'), v.literal('both'))
			),
		}),
	},
	handler: async (ctx, args) => {
		// Verify the submission token matches the timeslot
		const timeslot = await ctx.db.get(args.timeslotId);
		if (!timeslot || timeslot.submissionToken !== args.submissionToken) {
			throw new Error('Invalid submission token');
		}

		// Check if submission already exists
		const existingSubmission = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('timeslotId'), args.timeslotId))
			.first();

		// Validate file content matches declared MIME types
		for (const file of args.promoFiles) {
			await validateFileContent(ctx, file.storageId, file.fileType);
		}

		// Encrypt sensitive payment data
		const encryptedAccountNumber = encryptSensitiveData(args.paymentInfo.accountNumber);
		const encryptedResidentNumber = encryptSensitiveData(args.paymentInfo.residentNumber);
		const accountNumberHash = hashData(args.paymentInfo.accountNumber);
		const residentNumberHash = hashData(args.paymentInfo.residentNumber);

		const submissionData = {
			eventId: args.eventId,
			timeslotId: args.timeslotId,
			uniqueLink: args.submissionToken,
			promoMaterials: {
				files: args.promoFiles.map((file) => ({
					fileName: file.fileName,
					fileType: file.fileType,
					fileSize: file.fileSize,
					convexFileId: file.storageId,
					uploadedAt: new Date().toISOString(),
				})),
				description: args.promoDescription,
			},
			guestList: args.guestList,
			paymentInfo: {
				accountHolder: args.paymentInfo.accountHolder,
				bankName: args.paymentInfo.bankName,
				// Encrypted sensitive data
				accountNumber: encryptedAccountNumber,
				residentNumber: encryptedResidentNumber,
				// Hashes for searchable encrypted data
				accountNumberHash: accountNumberHash,
				residentNumberHash: residentNumberHash,
				preferDirectContact: args.paymentInfo.preferDirectContact,
			},
			submittedAt: new Date().toISOString(),
			lastUpdatedAt: new Date().toISOString(),
			djContact: {
				email: args.djContact.email,
				phone: args.djContact.phone,
				preferredContactMethod: args.djContact.preferredContactMethod,
			},
		};

		let submissionId;
		if (existingSubmission) {
			// Update existing submission
			await ctx.db.patch(existingSubmission._id, submissionData);
			submissionId = existingSubmission._id;
		} else {
			// Create new submission
			submissionId = await ctx.db.insert('submissions', submissionData);

			// Update timeslot with submission reference
			await ctx.db.patch(args.timeslotId, {
				submissionId: submissionId,
			});
		}

		return { success: true, submissionId };
	},
});

// Get submission by timeslot ID (requires authentication)
export const getSubmissionByTimeslot = query({
	args: {
		timeslotId: v.id('timeslots'),
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		// Verify the timeslot belongs to an event owned by the user
		const timeslot = await ctx.db.get(args.timeslotId);
		if (!timeslot) {
			throw new Error('Timeslot not found');
		}

		const event = await ctx.db.get(timeslot.eventId);
		if (!event || event.organizerId !== args.userId) {
			throw new Error('Access denied');
		}

		return await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('timeslotId'), args.timeslotId))
			.first();
	},
});

// Get submission status for an event (must be owned by authenticated user)
export const getEventSubmissionStatus = query({
	args: { eventId: v.id('events') },
	handler: async (ctx, args) => {
		const userId = await requireAuth(ctx);

		// Verify the event belongs to the authenticated user
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error('Event not found');
		}
		if (event.organizerId !== userId) {
			throw new Error('Access denied');
		}
		const timeslots = await ctx.db
			.query('timeslots')
			.filter((q) => q.eq(q.field('eventId'), args.eventId))
			.collect();

		const submissions = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('eventId'), args.eventId))
			.collect();

		const submissionMap = new Map(submissions.map((s) => [s.timeslotId, s]));

		return timeslots.map((timeslot) => ({
			timeslotId: timeslot._id,
			djName: timeslot.djName,
			djInstagram: timeslot.djInstagram,
			startTime: timeslot.startTime,
			endTime: timeslot.endTime,
			hasSubmitted: submissionMap.has(timeslot._id),
			submittedAt: submissionMap.get(timeslot._id)?.submittedAt,
			guestCount: submissionMap.get(timeslot._id)?.guestList.length || 0,
			fileCount: submissionMap.get(timeslot._id)?.promoMaterials.files.length || 0,
		}));
	},
});

// Get file URL for viewing (requires authentication)
export const getFileUrl = query({
	args: { storageId: v.id('_storage') },
	handler: async (ctx, args) => {
		await requireAuth(ctx); // Ensure user is authenticated to view files
		return await ctx.storage.getUrl(args.storageId);
	},
});

// Mutation to update an existing submission
export const updateSubmission = mutation({
	args: {
		submissionId: v.id('submissions'),
		submissionToken: v.string(),
		promoFiles: v.optional(
			v.array(
				v.object({
					fileName: v.string(),
					fileType: v.string(),
					fileSize: v.number(),
					storageId: v.id('_storage'),
				})
			)
		),
		promoDescription: v.optional(v.string()),
		guestList: v.optional(
			v.array(
				v.object({
					name: v.string(),
					phone: v.optional(v.string()),
				})
			)
		),
		paymentInfo: v.optional(
			v.object({
				accountHolder: v.string(),
				bankName: v.string(),
				accountNumber: v.string(),
				residentNumber: v.string(),
				preferDirectContact: v.boolean(),
			})
		),
	},
	handler: async (ctx, args) => {
		// Get the existing submission
		const submission = await ctx.db.get(args.submissionId);
		if (!submission) {
			throw new Error('Submission not found');
		}

		// Verify the submission token matches
		if (submission.uniqueLink !== args.submissionToken) {
			throw new Error('Invalid submission token');
		}

		// Check if the event allows editing submissions
		const event = await ctx.db.get(submission.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		// Get event capabilities to check if submissions can be edited
		const timeslots = await ctx.db
			.query('timeslots')
			.filter((q) => q.eq(q.field('eventId'), submission.eventId))
			.collect();
		const submissions = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('eventId'), submission.eventId))
			.collect();

		const capabilities = computeEventCapabilities(event, timeslots, submissions);
		if (!capabilities.canAcceptSubmissions) {
			throw new Error('Submissions can no longer be edited for this event');
		}

		// Validate file content matches declared MIME types (if files are being updated)
		if (args.promoFiles !== undefined) {
			for (const file of args.promoFiles) {
				await validateFileContent(ctx, file.storageId, file.fileType);
			}
		}

		// Build update object with only provided fields
		const updateData: any = {
			lastUpdatedAt: new Date().toISOString(),
		};

		if (args.promoFiles !== undefined) {
			updateData.promoMaterials = {
				files: args.promoFiles.map((file) => ({
					fileName: file.fileName,
					fileType: file.fileType,
					fileSize: file.fileSize,
					convexFileId: file.storageId,
					uploadedAt: new Date().toISOString(),
				})),
				description: args.promoDescription || submission.promoMaterials.description,
			};
		} else if (args.promoDescription !== undefined) {
			updateData.promoMaterials = {
				...submission.promoMaterials,
				description: args.promoDescription,
			};
		}

		if (args.guestList !== undefined) {
			updateData.guestList = args.guestList;
		}

		if (args.paymentInfo !== undefined) {
			// Encrypt sensitive payment data
			const encryptedAccountNumber = encryptSensitiveData(args.paymentInfo.accountNumber);
			const encryptedResidentNumber = encryptSensitiveData(args.paymentInfo.residentNumber);
			const accountNumberHash = hashData(args.paymentInfo.accountNumber);
			const residentNumberHash = hashData(args.paymentInfo.residentNumber);

			updateData.paymentInfo = {
				accountHolder: args.paymentInfo.accountHolder,
				bankName: args.paymentInfo.bankName,
				// Encrypted sensitive data
				accountNumber: encryptedAccountNumber,
				residentNumber: encryptedResidentNumber,
				// Hashes for searchable encrypted data
				accountNumberHash: accountNumberHash,
				residentNumberHash: residentNumberHash,
				preferDirectContact: args.paymentInfo.preferDirectContact,
			};
		}

		await ctx.db.patch(args.submissionId, updateData);

		return { success: true };
	},
});

// Mutation to delete a submission
export const deleteSubmission = mutation({
	args: {
		submissionId: v.id('submissions'),
		submissionToken: v.string(),
	},
	handler: async (ctx, args) => {
		// Get the existing submission
		const submission = await ctx.db.get(args.submissionId);
		if (!submission) {
			throw new Error('Submission not found');
		}

		// Verify the submission token matches
		if (submission.uniqueLink !== args.submissionToken) {
			throw new Error('Invalid submission token');
		}

		// Check if the event allows editing submissions
		const event = await ctx.db.get(submission.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		// Get event capabilities to check if submissions can be deleted
		const timeslots = await ctx.db
			.query('timeslots')
			.filter((q) => q.eq(q.field('eventId'), submission.eventId))
			.collect();
		const submissions = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('eventId'), submission.eventId))
			.collect();

		const capabilities = computeEventCapabilities(event, timeslots, submissions);
		if (!capabilities.canAcceptSubmissions) {
			throw new Error('Submissions can no longer be deleted for this event');
		}

		// Remove submission reference from timeslot
		const timeslot = await ctx.db.get(submission.timeslotId);
		if (timeslot && timeslot.submissionId === submission._id) {
			await ctx.db.patch(submission.timeslotId, {
				submissionId: undefined,
			});
		}

		// Delete the submission
		await ctx.db.delete(args.submissionId);

		return { success: true };
	},
});

// Query to get submission by token (for editing)
export const getSubmissionByToken = query({
	args: {
		submissionToken: v.string(),
	},
	handler: async (ctx, args) => {
		const submission = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('uniqueLink'), args.submissionToken))
			.first();

		if (!submission) {
			return null;
		}

		// Also get the related timeslot and event info
		const timeslot = await ctx.db.get(submission.timeslotId);
		const event = await ctx.db.get(submission.eventId);

		// Decrypt sensitive payment data before returning
		const decryptedSubmission = {
			...submission,
			paymentInfo: {
				...submission.paymentInfo,
				accountNumber: decryptSensitiveData(submission.paymentInfo.accountNumber),
				residentNumber: decryptSensitiveData(submission.paymentInfo.residentNumber),
				// Remove hash fields from response (internal only)
				accountNumberHash: undefined,
				residentNumberHash: undefined,
			},
			timeslot,
			event,
		};

		return decryptedSubmission;
	},
});

// Internal function for actions that don't require auth
export const getSubmissionsByEventId = query({
	args: {
		eventId: v.id('events'),
	},
	handler: async (ctx, args) => {
		const submissions = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('eventId'), args.eventId))
			.collect();

		return submissions;
	},
});

// Query to get all submissions for an event (for event organizer)
export const getSubmissionsByEvent = query({
	args: {
		eventId: v.id('events'),
		userId: v.id('users'),
	},
	handler: async (ctx, args) => {
		// First, verify the user owns this event
		const event = await ctx.db.get(args.eventId);
		if (!event) {
			throw new Error('Event not found');
		}

		if (event.organizerId !== args.userId) {
			throw new Error("Access denied: You don't own this event");
		}

		// Get all submissions for this event
		const submissions = await ctx.db
			.query('submissions')
			.filter((q) => q.eq(q.field('eventId'), args.eventId))
			.collect();

		return submissions;
	},
});

export const getSubmissionById = query({
	args: {
		submissionId: v.id('submissions'),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.submissionId);
	},
});
