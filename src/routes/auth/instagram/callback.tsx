import { createFileRoute } from '@tanstack/react-router'
import { InstagramCallback } from '../../../pages/auth/InstagramCallback'

export const Route = createFileRoute('/auth/instagram/callback')({
  component: InstagramCallback,
})