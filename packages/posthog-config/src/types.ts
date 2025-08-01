import { PostHogConfig } from 'posthog-js'

export interface RitePostHogConfig extends Partial<PostHogConfig> {
  platform: 'web' | 'mobile'
  environment: 'development' | 'staging' | 'production'
}

export interface PostHogUser {
  id: string
  email?: string
  name?: string
  avatar_url?: string
  signup_date: string
  plan_type: 'free' | 'pro' | 'enterprise'
  instagram_connected: boolean
  events_created: number
  submissions_made: number
}

export interface PostHogEventContext {
  page_title?: string
  page_url?: string
  referrer?: string
  locale: string
  user_agent?: string
  screen_resolution?: string
}

export interface BaseEventProperties {
  platform: 'web' | 'mobile'
  user_id?: string
  session_id?: string
  locale?: string
}

export interface EventCreationProperties extends BaseEventProperties {
  event_type: string
  has_instagram_connection: boolean
  timeslots_count: number
}

export interface DJSubmissionProperties extends BaseEventProperties {
  event_id: string
  timeslot_id: string
  submission_type: 'audio' | 'video' | 'mixed'
  file_size_mb?: number
}

export interface AuthenticationProperties extends BaseEventProperties {
  provider: 'google' | 'instagram' | 'apple'
  is_new_user: boolean
  signup_source?: string
}