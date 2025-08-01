export class PostHogPrivacyManager {
  private static CONSENT_KEY = 'rite_posthog_consent'
  
  static hasConsent(): boolean {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(this.CONSENT_KEY) === 'granted'
  }
  
  static grantConsent(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CONSENT_KEY, 'granted')
    
    // Initialize PostHog after consent
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.opt_in_capturing()
    }
  }
  
  static revokeConsent(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.CONSENT_KEY, 'denied')
    
    // Opt out of PostHog
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.opt_out_capturing()
      (window as any).posthog.reset() // Clear stored data
    }
  }
  
  static requestDataDeletion(userId: string): void {
    // Implement data deletion request
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture('$delete_person', { distinct_id: userId })
    }
  }
  
  static shouldLoadPostHog(): boolean {
    // GDPR compliant: Only load PostHog with explicit consent or in development
    const isDev = process.env.NODE_ENV === 'development'
    const hasExplicitConsent = this.hasConsent()
    
    // In development: allow without consent for testing
    // In production: require explicit consent
    return isDev || hasExplicitConsent
  }
}