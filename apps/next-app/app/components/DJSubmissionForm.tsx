'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Button } from '@rite/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rite/ui';
import { Input, Label, Textarea } from '@rite/ui';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@rite/ui';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { useTranslations } from 'next-intl';
import { FullScreenLoading, Typography } from '@rite/ui';
import { SubmissionCompleteMessage } from './SubmissionCompleteMessage';

interface DJSubmissionFormProps {
  submissionToken: string;
}

interface GuestListEntry {
  id: string;
  name: string;
  phone: string;
}

export function DJSubmissionForm({ submissionToken }: DJSubmissionFormProps) {
  const t = useTranslations('djSubmission');
  const timeslotData = useQuery(api.timeslots.getTimeslotByToken, { submissionToken });
  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const saveSubmission = useMutation(api.submissions.saveSubmission);
  const updateSubmission = useMutation(api.submissions.updateSubmission);
  const deleteSubmission = useMutation(api.submissions.deleteSubmission);
  
  const [guestList, setGuestList] = useState<GuestListEntry[]>([]);
  const [promoFiles, setPromoFiles] = useState<File[]>([]);
  const [promoDescription, setPromoDescription] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    residentNumber: '',
    preferDirectContact: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Effect to populate form with existing submission data
  useEffect(() => {
    if (timeslotData?.existingSubmission) {
      const submission = timeslotData.existingSubmission;
      setIsEditing(true);
      
      // Populate guest list
      const existingGuests = submission.guestList.map((guest, index) => ({
        id: `guest-${index}`,
        name: guest.name,
        phone: guest.phone || '',
      }));
      setGuestList(existingGuests);
      
      // Populate promo description
      setPromoDescription(submission.promoMaterials.description);
      
      // Populate payment info
      setPaymentInfo(submission.paymentInfo);
    }
  }, [timeslotData]);

  const addGuestEntry = () => {
    const newEntry: GuestListEntry = {
      id: `guest-${Date.now()}`,
      name: '',
      phone: '',
    };
    setGuestList([...guestList, newEntry]);
  };

  const updateGuestEntry = (id: string, field: keyof Omit<GuestListEntry, 'id'>, value: string) => {
    setGuestList(guestList.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const removeGuestEntry = (id: string) => {
    setGuestList(guestList.filter(entry => entry.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!timeslotData) {
        throw new Error('Timeslot data not available');
      }

      // Upload files to Convex storage
      const uploadedFiles = [];
      for (const file of promoFiles) {
        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 50MB.`);
        }

        // Generate upload URL with backend validation
        const uploadUrl = await generateUploadUrl({
          fileType: file.type,
          fileSize: file.size,
        });
        
        // Upload file
        const result = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        
        if (!result.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
        
        const { storageId } = await result.json();
        
        uploadedFiles.push({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          storageId: storageId as Id<"_storage">,
        });
      }

      // Prepare guest list (filter out empty entries)
      const validGuestList = guestList
        .filter(entry => entry.name.trim())
        .map(entry => ({
          name: entry.name.trim(),
          phone: entry.phone.trim() || undefined,
        }));

      // Save or update submission to database
      if (isEditing && timeslotData.existingSubmission) {
        // Update existing submission
        await updateSubmission({
          submissionId: timeslotData.existingSubmission._id,
          submissionToken,
          ...(uploadedFiles.length > 0 && { promoFiles: uploadedFiles }),
          promoDescription: promoDescription.trim(),
          guestList: validGuestList,
          paymentInfo,
        });
      } else {
        // Create new submission
        await saveSubmission({
          eventId: timeslotData.event._id,
          timeslotId: timeslotData._id,
          submissionToken,
          promoFiles: uploadedFiles,
          promoDescription: promoDescription.trim(),
          guestList: validGuestList,
          paymentInfo,
        });
      }
      
      setSubmissionComplete(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmission = async () => {
    if (!timeslotData?.existingSubmission) return;
    
    setIsSubmitting(true);
    try {
      await deleteSubmission({
        submissionId: timeslotData.existingSubmission._id,
        submissionToken,
      });
      
      // Reset form to creation mode
      setIsEditing(false);
      setGuestList([]);
      setPromoFiles([]);
      setPromoDescription('');
      setPaymentInfo({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        residentNumber: '',
        preferDirectContact: false,
      });
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (timeslotData === undefined) {
    return (
      <FullScreenLoading />
    );
  }

  if (timeslotData === null) {
    return (
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-error">Invalid Link</CardTitle>
            <CardDescription>
              This submission link is invalid or has expired.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { event, djName, djInstagram, startTime, endTime } = timeslotData;

  // Show success confirmation after submission
  if (submissionComplete) {
    return (
      <SubmissionCompleteMessage
        eventName={event.name}
        djName={djName}
        djInstagram={djInstagram}
        startTime={startTime}
        endTime={endTime}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-800 py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <Typography variant="h1" className="mb-2">
            {isEditing ? 'Edit Your Submission' : t('title')}
          </Typography>
          <Typography variant="body-lg" color="secondary">
            {isEditing ? 'Update your submission details below' : t('subtitle')}
          </Typography>
          {isEditing && (
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 border-red-400 hover:bg-red-400/10"
              >
                Delete Submission
              </Button>
            </div>
          )}
        </div>

        {/* Event & DJ Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('eventDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="h4">{event.name}</Typography>
                <Typography variant="body" color="secondary">{event.venue.name}</Typography>
                <Typography variant="body" color="secondary">{event.venue.address}</Typography>
                <Typography variant="body" color="secondary">{event.date}</Typography>
              </div>
              <div className="bg-neutral-700 p-4 rounded-lg">
                <Typography variant="h6" className="text-brand-primary mb-2">{t('yourTimeSlot')}</Typography>
                <Typography variant="body" className="text-brand-primary-light">{startTime} - {endTime}</Typography>
                <Typography variant="body" className="text-brand-primary-light">DJ: {djName}</Typography>
                <Typography variant="body" className="text-brand-primary-light">Instagram: {djInstagram}</Typography>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg">
              <Typography variant="h6" className="text-warning mb-2">{t('importantDeadlines')}</Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Typography variant="body" className="text-warning">
                  <span className="font-semibold">{t('guestList')}:</span> {event.deadlines.guestList}
                </Typography>
                <Typography variant="body" className="text-warning">
                  <span className="font-semibold">{t('promoMaterials')}:</span> {event.deadlines.promoMaterials}
                </Typography>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
          {/* Promo Materials */}
          <Card>
            <CardHeader>
              <CardTitle>{t('promoMaterials')}</CardTitle>
              <CardDescription>
                {t('promoMaterialsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dropzone
                src={promoFiles}
                onDrop={(files) => setPromoFiles(files)}
                maxFiles={10}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'video/*': ['.mp4', '.mov', '.avi'],
                  'application/pdf': ['.pdf']
                }}
              >
                <DropzoneContent>
                  <div className="space-y-2">
                    <Typography variant="h6">{t('selectedFiles')}</Typography>
                    <ul className="text-sm text-text-muted space-y-1">
                      {promoFiles.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-neutral-500 rounded-full mr-2"></span>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                    <p className="text-center text-muted-foreground text-xs mt-2">
                      {t('dropFilesHere')}
                    </p>
                  </div>
                </DropzoneContent>
                <DropzoneEmptyState>
                  {t('dropFilesHere')}
                </DropzoneEmptyState>
              </Dropzone>

              <div className="space-y-2">
                <Label htmlFor="promoDescription">{t('description')}</Label>
                <Textarea
                  id="promoDescription"
                  placeholder={t('descriptionPlaceholder')}
                  value={promoDescription}
                  onChange={(e) => setPromoDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Guest List */}
          <Card>
            <CardHeader>
              <CardTitle>{t('guestList')}</CardTitle>
              <CardDescription>
                {t('guestListDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guestList.map((guest, index) => (
                <div key={guest.id} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`guest-name-${guest.id}`}>{t('guestName', { number: index + 1 })}</Label>
                    <Input
                      id={`guest-name-${guest.id}`}
                      placeholder={t('guestNamePlaceholder')}
                      value={guest.name}
                      onChange={(e) => updateGuestEntry(guest.id, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`guest-phone-${guest.id}`}>{t('guestPhone')}</Label>
                    <Input
                      id={`guest-phone-${guest.id}`}
                      placeholder={t('guestPhonePlaceholder')}
                      value={guest.phone}
                      onChange={(e) => updateGuestEntry(guest.id, 'phone', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeGuestEntry(guest.id)}
                  >
                    {t('removeGuest')}
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addGuestEntry}
                className="w-full"
              >
                {t('addGuest')}
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('paymentInformation')}</CardTitle>
              <CardDescription>
                {t('paymentDescription', { amount: event.payment.amount.toLocaleString(), currency: event.payment.currency })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">{t('accountHolder')}</Label>
                  <Input
                    id="accountHolder"
                    placeholder={t('accountHolderPlaceholder')}
                    value={paymentInfo.accountHolder}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, accountHolder: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">{t('bankName')}</Label>
                  <Input
                    id="bankName"
                    placeholder={t('bankNamePlaceholder')}
                    value={paymentInfo.bankName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">{t('accountNumber')}</Label>
                <Input
                  id="accountNumber"
                  placeholder={t('accountNumberPlaceholder')}
                  value={paymentInfo.accountNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residentNumber">{t('residentNumber')}</Label>
                <Input
                  id="residentNumber"
                  placeholder={t('residentNumberPlaceholder')}
                  value={paymentInfo.residentNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, residentNumber: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="preferDirectContact"
                  checked={paymentInfo.preferDirectContact}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, preferDirectContact: e.target.checked })}
                  className="h-4 w-4 rounded border-neutral-600 bg-neutral-700/50 text-brand-primary focus:ring-[3px] focus:ring-brand-primary/20 focus:ring-offset-0"
                />
                <Label htmlFor="preferDirectContact" className="text-sm">
                  {t('preferDirectContact')}
                </Label>
              </div>

              <div className="bg-neutral-700/50 border border-neutral-600 p-4 rounded-lg">
                <Typography variant="body-sm" color="secondary">
                  {t('privacyNotice')}
                </Typography>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (isEditing ? 'Updating...' : t('submitting')) : 
                (isEditing ? 'Update Submission' : t('submitMaterials'))
              }
            </Button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-red-400">Delete Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <Typography variant="body" color="secondary" className="mb-4">
                  Are you sure you want to delete your submission? This action cannot be undone.
                  You'll be able to submit new materials using the same link.
                </Typography>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteSubmission}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}