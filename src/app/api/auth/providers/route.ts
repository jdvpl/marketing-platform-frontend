import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/v1/auth/me/providers`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });

    const data = await response.json().catch(() => []);
    if (!response.ok) {
      return NextResponse.json({ error: 'Error obteniendo providers' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
