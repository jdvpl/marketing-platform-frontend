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

    const response = await fetch(`${GATEWAY_URL}/v1/payments/history/${companyId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
