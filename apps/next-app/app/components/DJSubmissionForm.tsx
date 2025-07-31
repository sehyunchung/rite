'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Button } from '@rite/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rite/ui';
import { Input, Label, Textarea } from '@rite/ui';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@rite/ui';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { useTranslations } from 'next-intl';
import { FullScreenLoading, Typography } from '@rite/ui';

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

        // Generate upload URL
        const uploadUrl = await generateUploadUrl();
        
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

      // Save submission to database
      await saveSubmission({
        eventId: timeslotData.event._id,
        timeslotId: timeslotData._id,
        submissionToken,
        promoFiles: uploadedFiles,
        promoDescription: promoDescription.trim(),
        guestList: validGuestList,
        paymentInfo,
      });
      
      setSubmissionComplete(true);
    } catch (error) {
      console.error('Submission failed:', error);
      alert(`Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      <div className="min-h-screen bg-neutral-800 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-success">Submission Complete!</CardTitle>
            <CardDescription>
              Your materials have been successfully submitted for {event.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-neutral-700 p-4 rounded-lg text-left">
              <Typography variant="h6" className="text-success mb-2">What happens next?</Typography>
              <ul className="text-sm text-neutral-300 space-y-1">
                <li>• The organizer will review your submission</li>
                <li>• You&apos;ll receive confirmation via Instagram DM</li>
                <li>• Payment will be processed after the event</li>
              </ul>
            </div>
            <div className="text-sm space-y-1">
              <Typography variant="body-sm"><span className="font-medium">Event:</span> {event.name}</Typography>
              <Typography variant="body-sm"><span className="font-medium">Your Slot:</span> {startTime} - {endTime}</Typography>
              <Typography variant="body-sm"><span className="font-medium">DJ:</span> {djName} ({djInstagram})</Typography>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-800 py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <Typography variant="h1" className="mb-2">{t('title')}</Typography>
          <Typography variant="body-lg" color="secondary">{t('subtitle')}</Typography>
        </div>

        {/* Event & DJ Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('eventDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{event.name}</h3>
                <p className="text-gray-600">{event.venue.name}</p>
                <p className="text-gray-600">{event.venue.address}</p>
                <p className="text-gray-600">{event.date}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">{t('yourTimeSlot')}</h4>
                <p className="text-blue-600">{startTime} - {endTime}</p>
                <p className="text-blue-600">DJ: {djName}</p>
                <p className="text-blue-600">Instagram: {djInstagram}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">{t('importantDeadlines')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <p className="text-yellow-700">
                  <strong>{t('guestList')}:</strong> {event.deadlines.guestList}
                </p>
                <p className="text-yellow-700">
                  <strong>{t('promoMaterials')}:</strong> {event.deadlines.promoMaterials}
                </p>
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
                    <h4 className="font-medium">{t('selectedFiles')}</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {promoFiles.map((file, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
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
                />
                <Label htmlFor="preferDirectContact" className="text-sm">
                  {t('preferDirectContact')}
                </Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {t('privacyNotice')}
                </p>
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
              {isSubmitting ? t('submitting') : t('submitMaterials')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}