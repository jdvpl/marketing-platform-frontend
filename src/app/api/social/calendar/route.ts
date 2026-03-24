import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brandId');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!brandId) {
      return NextResponse.json({ error: 'brandId requerido' }, { status: 400 });
    }

    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end) params.set('end', end);

    const response = await fetch(
      `${API_GATEWAY_URL}/v1/scheduler/brand/${brandId}?${params}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al cargar calendario' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error en GET /api/social/calendar:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
