import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    const response = await fetch(`${GATEWAY_URL}/api/v1/payments/plans`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error || 'Error al cargar planes' }, { status: response.status });
    }

    // Map backend response to frontend Plan interface
    const FEATURES_MAP: Record<string, string[]> = {
      FREE: ['1 marca', '3 publicaciones/día', '5 generaciones IA/mes', 'Analíticas básicas', 'Soporte por email'],
      PRO: ['5 marcas', '50 publicaciones/día', '100 generaciones IA/mes', 'Analíticas avanzadas', 'Programación automática', 'Soporte prioritario'],
      ENTERPRISE: ['Marcas ilimitadas', 'Publicaciones ilimitadas', 'IA ilimitada', 'Analíticas premium + Revenue', 'API access', 'Gestor de cuenta dedicado', 'SLA 99.9%'],
    };

    const plans = (Array.isArray(data) ? data : []).map((plan: Record<string, unknown>) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.priceMonthlyUsd ?? 0,
      yearlyPrice: plan.priceYearlyUsd ?? 0,
      currency: 'usd',
      features: FEATURES_MAP[plan.type as string] || [],
      stripePriceIdMonthly: plan.stripePriceIdMonthly || null,
      stripePriceIdYearly: plan.stripePriceIdYearly || null,
      highlighted: plan.type === 'PRO',
    }));

    return NextResponse.json(plans);
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
