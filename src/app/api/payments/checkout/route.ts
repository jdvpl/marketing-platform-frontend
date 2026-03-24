import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const body = await request.json();

    const response = await fetch(`${GATEWAY_URL}/v1/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al crear sesión de pago' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error de red' }, { status: 500 });
  }
}
