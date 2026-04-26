'use client';

import { useState, useEffect } from 'react';
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
  GlobeAltIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { type Lang, langLabels, getLangFromCookie, setLangCookie, landingTranslations } from '@/lib/i18n';

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('es');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    setLang(getLangFromCookie());
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    setLangMenuOpen(false);
    setLangCookie(l);
  };

  const t = landingTranslations[lang];

  const featuresList = [
    { icon: SparklesIcon, title: t.feat_ai, description: t.feat_ai_desc },
    { icon: ShareIcon, title: t.feat_social, description: t.feat_social_desc },
    { icon: FilmIcon, title: t.feat_video, description: t.feat_video_desc },
    { icon: ChartBarIcon, title: t.feat_analytics, description: t.feat_analytics_desc },
    { icon: CalendarDaysIcon, title: t.feat_calendar, description: t.feat_calendar_desc },
    { icon: HashtagIcon, title: t.feat_hashtag, description: t.feat_hashtag_desc },
    { icon: ChatBubbleLeftRightIcon, title: t.feat_comments, description: t.feat_comments_desc },
    { icon: BeakerIcon, title: t.feat_ab, description: t.feat_ab_desc },
    { icon: DocumentDuplicateIcon, title: t.feat_templates, description: t.feat_templates_desc },
    { icon: EyeIcon, title: t.feat_preview, description: t.feat_preview_desc },
    { icon: CreditCardIcon, title: t.feat_payments, description: t.feat_payments_desc },
    { icon: ShieldCheckIcon, title: t.feat_security, description: t.feat_security_desc },
  ];

  const stats = [
    { value: '12+', label: t.stat_tools },
    { value: '3', label: t.stat_platforms },
    { value: '24/7', label: t.stat_ai },
    { value: '100%', label: t.stat_auto },
  ];

  const loggedIn = !isLoading && isAuthenticated;

  const LanguageSelector = () => (
    <div className="relative">
      <button
        onClick={() => setLangMenuOpen(!langMenuOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <GlobeAltIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{langLabels[lang]}</span>
        <span className="sm:hidden">{lang.toUpperCase()}</span>
        <ChevronDownIcon className="h-3 w-3" />
      </button>
      {langMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-lg border bg-white border-gray-200 z-50 py-1">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  l === lang
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {langLabels[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image src="/assets/icon.png" alt="ContenixIA" width={36} height={36} className="rounded-lg" />
              <span className="text-xl font-bold text-gray-900">
                Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t.nav_features}</a>
              <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">{t.nav_platform}</a>
              {!loggedIn && (
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  {t.nav_login}
                </Link>
              )}
              <LanguageSelector />
              <ThemeToggle />
              <Link
                href={loggedIn ? '/dashboard' : '/register'}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-200 transition-all duration-300"
              >
                {loggedIn ? t.nav_dashboard : t.nav_start}
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <Link
                href={loggedIn ? '/dashboard' : '/register'}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold"
              >
                {loggedIn ? t.nav_dashboard_short : t.nav_start_short}
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
              <span className="text-sm font-medium text-gray-700">{t.hero_badge}</span>
            </div>

            {/* Text-based slogan */}
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Image src="/assets/icon.png" alt="ContenixIA" width={52} height={52} className="rounded-xl" />
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900">
                  Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
                </span>
              </div>
              <p className="text-lg sm:text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {t.hero_slogan_sub}
              </p>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              {t.hero_title_1}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
                {t.hero_title_2}
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.hero_desc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={loggedIn ? '/dashboard' : '/register'}
                className="group inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-xl hover:shadow-purple-200 transition-all duration-300 hover:-translate-y-0.5"
              >
                {loggedIn ? t.hero_cta_dashboard : t.hero_cta}
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              {!loggedIn && (
                <Link
                  href="/login"
                  className="inline-flex items-center px-8 py-4 rounded-full bg-gray-50 text-gray-700 font-semibold text-lg hover:bg-gray-100 transition-all duration-300 border border-gray-200"
                >
                  {t.hero_login}
                </Link>
              )}
            </div>

            {!loggedIn && (
              <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>{t.hero_check_1}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>{t.hero_check_2}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                  <span>{t.hero_check_3}</span>
                </div>
              </div>
            )}
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
              {t.features_title}
            </h2>
            <p className="text-lg text-gray-500">
              {t.features_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresList.map((feature) => (
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
              {t.platforms_title}
            </h2>
            <p className="text-lg text-gray-500">
              {t.platforms_desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { name: 'Meta', sub: t.plat_meta_sub, color: 'from-blue-500 to-blue-600' },
              { name: 'TikTok', sub: t.plat_tiktok_sub, color: 'from-gray-800 to-gray-900' },
              { name: 'YouTube', sub: t.plat_youtube_sub, color: 'from-red-500 to-red-600' },
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
              {t.steps_title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {[
              { step: '01', title: t.step1_title, desc: t.step1_desc },
              { step: '02', title: t.step2_title, desc: t.step2_desc },
              { step: '03', title: t.step3_title, desc: t.step3_desc },
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
                {t.cta_title}
              </h2>
              <p className="text-lg text-blue-100 mb-8">
                {t.cta_desc}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href={loggedIn ? '/dashboard' : '/register'}
                  className="group inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-gray-900 font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  {loggedIn ? t.cta_dashboard : t.cta_start}
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                {!loggedIn && (
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    {t.cta_login}
                  </Link>
                )}
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
              {t.footer_copy}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
