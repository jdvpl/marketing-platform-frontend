'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ChartBarIcon,
  ShareIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckIcon,
  FilmIcon,
  CalendarDaysIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  CreditCardIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: SparklesIcon,
    title: 'IA Generativa',
    description: 'Genera textos, imagenes y hashtags con GPT-4 y DALL-E 3. Tu asistente de marketing 24/7.',
  },
  {
    icon: ShareIcon,
    title: 'Redes Sociales',
    description: 'Conecta Meta, TikTok y YouTube. Publica y programa contenido desde un solo lugar.',
  },
  {
    icon: FilmIcon,
    title: 'Editor de Video',
    description: 'Recorta, aplica filtros, agrega textos y ajusta aspect ratio. Procesamiento con FFmpeg.',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics en Tiempo Real',
    description: 'Metricas de engagement, vistas, likes y ROI de todas tus campanas en un dashboard.',
  },
  {
    icon: CalendarDaysIcon,
    title: 'Calendario de Contenido',
    description: 'Planifica y visualiza tus publicaciones en vista mensual o semanal.',
  },
  {
    icon: HashtagIcon,
    title: 'Hashtag Trends',
    description: 'Descubre los hashtags con mejor rendimiento y tendencias por plataforma.',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Gestion de Comentarios',
    description: 'Responde y modera comentarios de todas tus redes en una sola bandeja.',
  },
  {
    icon: BeakerIcon,
    title: 'A/B Testing',
    description: 'Compara variantes de contenido y determina automaticamente el ganador.',
  },
  {
    icon: DocumentDuplicateIcon,
    title: 'Templates',
    description: 'Crea y reutiliza plantillas de contenido por categoria y plataforma.',
  },
  {
    icon: EyeIcon,
    title: 'Preview Multi-Plataforma',
    description: 'Visualiza como se vera tu contenido en Instagram, TikTok, YouTube y Facebook.',
  },
  {
    icon: CreditCardIcon,
    title: 'Pagos con Stripe',
    description: 'Suscripciones, facturacion automatica y gestion de planes integrada.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Multi-Tenant Seguro',
    description: 'Gestiona multiples empresas y marcas con aislamiento completo de datos.',
  },
];

const stats = [
  { value: '12+', label: 'Herramientas integradas' },
  { value: '3', label: 'Plataformas sociales' },
  { value: '24/7', label: 'IA disponible' },
  { value: '100%', label: 'Automatizado' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/assets/icon.png" alt="ContenixIA" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">
                Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Funcionalidades</a>
              <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Plataforma</a>
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Iniciar sesion
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all duration-300"
              >
                Comenzar gratis
              </Link>
            </div>
            <div className="md:hidden">
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold"
              >
                Comenzar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50 via-purple-50 to-transparent rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-50 via-blue-50 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-8">
              <SparklesIcon className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Potenciado por Inteligencia Artificial</span>
            </div>

            <div className="flex justify-center mb-8">
              <Image src="/assets/slogan.png" alt="ContenixIA - Marketing inteligente, todo en uno" width={420} height={120} priority />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Tu marketing digital,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                automatizado e inteligente
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              Gestiona redes sociales, crea contenido con IA, edita videos, analiza metricas y publica en todas las plataformas desde un solo lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="group inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                Comenzar gratis
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-8 py-4 rounded-full bg-gray-50 text-gray-700 font-semibold text-lg hover:bg-gray-100 transition-all duration-300 border border-gray-200"
              >
                Iniciar sesion
              </Link>
            </div>

            <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>Sin tarjeta de credito</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>Setup en 2 minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-green-500" />
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16 border-y border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Todo lo que necesitas en una sola plataforma
            </h2>
            <p className="text-lg text-gray-500">
              12 herramientas profesionales de marketing digital, integradas y listas para usar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-gray-100 bg-white hover:border-purple-100 hover:shadow-lg hover:shadow-purple-50 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-20 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Conecta todas tus plataformas
            </h2>
            <p className="text-lg text-gray-500">
              Publica, programa y analiza contenido en las redes sociales mas importantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'Meta', sub: 'Facebook e Instagram', color: 'from-blue-500 to-blue-600' },
              { name: 'TikTok', sub: 'Videos virales', color: 'from-gray-800 to-gray-900' },
              { name: 'YouTube', sub: 'Videos y Shorts', color: 'from-red-500 to-red-600' },
            ].map((platform) => (
              <div key={platform.name} className="text-center p-8 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${platform.color} mb-4`}>
                  <ShareIcon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{platform.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{platform.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Empieza en 3 simples pasos
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Crea tu cuenta', desc: 'Registrate gratis y configura tu empresa y marcas en menos de 2 minutos.' },
              { step: '02', title: 'Conecta tus redes', desc: 'Vincula tus cuentas de Meta, TikTok y YouTube con un solo clic.' },
              { step: '03', title: 'Publica y analiza', desc: 'Crea contenido con IA, programa publicaciones y mide resultados en tiempo real.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg mb-5">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-16 sm:px-16 sm:py-20 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>

            <div className="relative max-w-2xl mx-auto text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Transforma tu marketing hoy
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                Unete a ContenixIA y automatiza tu estrategia de contenido con inteligencia artificial.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Comenzar gratis
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/assets/icon.png" alt="ContenixIA" width={28} height={28} className="rounded-lg" />
              <span className="text-sm font-semibold text-gray-900">
                Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; 2026 ContenixIA. Marketing inteligente, todo en uno.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
