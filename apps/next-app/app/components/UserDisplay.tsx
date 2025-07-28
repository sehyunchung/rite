'use client';

import { useQuery } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';

interface UserDisplayProps {
  userId: string;
  fallbackName: string;
}

export function UserDisplay({ userId, fallbackName }: UserDisplayProps) {
  // Only query if we have a valid userId
  const instagramConnection = useQuery(
    api.instagram.getInstagramConnection, 
    userId ? { userId: userId as Id<"users"> } : "skip"
  );

  const displayName = instagramConnection?.username 
    ? `@${instagramConnection.username}`
    : fallbackName;

  return (
    <span className="text-sm text-gray-700">
      Welcome, {displayName}
    </span>
  );
}