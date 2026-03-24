import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const response = await fetch(`${GATEWAY_URL}/v1/payments/plans`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al cargar planes' }, { status: response.status });
    }
    return NextResponse.json(data);
  } catch {
    // Return static fallback plans when backend is unavailable
    return NextResponse.json([
      {
        id: 'starter',
        name: 'Starter',
        description: 'Perfecto para empezar',
        monthlyPrice: 29,
        yearlyPrice: 278,
        currency: 'usd',
        features: ['3 marcas', '5 redes sociales', '50 publicaciones/mes', 'Analíticas básicas', 'Soporte por email'],
        stripePriceIdMonthly: 'price_starter_monthly',
        stripePriceIdYearly: 'price_starter_yearly',
      },
      {
        id: 'growth',
        name: 'Growth',
        description: 'Para equipos en crecimiento',
        monthlyPrice: 79,
        yearlyPrice: 758,
        currency: 'usd',
        features: ['10 marcas', '20 redes sociales', 'Publicaciones ilimitadas', 'Analíticas avanzadas', 'IA generativa', 'Programación automática', 'Soporte prioritario'],
        stripePriceIdMonthly: 'price_growth_monthly',
        stripePriceIdYearly: 'price_growth_yearly',
        highlighted: true,
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Para grandes organizaciones',
        monthlyPrice: 199,
        yearlyPrice: 1910,
        currency: 'usd',
        features: ['Marcas ilimitadas', 'Redes ilimitadas', 'Publicaciones ilimitadas', 'Analíticas premium + Revenue', 'IA avanzada + video scripts', 'API access', 'Gestor de cuenta dedicado', 'SLA 99.9%'],
        stripePriceIdMonthly: 'price_enterprise_monthly',
        stripePriceIdYearly: 'price_enterprise_yearly',
      },
    ]);
  }
}
