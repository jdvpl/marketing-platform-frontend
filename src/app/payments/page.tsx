'use client';

import { CreditCardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PaymentsPage() {
  const plans = [
    {
      name: 'Básico',
      price: 29,
      period: 'mes',
      features: [
        '1 marca',
        'Hasta 3 cuentas sociales',
        '10 publicaciones programadas/mes',
        'Analytics básico',
        'Soporte por email',
      ],
      color: 'from-blue-500 to-cyan-500',
      popular: false,
    },
    {
      name: 'Profesional',
      price: 79,
      period: 'mes',
      features: [
        '5 marcas',
        'Hasta 15 cuentas sociales',
        'Publicaciones ilimitadas',
        'Analytics avanzado',
        'Content AI incluido',
        'Soporte prioritario',
      ],
      color: 'from-purple-500 to-pink-500',
      popular: true,
    },
    {
      name: 'Empresarial',
      price: 199,
      period: 'mes',
      features: [
        'Marcas ilimitadas',
        'Cuentas sociales ilimitadas',
        'Todo ilimitado',
        'Analytics empresarial',
        'Content AI premium',
        'Soporte 24/7',
        'Gestor de cuenta dedicado',
      ],
      color: 'from-orange-500 to-red-500',
      popular: false,
    },
  ];

  const handleSubscribe = (planName: string) => {
    alert(`Redirigiendo a checkout para plan ${planName}`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Planes y Precios
          </h1>
          <p className="text-xl text-gray-600">
            Elige el plan perfecto para tu negocio
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden ${
                plan.popular ? 'ring-4 ring-purple-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 text-sm font-semibold">
                  Más Popular
                </div>
              )}

              <div className="p-8">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${plan.color} mb-6`}>
                  <CreditCardIcon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Comenzar
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-600">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se reflejarán en tu próxima factura.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Ofrecen descuentos por pago anual?
              </h3>
              <p className="text-gray-600">
                Sí, ofrecemos un 20% de descuento en todos los planes con facturación anual.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¿Hay período de prueba gratuito?
              </h3>
              <p className="text-gray-600">
                Ofrecemos 14 días de prueba gratuita en todos los planes. No se requiere tarjeta de crédito.
              </p>
            </div>
          </div>
        </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
