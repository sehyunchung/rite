'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { PostHogPrivacyManager } from '@rite/posthog-config'
import { initPostHog } from '../lib/posthog-client'

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [loading, setLoading] = useState(true)
  const t = useTranslations('consentBanner')

  useEffect(() => {
    // Check if we should show the banner
    const hasConsent = PostHogPrivacyManager.hasConsent()
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Show banner if we're in production and don't have consent yet
    setShowBanner(isProduction && !hasConsent)
    setLoading(false)
  }, [])

  const handleAccept = () => {
    PostHogPrivacyManager.grantConsent()
    setShowBanner(false)
    
    // Initialize PostHog after consent
    initPostHog()
  }

  const handleDecline = () => {
    PostHogPrivacyManager.revokeConsent()
    setShowBanner(false)
  }

  if (loading || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-800/95 backdrop-blur-sm border-t border-neutral-700 p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-neutral-300 leading-relaxed">
            {t('message')}
          </p>
        </div>
        
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={handleDecline} 
            className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-300 transition-colors border border-neutral-600 rounded-md hover:border-neutral-500"
          >
            {t('decline')}
          </button>
          <button 
            onClick={handleAccept} 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-medium transition-colors"
          >
            {t('accept')}
          </button>
        </div>
      </div>
    </div>
  )
}