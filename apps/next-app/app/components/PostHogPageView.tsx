'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
export default function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()
  
  // Extract locale from pathname instead of using useLocale hook
  const locale = pathname?.split('/')[1] || 'en'

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      
      // Extract platform section from pathname
      const pathSegments = pathname.split('/').filter(Boolean)
      const platformSection = pathSegments.length > 1 ? pathSegments[1] : 'home'
      
      posthog.capture('$pageview', {
        $current_url: url,
        locale: locale,
        platform: 'web',
        platform_section: platformSection,
        path_depth: pathSegments.length,
      })
    }
  }, [pathname, searchParams, posthog, locale])

  return null
}