import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import DashboardClient from '@/components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const store = await cookies();
  if (!verifySessionToken(store.get(SESSION_COOKIE)?.value)) redirect('/login');
  return <DashboardClient />;
}
