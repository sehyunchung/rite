'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id, Doc } from '@rite/backend/convex/_generated/dataModel';
import { Card, CardContent, CardHeader, CardTitle } from '@rite/ui';
import { Badge } from '@rite/ui';
import { Button } from '@rite/ui';
import { FullScreenLoading } from '@rite/ui';
import { Typography } from '@rite/ui';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MobileLayout } from '@/components/MobileLayout';
import { ExportGuestList } from '@/components/ExportGuestList';
import { ArrowLeft, User, Instagram, Clock, FileText, Users } from 'lucide-react';
import { isValidConvexId } from '@/lib/utils';

interface SubmissionsClientProps {
  eventId: string;
  userId: string;
  locale: string;
}

export function SubmissionsClient({ eventId, userId, locale }: SubmissionsClientProps) {
  const router = useRouter();
  const t = useTranslations('events.submissions');

  // Validate IDs before using them
  const isValidEventId = isValidConvexId(eventId);
  const isValidUserId = isValidConvexId(userId);

  const event = useQuery(
    api.events.getEvent,
    isValidEventId && isValidUserId ? { 
      eventId: eventId as Id<"events">,
      userId: userId as Id<"users">
    } : "skip"
  );

  // Get submissions for this event - must be called before any conditional returns
  const submissions = useQuery(
    api.submissions.getSubmissionsByEvent,
    isValidEventId && isValidUserId ? { 
      eventId: eventId as Id<"events">,
      userId: userId as Id<"users">
    } : "skip"
  );

  // Handle invalid IDs
  if (!isValidEventId || !isValidUserId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">{t('invalidRequest')}</Typography>
          <Typography variant="body" color="secondary" className="mb-4">
            {t('invalidRequestMessage') || 'The request contains invalid parameters'}
          </Typography>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            {t('backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  if (event === undefined || submissions === undefined) {
    return <FullScreenLoading />;
  }

  if (event === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h2" className="mb-2">{t('notFound')}</Typography>
          <Typography variant="body" color="secondary" className="mb-4">
            {t('notFoundMessage')}
          </Typography>
          <Button onClick={() => router.push(`/${locale}/dashboard`)}>
            {t('backToDashboard')}
          </Button>
        </div>
      </div>
    );
  }

  const submissionCount = submissions?.length || 0;
  const totalSlots = event.timeslots?.length || 0;

  return (
    <MobileLayout userId={userId} fallbackDisplayName="User">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button - Desktop only */}
          <div className="hidden md:block mb-4">
            <Button variant="outline" onClick={() => router.push(`/${locale}/events/${eventId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToEvent')}
            </Button>
          </div>

          {/* Header */}
          <div className="mb-6 md:mb-8">
            <Typography variant="h1" className="text-2xl md:text-3xl mb-2">
              {t('title')}: {event.name}
            </Typography>
            <Typography variant="body-lg" color="secondary" className="mb-4">
              {t('subtitle')}
            </Typography>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{submissionCount} / {totalSlots} {t('submitted')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{event.date}</span>
              </div>
            </div>
          </div>

          {/* Export Guest List */}
          <div className="mb-8">
            <ExportGuestList eventId={eventId} eventName={event.name} />
          </div>

          {/* Submissions List */}
          <div className="space-y-6">
            {event.timeslots && event.timeslots.length > 0 ? (
              event.timeslots.map((slot: Doc<"timeslots">) => {
                const submission = submissions?.find(sub => sub.timeslotId === slot._id);
                
                return (
                  <Card key={slot._id} className="w-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-3">
                          <User className="w-5 h-5" />
                          <span>{slot.djName}</span>
                          <Badge variant={submission ? 'default' : 'outline'}>
                            {submission ? t('status.submitted') : t('status.pending')}
                          </Badge>
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        {/* DJ Info */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Instagram className="w-4 h-4" />
                            <span className="text-brand-primary">{slot.djInstagram}</span>
                          </div>
                          
                          {submission && (
                            <>
                              {/* Guest List */}
                              {submission.guestList && submission.guestList.length > 0 && (
                                <div>
                                  <p className="font-medium text-sm mb-2">{t('guestList')} ({submission.guestList.length})</p>
                                  <div className="space-y-1">
                                    {submission.guestList.map((guest, index) => (
                                      <div key={index} className="text-sm text-muted-foreground">
                                        {guest.name} {guest.phone && `• ${guest.phone}`}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Submission Description */}
                              {submission.promoMaterials.description && (
                                <div>
                                  <p className="font-medium text-sm mb-1">{t('description')}</p>
                                  <p className="text-sm text-muted-foreground">{submission.promoMaterials.description}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        {/* Files and Actions */}
                        <div className="space-y-3">
                          {submission && submission.promoMaterials.files && submission.promoMaterials.files.length > 0 && (
                            <div>
                              <p className="font-medium text-sm mb-2">{t('promoFiles')} ({submission.promoMaterials.files.length})</p>
                              <div className="space-y-1">
                                {submission.promoMaterials.files.map((file, index) => (
                                  <div key={index} className="flex items-center space-x-2 text-sm">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-muted-foreground truncate">{file.fileName}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {submission && (
                            <div className="text-xs text-muted-foreground">
                              {t('submittedOn')}: {new Date(submission._creationTime).toLocaleDateString()}
                            </div>
                          )}

                          {!submission && (
                            <div className="text-sm text-muted-foreground">
                              {t('awaitingSubmission')}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Typography variant="body" color="secondary">
                    {t('noTimeslots')}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}