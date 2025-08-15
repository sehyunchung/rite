import * as React from 'react';
import {
	View,
	ScrollView,
	SafeAreaView,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
} from 'react-native';
import { Typography, Card, Button, Input, Textarea } from '../../lib/ui-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../../lib/time-utils';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import {
	validateFile,
	formatFileSize,
	MAX_FILE_SIZE,
	// Effect-based utilities
	type FileToUpload,
} from '@rite/shared-types';
import { Runtime } from 'effect';

interface SelectedFile extends FileToUpload {
	uri: string;
	type: 'image' | 'video' | 'document';
}

export default function DJSubmissionScreenWithEffect() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const router = useRouter();
	const createSubmission = useMutation(api.submissions.saveSubmission);
	const generateUploadUrlMutation = useMutation(api.submissions.generateUploadUrl);

	// Form state
	const [djName, setDjName] = React.useState('');
	const [djEmail, setDjEmail] = React.useState('');
	const [djPhone, setDjPhone] = React.useState('');
	// Preferred contact method UI implementation needed - tracked in project management
	const [preferredContact] = React.useState<'email' | 'phone' | 'both'>('email');
	const [guestNames, setGuestNames] = React.useState('');
	// const [guestNamesLineup, setGuestNamesLineup] = React.useState(''); // Future feature
	const [promoVideoUrl, setPromoVideoUrl] = React.useState('');
	const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	// Progress tracking state
	const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({});
	const [currentUploadingFile, setCurrentUploadingFile] = React.useState<string | null>(null);

	// Get event and timeslot data
	const submissionData = useQuery(
		api.timeslots.getTimeslotByToken,
		token ? { submissionToken: token } : 'skip'
	);

	// Check if already submitted
	const existingSubmission = useQuery(
		api.submissions.getSubmissionByToken,
		token ? { submissionToken: token } : 'skip'
	);

	const event = submissionData?.event;
	const timeslot = submissionData || undefined;

	// Create Effect runtime for future use
	// const runtime = React.useMemo(() => Runtime.defaultRuntime, []);

	if (!token) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-800">
				<View className="p-6">
					<Typography variant="body" color="secondary">
						No submission token provided
					</Typography>
				</View>
			</SafeAreaView>
		);
	}

	if (submissionData === undefined || existingSubmission === undefined) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-800">
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" className="text-brand-primary" />
				</View>
			</SafeAreaView>
		);
	}

	if (!submissionData) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-800">
				<View className="p-6">
					<Typography variant="h4" className="mb-4 text-white">
						Invalid Token
					</Typography>
					<Typography variant="body" color="secondary">
						This submission link is invalid or has expired.
					</Typography>
				</View>
			</SafeAreaView>
		);
	}

	if (existingSubmission) {
		return (
			<SafeAreaView className="flex-1 bg-neutral-800">
				<View className="p-6">
					<Typography variant="h4" className="mb-4 text-white">
						Already Submitted
					</Typography>
					<Card className="bg-neutral-700 p-6">
						<Typography variant="body" className="mb-2 text-white">
							You have already submitted for this slot.
						</Typography>
						<Typography variant="caption" color="secondary">
							Submitted on: {new Date(existingSubmission._creationTime).toLocaleDateString()}
						</Typography>
					</Card>
				</View>
			</SafeAreaView>
		);
	}

	// File validation using shared utilities
	const validateSelectedFile = (file: SelectedFile): boolean => {
		const validation = validateFile({
			fileName: file.name,
			fileType: file.mimeType,
			fileSize: file.size,
		});

		if (!validation.isValid) {
			Alert.alert('Invalid File', validation.error || 'File validation failed');
			return false;
		}

		return true;
	};

	const selectImages = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsMultipleSelection: true,
				quality: 0.8,
			});

			if (!result.canceled && result.assets) {
				const newFiles: SelectedFile[] = result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.fileName || 'image.jpg',
					size: asset.fileSize || 0,
					mimeType: asset.mimeType || 'image/jpeg',
					type: 'image' as const,
				}));

				// Validate files using Effect
				const validFiles = newFiles.filter(validateSelectedFile);
				if (validFiles.length > 0) {
					setSelectedFiles((prev) => [...prev, ...validFiles]);
				}
			}
		} catch (error) {
			console.error('Error selecting images:', error);
			Alert.alert('Error', 'Failed to select images');
		}
	};

	const selectVideos = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: ['video/mp4', 'video/mov', 'video/avi'],
				multiple: true,
			});

			if (!result.canceled && result.assets) {
				const newFiles: SelectedFile[] = result.assets.map((asset) => ({
					uri: asset.uri,
					name: asset.name,
					size: asset.size || 0,
					mimeType: asset.mimeType || 'video/mp4',
					type: 'video' as const,
				}));

				// Validate files using Effect
				const validFiles = newFiles.filter(validateSelectedFile);
				if (validFiles.length > 0) {
					setSelectedFiles((prev) => [...prev, ...validFiles]);
				}
			}
		} catch (error) {
			console.error('Error selecting videos:', error);
			Alert.alert('Error', 'Failed to select videos');
		}
	};

	const removeFile = (uri: string) => {
		setSelectedFiles((prev) => prev.filter((file) => file.uri !== uri));
		setUploadProgress((prev) => {
			const newProgress = { ...prev };
			const fileName = selectedFiles.find((f) => f.uri === uri)?.name;
			if (fileName) delete newProgress[fileName];
			return newProgress;
		});
	};

	const validateForm = () => {
		if (!djName.trim()) {
			Alert.alert('Error', 'Please enter your DJ name');
			return false;
		}

		if (!djEmail.trim()) {
			Alert.alert('Error', 'Please enter your email address');
			return false;
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(djEmail.trim())) {
			Alert.alert('Error', 'Please enter a valid email address');
			return false;
		}

		const guestList = guestNames.split('\n').filter((name) => name.trim());
		if (guestList.length > (event?.guestLimitPerDJ || 10)) {
			Alert.alert('Error', `Maximum ${event?.guestLimitPerDJ || 10} guests allowed`);
			return false;
		}

		return true;
	};

	// Concurrent file upload with Promise.allSettled
	const uploadFilesWithConcurrency = async (files: SelectedFile[]) => {
		// Upload single file function
		const uploadSingleFile = async (file: SelectedFile) => {
			try {
				setCurrentUploadingFile(file.name);

				// Generate upload URL
				const uploadUrl = await generateUploadUrlMutation({
					fileType: file.mimeType,
					fileSize: file.size,
				});

				// Update progress
				setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }));

				// Create form data
				const formData = new FormData();
				formData.append('file', {
					uri: file.uri,
					name: file.name,
					type: file.mimeType,
				} as any);

				// Upload file
				const response = await fetch(uploadUrl, {
					method: 'POST',
					body: formData,
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const result = await response.json();

				// Update progress to complete
				setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

				return {
					fileName: file.name,
					fileType: file.mimeType,
					fileSize: file.size,
					storageId: result.storageId as Id<'_storage'>,
				};
			} catch (error) {
				console.error(`Failed to upload ${file.name}:`, error);
				throw new Error(`Failed to upload ${file.name}: ${String(error)}`);
			}
		};

		// Upload all files concurrently
		const uploadPromises = files.map(uploadSingleFile);
		const results = await Promise.allSettled(uploadPromises);

		setCurrentUploadingFile(null);

		// Separate successful and failed uploads
		const uploadedFiles: any[] = [];
		const failedFiles: string[] = [];

		results.forEach((result, index) => {
			if (result.status === 'fulfilled') {
				uploadedFiles.push(result.value);
			} else {
				failedFiles.push(files[index].name);
			}
		});

		// Report failed uploads
		if (failedFiles.length > 0) {
			Alert.alert('Some uploads failed', `Failed to upload: ${failedFiles.join(', ')}`);
		}

		return uploadedFiles;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Upload files using concurrent implementation
			const uploadedFiles = await uploadFilesWithConcurrency(selectedFiles);

			if (uploadedFiles.length === 0 && selectedFiles.length > 0) {
				// All uploads failed
				Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
				return;
			}

			const guestList = guestNames
				.split('\n')
				.filter((name) => name.trim())
				.map((name) => ({ name: name.trim() }));

			await createSubmission({
				eventId: submissionData.eventId,
				timeslotId: submissionData._id,
				submissionToken: token,
				promoFiles: uploadedFiles,
				promoDescription: promoVideoUrl.trim() || '',
				guestList,
				djContact: {
					email: djEmail.trim(),
					phone: djPhone.trim() || undefined,
					preferredContactMethod: preferredContact,
				},
				paymentInfo: {
					accountHolder: djName.trim(),
					bankName: '',
					accountNumber: '',
					residentNumber: '',
					preferDirectContact: false,
				},
			});

			Alert.alert('Success', 'Your information has been submitted successfully!', [
				{
					text: 'OK',
					onPress: () => router.replace('/'),
				},
			]);
		} catch (error) {
			console.error('Submission error:', error);
			Alert.alert('Error', 'Failed to submit. Please try again.');
		} finally {
			setIsSubmitting(false);
			setUploadProgress({});
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-neutral-800">
			<ScrollView className="flex-1">
				<View className="p-6">
					{/* Event Info */}
					<Card className="mb-6 bg-neutral-700 p-6">
						<Typography variant="h4" className="mb-2 text-white">
							{event?.name}
						</Typography>
						<Typography variant="body" className="mb-1 text-neutral-300">
							{typeof event?.venue === 'string'
								? event.venue
								: typeof event?.venue === 'object' && event?.venue
									? `${event.venue.name}, ${event.venue.address}`
									: 'Unknown venue'}
						</Typography>
						<Typography variant="caption" color="secondary">
							{timeslot && `${formatTime(timeslot.startTime)} - ${formatTime(timeslot.endTime)}`}
						</Typography>
					</Card>

					{/* DJ Info */}
					<Card className="mb-6 bg-neutral-700 p-6">
						<Typography variant="h5" className="mb-4 text-white">
							DJ Information
						</Typography>

						<View className="mb-4">
							<Typography variant="label" className="mb-2 text-neutral-300">
								DJ Name *
							</Typography>
							<Input
								value={djName}
								onChangeText={setDjName}
								placeholder="Enter your DJ name"
								className="bg-neutral-600"
							/>
						</View>

						<View className="mb-4">
							<Typography variant="label" className="mb-2 text-neutral-300">
								Email *
							</Typography>
							<Input
								value={djEmail}
								onChangeText={setDjEmail}
								placeholder="your@email.com"
								keyboardType="email-address"
								autoCapitalize="none"
								className="bg-neutral-600"
							/>
						</View>

						<View className="mb-4">
							<Typography variant="label" className="mb-2 text-neutral-300">
								Phone Number
							</Typography>
							<Input
								value={djPhone}
								onChangeText={setDjPhone}
								placeholder="010-1234-5678"
								keyboardType="phone-pad"
								className="bg-neutral-600"
							/>
						</View>
					</Card>

					{/* Guest List */}
					<Card className="mb-6 bg-neutral-700 p-6">
						<Typography variant="h5" className="mb-2 text-white">
							Guest List
						</Typography>
						<Typography variant="caption" className="mb-4 text-neutral-400">
							Maximum {event?.guestLimitPerDJ || 10} guests. Enter one name per line.
						</Typography>

						<Textarea
							value={guestNames}
							onChangeText={setGuestNames}
							placeholder="Enter guest names (one per line)"
							numberOfLines={5}
							className="bg-neutral-600"
						/>
					</Card>

					{/* Promo Materials */}
					<Card className="mb-6 bg-neutral-700 p-6">
						<Typography variant="h5" className="mb-4 text-white">
							Promo Materials
						</Typography>

						<View className="mb-4">
							<Typography variant="label" className="mb-2 text-neutral-300">
								Video URL (Optional)
							</Typography>
							<Input
								value={promoVideoUrl}
								onChangeText={setPromoVideoUrl}
								placeholder="YouTube, Instagram, etc."
								className="bg-neutral-600"
							/>
						</View>

						<View className="mb-4">
							<Typography variant="label" className="mb-2 text-neutral-300">
								Upload Files
							</Typography>
							<Typography variant="caption" className="mb-2 text-neutral-400">
								Max {formatFileSize(MAX_FILE_SIZE)} per file
							</Typography>

							<View className="flex-row gap-2">
								<Button onPress={selectImages} variant="secondary" size="sm" className="flex-1">
									<Ionicons name="image-outline" size={16} color="white" />
									<Typography variant="button" className="ml-2 text-white">
										Images
									</Typography>
								</Button>
								<Button onPress={selectVideos} variant="secondary" size="sm" className="flex-1">
									<Ionicons name="videocam-outline" size={16} color="white" />
									<Typography variant="button" className="ml-2 text-white">
										Videos
									</Typography>
								</Button>
							</View>

							{/* Selected Files with Progress */}
							{selectedFiles.length > 0 && (
								<View className="mt-4">
									{selectedFiles.map((file) => (
										<View
											key={file.uri}
											className="mb-2 flex-row items-center justify-between rounded-lg bg-neutral-600 p-3"
										>
											<View className="flex-1">
												<Typography variant="caption" className="text-white">
													{file.name}
												</Typography>
												<Typography variant="caption" color="secondary">
													{formatFileSize(file.size)}
												</Typography>
												{uploadProgress[file.name] !== undefined && (
													<View className="mt-1">
														<View className="h-1 w-full overflow-hidden rounded-full bg-neutral-500">
															<View
																className="h-full bg-brand-primary"
																style={{ width: `${uploadProgress[file.name]}%` }}
															/>
														</View>
														<Typography variant="caption" color="secondary" className="mt-1">
															{uploadProgress[file.name]}% uploaded
														</Typography>
													</View>
												)}
											</View>
											{!isSubmitting && (
												<TouchableOpacity onPress={() => removeFile(file.uri)}>
													<Ionicons name="close-circle" size={24} color="#ef4444" />
												</TouchableOpacity>
											)}
										</View>
									))}
								</View>
							)}
						</View>
					</Card>

					{/* Submit Button */}
					<Button onPress={handleSubmit} disabled={isSubmitting} className="mb-8">
						{isSubmitting ? (
							<>
								<ActivityIndicator size="small" color="white" />
								<Typography variant="button" className="ml-2 text-white">
									{currentUploadingFile ? `Uploading ${currentUploadingFile}...` : 'Submitting...'}
								</Typography>
							</>
						) : (
							<Typography variant="button" className="text-white">
								Submit Information
							</Typography>
						)}
					</Button>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
