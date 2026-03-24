import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const qs = new URLSearchParams();
    const status = searchParams.get('status');
    if (status) qs.set('status', status);

    const queryString = qs.toString() ? `?${qs.toString()}` : '';
    const response = await fetch(
      `${API_GATEWAY_URL}/v1/ab-tests/brand/${brandId}${queryString}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al cargar tests A/B' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
