import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ videoId: string; subtitleId: string }> }
) {
  try {
    const { videoId, subtitleId } = await params;
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const response = await fetch(
      `${API_GATEWAY_URL}/v1/videos/${videoId}/subtitles/${subtitleId}/burn`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al quemar subtitulos' }, { status: response.status });
    }
    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    console.error('Error en POST /api/videos/[videoId]/subtitles/[subtitleId]/burn:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
