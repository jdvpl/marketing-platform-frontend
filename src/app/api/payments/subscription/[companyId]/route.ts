import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const response = await fetch(`${GATEWAY_URL}/v1/payments/subscription/${companyId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      // Return free plan fallback
      return NextResponse.json({
        companyId,
        planName: 'Free',
        planId: 'free',
        status: 'INACTIVE',
      });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error al cargar suscripción' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const url = new URL(request.url);
    const isCancel = url.pathname.endsWith('/cancel');
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const endpoint = isCancel
      ? `${GATEWAY_URL}/v1/payments/subscription/${companyId}/cancel`
      : `${GATEWAY_URL}/v1/payments/subscription/${companyId}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error de red' }, { status: 500 });
  }
}
