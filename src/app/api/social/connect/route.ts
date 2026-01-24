import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { provider, brandId } = await request.json();

    if (!provider || !brandId) {
      return NextResponse.json(
        { error: 'provider y brandId son requeridos' },
        { status: 400 }
      );
    }

    // Construir URL de OAuth basado en el proveedor
    const providerLower = provider.toLowerCase();
    const oauthUrl = `${API_GATEWAY_URL}/v1/social/oauth/${providerLower}/connect?brandId=${brandId}`;

    // Retornar la URL para que el cliente haga el redirect
    return NextResponse.json({ oauthUrl });
  } catch (error) {
    console.error('Error en /api/social/connect:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
