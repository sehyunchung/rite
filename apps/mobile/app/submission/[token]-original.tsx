import * as React from 'react';
import { View, ScrollView, SafeAreaView, Platform, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Typography, Card, Button, Input, Textarea } from '../../lib/ui-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../../lib/time-utils';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { validateFile, formatFileSize, FileMetadata, MAX_FILE_SIZE } from '@rite/shared-types';

interface SelectedFile {
	uri: string;
	name: string;
	size: number;
	mimeType: string;
	type: 'image' | 'video' | 'document';
}

export default function DJSubmissionScreen() {
	const { token } = useLocalSearchParams<{ token: string }>();
	const router = useRouter();
	const createSubmission = useMutation(api.submissions.saveSubmission);
	const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);

	// Form state
	const [djName, setDjName] = React.useState('');
	const [djEmail, setDjEmail] = React.useState('');
	const [djPhone, setDjPhone] = React.useState('');
	// TODO: Add UI for selecting preferred contact method (like web version has)
	const [preferredContact] = React.useState<'email' | 'phone' | 'both'>('email');
	const [guestNames, setGuestNames] = React.useState('');
	const [guestNamesLineup, setGuestNamesLineup] = React.useState('');
	const [promoVideoUrl, setPromoVideoUrl] = React.useState('');
	const [selectedFiles, setSelectedFiles] = React.useState<SelectedFile[]>([]);
	const [isSubmitting, setIsSubmitting] = React.useState(false);

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
							Submitted on:{' '}
							{existingSubmission?.submittedAt
								? new Date(existingSubmission.submittedAt).toLocaleDateString()
								: 'Unknown'}
						</Typography>
					</Card>
				</View>
			</SafeAreaView>
		);
	}

	const { event } = submissionData;
	const timeslot = submissionData;

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	const validateSelectedFile = (file: SelectedFile): boolean => {
		const fileMetadata: FileMetadata = {
			fileName: file.name,
			fileType: file.mimeType,
			fileSize: file.size,
		};
		
		const validation = validateFile(fileMetadata);
		if (!validation.isValid) {
			Alert.alert('File Validation Error', validation.error);
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

				// Validate files
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

				// Validate files
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

	const handleSubmit = async () => {
		if (!validateForm()) return;

		setIsSubmitting(true);

		try {
			// Upload files to Convex storage
			const uploadedFiles = [];
			for (const file of selectedFiles) {
				try {
					// Generate upload URL
					const uploadUrl = await generateUploadUrl({
						fileType: file.mimeType,
						fileSize: file.size,
					});

					// Create form data with file
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
						throw new Error(`Failed to upload ${file.name}`);
					}

					const { storageId } = await response.json();

					uploadedFiles.push({
						fileName: file.name,
						fileType: file.mimeType,
						fileSize: file.size,
						storageId: storageId as Id<'_storage'>,
					});
				} catch (error) {
					console.error(`Error uploading file ${file.name}:`, error);
					Alert.alert('Upload Error', `Failed to upload ${file.name}. Please try again.`);
					return;
				}
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
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-neutral-800">
			<ScrollView className="flex-1">
				<View
					className="p-6"
					style={{
						paddingBottom: Platform.OS === 'ios' ? 80 : 60,
					}}
				>
					{/* Header */}
					<Typography variant="h4" className="mb-6 text-white">
						DJ Submission
					</Typography>

					{/* Event Info */}
					<Card className="bg-neutral-700 p-6 mb-6">
						<Typography variant="h5" className="mb-3 text-white">
							{event?.name || 'Event'}
						</Typography>

						<View className="gap-2">
							<View className="flex-row items-center">
								<Ionicons name="location" size={20} color="var(--neutral-400)" />
								<Typography variant="body" className="ml-2 text-neutral-400">
									{event?.venue?.name || 'TBD'}
								</Typography>
							</View>

							<View className="flex-row items-center">
								<Ionicons name="calendar" size={20} color="var(--neutral-400)" />
								<Typography variant="body" className="ml-2 text-neutral-400">
									{event?.date ? formatDate(event.date) : 'TBD'}
								</Typography>
							</View>

							<View className="flex-row items-center">
								<Ionicons name="time" size={20} color="var(--neutral-400)" />
								<Typography variant="body" className="ml-2 text-neutral-400">
									{formatTime(timeslot.startTime)} -{' '}
									{formatTime(timeslot.endTime)}
								</Typography>
							</View>
						</View>
					</Card>

					{/* Submission Form */}
					<View className="gap-6">
						{/* DJ Name */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								DJ Name *
							</Typography>
							<Input
								placeholder="Enter your DJ name"
								value={djName}
								onChangeText={setDjName}
								className="bg-neutral-700 border-neutral-600"
							/>
						</View>

						{/* Contact Information */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								Email Address *
							</Typography>
							<Input
								placeholder="your@email.com"
								value={djEmail}
								onChangeText={setDjEmail}
								keyboardType="email-address"
								autoCapitalize="none"
								className="bg-neutral-700 border-neutral-600"
							/>
						</View>

						<View>
							<Typography variant="label" className="mb-2 text-white">
								Phone Number (Optional)
							</Typography>
							<Input
								placeholder="010-1234-5678"
								value={djPhone}
								onChangeText={setDjPhone}
								keyboardType="phone-pad"
								className="bg-neutral-700 border-neutral-600"
							/>
						</View>

						{/* Guest Names */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								Guest Names (Max {event?.guestLimitPerDJ || 10})
							</Typography>
							<Textarea
								placeholder="Enter one name per line"
								value={guestNames}
								onChangeText={setGuestNames}
								className="bg-neutral-700 border-neutral-600"
							/>
							<Typography variant="caption" color="secondary" className="mt-1">
								{guestNames.split('\n').filter((name) => name.trim()).length} /{' '}
								{event?.guestLimitPerDJ || 10} guests
							</Typography>
						</View>

						{/* Guest Names for Lineup */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								Guest Names for Lineup (Optional)
							</Typography>
							<Input
								placeholder="Names to display on lineup"
								value={guestNamesLineup}
								onChangeText={setGuestNamesLineup}
								className="bg-neutral-700 border-neutral-600"
							/>
						</View>

						{/* Promo Video URL */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								Promo Video URL (Optional)
							</Typography>
							<Input
								placeholder="https://..."
								value={promoVideoUrl}
								onChangeText={setPromoVideoUrl}
								className="bg-neutral-700 border-neutral-600"
							/>
						</View>

						{/* File Upload Section */}
						<View>
							<Typography variant="label" className="mb-2 text-white">
								Upload Promo Materials (Optional)
							</Typography>
							
							<View className="gap-4">
								{/* File Selection Buttons */}
								<View className="flex-row gap-2">
									<TouchableOpacity
										onPress={selectImages}
										className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg p-3 items-center"
									>
										<Ionicons name="image" size={24} color="white" />
										<Typography variant="body" className="mt-1 text-white">
											Select Images
										</Typography>
									</TouchableOpacity>
									
									<TouchableOpacity
										onPress={selectVideos}
										className="flex-1 bg-neutral-700 border border-neutral-600 rounded-lg p-3 items-center"
									>
										<Ionicons name="videocam" size={24} color="white" />
										<Typography variant="body" className="mt-1 text-white">
											Select Videos
										</Typography>
									</TouchableOpacity>
								</View>

								{/* Selected Files List */}
								{selectedFiles.length > 0 && (
									<View>
										<Typography variant="h6" className="mb-2 text-white">
											Selected Files ({selectedFiles.length})
										</Typography>
										
										{selectedFiles.map((file, index) => (
											<View 
												key={`${file.uri}-${index}`}
												className="bg-neutral-700 border border-neutral-600 rounded-lg p-3 mb-2"
											>
												<View className="flex-row justify-between items-start">
													<View className="flex-1 mr-2">
														<Typography variant="body" className="text-white font-medium">
															{file.name}
														</Typography>
														<Typography variant="caption" color="secondary">
															{formatFileSize(file.size)}
														</Typography>
														<Typography variant="caption" color="secondary">
															{file.mimeType}
														</Typography>
													</View>
													
													<TouchableOpacity
														onPress={() => removeFile(file.uri)}
														className="bg-red-500/20 border border-red-500 rounded p-1"
														testID={`remove-file-${file.name}`}
													>
														<Ionicons name="close" size={16} color="#ef4444" />
													</TouchableOpacity>
												</View>
											</View>
										))}
									</View>
								)}

								{/* File Upload Info */}
								<View className="bg-neutral-700/50 border border-neutral-600 p-3 rounded-lg">
									<Typography variant="caption" color="secondary">
										• Maximum file size: {Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB per file
									</Typography>
									<Typography variant="caption" color="secondary">
										• Supported formats: JPG, PNG, MP4, MOV, AVI, PDF
									</Typography>
									<Typography variant="caption" color="secondary">
										• You can upload multiple files
									</Typography>
								</View>
							</View>
						</View>

						{/* Important Dates */}
						<Card className="bg-neutral-700 p-4">
							<Typography variant="h6" className="mb-3 text-white">
								Important Dates
							</Typography>
							<View className="gap-2">
								<View>
									<Typography variant="caption" color="secondary">
										Guest List Deadline
									</Typography>
									<Typography variant="body" className="text-white">
										{event?.deadlines?.guestList
											? formatDate(event.deadlines.guestList)
											: 'TBD'}
									</Typography>
								</View>
								<View>
									<Typography variant="caption" color="secondary">
										Promo Materials Deadline
									</Typography>
									<Typography variant="body" className="text-white">
										{event?.deadlines?.promoMaterials
											? formatDate(event.deadlines.promoMaterials)
											: 'TBD'}
									</Typography>
								</View>
							</View>
						</Card>

						{/* Submit Button */}
						<Button onPress={handleSubmit} disabled={isSubmitting} className="mt-4">
							{isSubmitting ? 'Submitting...' : 'Submit'}
						</Button>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
