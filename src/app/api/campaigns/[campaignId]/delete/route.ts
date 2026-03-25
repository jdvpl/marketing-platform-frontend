import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const brandId = request.nextUrl.searchParams.get('brandId');
    const response = await fetch(`${API_GATEWAY_URL}/v1/campaigns/${campaignId}/delete?brandId=${brandId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json({ error: data.error || 'Error' }, { status: response.status });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Campaign delete error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
