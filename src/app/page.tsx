'use client';

import Link from 'next/link';
import {
  ShieldCheckIcon,
  ChartBarIcon,
  ShareIcon,
  SparklesIcon,
  CreditCardIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

export default function LandingPage() {
  const mainFeatures = [
    {
      name: 'Autenticación Empresarial',
      description: 'Sistema multi-tenant con autenticación OAuth para Google, Facebook, TikTok y YouTube. Gestiona múltiples empresas desde una sola plataforma.',
      icon: ShieldCheckIcon,
      color: 'from-blue-500 to-cyan-500',
      benefits: [
        'Login social en 1 clic',
        'Multi-tenant seguro',
        'Roles y permisos personalizables',
        'JWT tokens seguros'
      ]
    },
    {
      name: 'Campañas Inteligentes',
      description: 'Crea, programa y analiza campañas de marketing multi-canal con métricas en tiempo real y análisis predictivo.',
      icon: ChartBarIcon,
      color: 'from-purple-500 to-pink-500',
      benefits: [
        'Dashboard analítico en tiempo real',
        'Métricas de conversión y ROI',
        'A/B testing automático',
        'Reportes personalizados'
      ]
    },
    {
      name: 'Gestión Social',
      description: 'Conecta todas tus redes sociales. Publica, programa contenido y analiza el engagement desde un solo lugar.',
      icon: ShareIcon,
      color: 'from-green-500 to-emerald-500',
      benefits: [
        'Publicación multi-plataforma',
        'Calendario de contenido',
        'Programación automática',
        'Análisis de engagement'
      ]
    },
    {
      name: 'IA Generativa',
      description: 'Genera contenido de marketing profesional con GPT-4 y crea imágenes impactantes con DALL-E 3.',
      icon: SparklesIcon,
      color: 'from-orange-500 to-red-500',
      benefits: [
        'Generación de copy con GPT-4',
        'Imágenes con DALL-E 3',
        'Chatbot inteligente',
        'Asistente de marketing 24/7'
      ]
    },
    {
      name: 'Pagos y Facturación',
      description: 'Sistema completo de facturación con Stripe. Gestiona suscripciones, planes y pagos recurrentes automáticos.',
      icon: CreditCardIcon,
      color: 'from-indigo-500 to-blue-500',
      benefits: [
        'Integración con Stripe',
        'Planes de suscripción',
        'Facturación automática',
        'Webhooks en tiempo real'
      ]
    }
  ];

  const platformFeatures = [
    {
      icon: BoltIcon,
      title: 'Arquitectura de Alto Rendimiento',
      description: 'Microservicios con Quarkus para máxima velocidad y escalabilidad'
    },
    {
      icon: UsersIcon,
      title: 'Multi-Tenant Native',
      description: 'Gestiona múltiples empresas con aislamiento completo de datos'
    },
    {
      icon: GlobeAltIcon,
      title: 'API-First',
      description: 'REST APIs documentadas con OpenAPI y Swagger UI'
    },
    {
      icon: ClockIcon,
      title: 'Tiempo Real',
      description: 'Métricas y notificaciones instantáneas con Kafka y Redis'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
              Marketing Platform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mt-2">
                Potenciado por IA
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Automatiza tu marketing, gestiona todas tus redes sociales, genera contenido con IA
              y analiza resultados en tiempo real. Todo desde una sola plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Comenzar gratis
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 rounded-lg bg-white/10 backdrop-blur-sm text-white font-semibold hover:bg-white/20 transition-all duration-200 border border-white/20"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Todo lo que necesitas para hacer crecer tu negocio
          </h2>
          <p className="text-xl text-gray-400">
            Herramientas profesionales de marketing en una plataforma integrada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mainFeatures.map((feature) => (
            <div
              key={feature.name}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              <div className="relative">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {feature.name}
                </h3>

                <p className="text-gray-400 mb-6">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-start text-sm text-gray-300">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Arquitectura de Clase Mundial
          </h2>
          <p className="text-xl text-gray-400">
            Construida con las mejores tecnologías
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {platformFeatures.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Stack Tecnológico
            </h2>
            <p className="text-xl text-gray-400">
              Tecnologías enterprise probadas en producción
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">Quarkus</div>
              <div className="text-sm text-gray-400">Java Microservices</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-cyan-400 mb-2">Next.js</div>
              <div className="text-sm text-gray-400">React Framework</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-blue-400 mb-2">PostgreSQL</div>
              <div className="text-sm text-gray-400">Base de Datos</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-red-400 mb-2">Redis</div>
              <div className="text-sm text-gray-400">Cache & Sessions</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-purple-400 mb-2">Kafka</div>
              <div className="text-sm text-gray-400">Event Streaming</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-green-400 mb-2">GCP</div>
              <div className="text-sm text-gray-400">Cloud Storage</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-pink-400 mb-2">OpenAI</div>
              <div className="text-sm text-gray-400">GPT-4 & DALL-E</div>
            </div>
            <div className="p-4">
              <div className="text-3xl font-bold text-indigo-400 mb-2">Stripe</div>
              <div className="text-sm text-gray-400">Payments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
              5
            </div>
            <div className="text-xl text-white font-semibold mb-1">Microservicios</div>
            <div className="text-gray-400">Arquitectura escalable</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              4+
            </div>
            <div className="text-xl text-white font-semibold mb-1">Plataformas Sociales</div>
            <div className="text-gray-400">Google, Meta, TikTok, YouTube</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
              24/7
            </div>
            <div className="text-xl text-white font-semibold mb-1">IA Disponible</div>
            <div className="text-gray-400">Asistente siempre activo</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          ¿Listo para transformar tu marketing?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Únete a la plataforma de marketing más completa con inteligencia artificial
        </p>
        <Link
          href="/register"
          className="inline-flex items-center px-10 py-5 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white text-lg font-bold hover:shadow-2xl transition-all duration-200 transform hover:scale-105"
        >
          Comenzar ahora gratis
          <ArrowRightIcon className="ml-3 h-6 w-6" />
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Marketing Platform. Construido con Quarkus, Next.js, OpenAI & ❤️
          </p>
        </div>
      </div>
    </div>
  );
}
