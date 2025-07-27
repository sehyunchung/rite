import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dropzone } from '@/components/ui/kibo-ui/dropzone';
import { Id } from '@rite/backend/_generated/dataModel';

interface DJSubmissionFormProps {
  submissionToken: string;
}

interface GuestListEntry {
  id: string;
  name: string;
  phone: string;
}

export function DJSubmissionForm({ submissionToken }: DJSubmissionFormProps) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading submission form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (timeslotData === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Link</CardTitle>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-green-600">Submission Complete!</CardTitle>
            <CardDescription>
              Your materials have been successfully submitted for {event.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-green-800 mb-2">What happens next?</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• The organizer will review your submission</li>
                <li>• You'll receive confirmation via Instagram DM</li>
                <li>• Payment will be processed after the event</li>
              </ul>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Event:</strong> {event.name}</p>
              <p><strong>Your Slot:</strong> {startTime} - {endTime}</p>
              <p><strong>DJ:</strong> {djName} ({djInstagram})</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">DJ Submission Form</h1>
          <p className="text-gray-600">Submit your materials for the upcoming event</p>
        </div>

        {/* Event & DJ Info */}
        <Card>
          <CardHeader>
            <CardTitle>Event Details</CardTitle>
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
                <h4 className="font-semibold text-blue-800">Your Time Slot</h4>
                <p className="text-blue-600">{startTime} - {endTime}</p>
                <p className="text-blue-600">DJ: {djName}</p>
                <p className="text-blue-600">Instagram: {djInstagram}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Important Deadlines</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <p className="text-yellow-700">
                  <strong>Guest List:</strong> {event.deadlines.guestList}
                </p>
                <p className="text-yellow-700">
                  <strong>Promo Materials:</strong> {event.deadlines.promoMaterials}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-8">
          {/* Promo Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Promo Materials</CardTitle>
              <CardDescription>
                Upload your promotional materials (images, videos, flyers)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Dropzone
                onDrop={(files) => setPromoFiles(files)}
                maxFiles={10}
                accept={{
                  'image/*': ['.png', '.jpg', '.jpeg'],
                  'video/*': ['.mp4', '.mov', '.avi'],
                  'application/pdf': ['.pdf']
                }}
              >
                Drop your promo materials here or click to browse
              </Dropzone>
              
              {promoFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Selected Files:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {promoFiles.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="promoDescription">Description (Optional)</Label>
                <Textarea
                  id="promoDescription"
                  placeholder="Brief description of your promo materials..."
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
              <CardTitle>Guest List</CardTitle>
              <CardDescription>
                Add your guests for the event
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {guestList.map((guest, index) => (
                <div key={guest.id} className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`guest-name-${guest.id}`}>Guest {index + 1} Name</Label>
                    <Input
                      id={`guest-name-${guest.id}`}
                      placeholder="Full name"
                      value={guest.name}
                      onChange={(e) => updateGuestEntry(guest.id, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`guest-phone-${guest.id}`}>Phone (Optional)</Label>
                    <Input
                      id={`guest-phone-${guest.id}`}
                      placeholder="010-1234-5678"
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
                    Remove
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addGuestEntry}
                className="w-full"
              >
                + Add Guest
              </Button>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Your payment details for the event (Amount: {event.payment.amount.toLocaleString()} {event.payment.currency})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name</Label>
                  <Input
                    id="accountHolder"
                    placeholder="김디제이"
                    value={paymentInfo.accountHolder}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, accountHolder: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    placeholder="국민은행"
                    value={paymentInfo.bankName}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, bankName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="123456-78-901234"
                  value={paymentInfo.accountNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="residentNumber">Resident Registration Number</Label>
                <Input
                  id="residentNumber"
                  placeholder="901234-1******"
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
                  I prefer direct contact for payment arrangements
                </Label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Privacy Notice:</strong> Your payment information will be encrypted and stored securely. 
                  It will only be used for event payment processing and will not be shared with third parties.
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
              {isSubmitting ? 'Submitting...' : 'Submit Materials'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}