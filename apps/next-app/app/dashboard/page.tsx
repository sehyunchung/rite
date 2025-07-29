import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // Redirect to localized version
  redirect('/en/dashboard');
}