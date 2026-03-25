import { cookies } from 'next/headers';
import { COOKIE_NAMES } from '@/lib/constants';

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
}
