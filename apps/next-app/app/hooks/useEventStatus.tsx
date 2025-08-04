import { useQuery, useMutation } from 'convex/react';
import { api } from '@rite/backend/convex/_generated/api';
import { Id } from '@rite/backend/convex/_generated/dataModel';
import { useCallback, useState } from 'react';
import { EventPhaseInfo, getAvailableActions, type EventAction } from '@rite/backend/convex/eventStatus';
import { isValidConvexId } from '@/lib/utils';

interface UseEventStatusOptions {
  eventId: string;
  userId?: string;
}

export function useEventStatus({ eventId, userId }: UseEventStatusOptions) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get event with capabilities
  const event = useQuery(
    api.events.getEventWithCapabilities,
    eventId && isValidConvexId(eventId) && (!userId || isValidConvexId(userId)) ? {
      eventId: eventId as Id<"events">,
      userId: userId ? userId as Id<"users"> : undefined,
    } : "skip"
  );
  
  // Mutation for phase transitions
  const transitionPhase = useMutation(api.events.transitionEventPhase);
  
  // Get phase info
  const phaseInfo = event?.phase ? EventPhaseInfo[event.phase] : null;
  
  // Get available actions
  const availableActions = event ? getAvailableActions(event.phase, event.capabilities) : [];
  
  // Perform action callback
  const performAction = useCallback(async (action: EventAction) => {
    if (!userId || !eventId) return;
    
    setIsTransitioning(true);
    setError(null);
    
    try {
      // Map action to phase transition
      let toPhase: string | null = null;
      
      switch (action.action) {
        case 'PUBLISH_EVENT':
          toPhase = 'planning';
          break;
        case 'FINALIZE_EVENT':
          toPhase = 'finalized';
          break;
        case 'START_EVENT_DAY':
          toPhase = 'day_of';
          break;
        case 'COMPLETE_EVENT':
          toPhase = 'completed';
          break;
        case 'CANCEL_EVENT':
          toPhase = 'cancelled';
          break;
      }
      
      if (toPhase) {
        await transitionPhase({
          eventId: eventId as Id<"events">,
          userId: userId as Id<"users">,
          toPhase,
          reason: action.confirmMessage,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Phase transition error:', err);
    } finally {
      setIsTransitioning(false);
    }
  }, [eventId, userId, transitionPhase]);
  
  return {
    event,
    phase: event?.phase,
    phaseInfo,
    capabilities: event?.capabilities,
    availableActions,
    performAction,
    isTransitioning,
    error,
    isLoading: event === undefined,
  };
}