import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function CreateEventPage() {
  // Redirect to localized version
  redirect('/en/events/create');
}