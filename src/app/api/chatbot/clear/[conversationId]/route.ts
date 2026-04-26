import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { conversationId } = await params;

    const response = await fetch(
      `${API_GATEWAY_URL}/api/v1/chatbot/clear/${conversationId}`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return NextResponse.json({ error: data.error || 'Error limpiando conversación' }, { status: response.status });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
