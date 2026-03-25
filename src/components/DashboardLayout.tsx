'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  ChartBarIcon,
  MegaphoneIcon,
  ShareIcon,
  SparklesIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  BuildingOfficeIcon,
  TagIcon,
  FilmIcon,
  CalendarDaysIcon,
  HashtagIcon,
  ChatBubbleLeftRightIcon,
  BeakerIcon,
  DocumentDuplicateIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import CompanyBrandSelector from './CompanyBrandSelector';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<string>('light');
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Load theme from settings
  const loadTheme = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        const userTheme = data.theme || 'light';
        setTheme(userTheme);
        applyTheme(userTheme);
      }
    } catch {
      // Default to light
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadTheme();
    }
  }, [user?.email, loadTheme]);

  const applyTheme = (t: string) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else if (t === 'auto') {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Empresas', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Marcas', href: '/brands', icon: TagIcon },
    { name: 'Campañas', href: '/campaigns', icon: MegaphoneIcon },
    { name: 'Redes Sociales', href: '/social', icon: ShareIcon },
    { name: 'Videos', href: '/videos', icon: FilmIcon },
    { name: 'Calendario', href: '/calendar', icon: CalendarDaysIcon },
    { name: 'Hashtags', href: '/hashtags', icon: HashtagIcon },
    { name: 'Comentarios', href: '/comments', icon: ChatBubbleLeftRightIcon },
    { name: 'A/B Testing', href: '/ab-testing', icon: BeakerIcon },
    { name: 'Templates', href: '/templates', icon: DocumentDuplicateIcon },
    { name: 'Preview', href: '/preview', icon: EyeIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'IA Generativa', href: '/content-ai', icon: SparklesIcon },
    { name: 'Pagos', href: '/payments', icon: CreditCardIcon },
  ];

  const isDark = theme === 'dark' || (theme === 'auto' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const sidebarBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const sidebarText = isDark ? 'text-gray-300' : 'text-gray-700';
  const sidebarHover = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';
  const sidebarActive = isDark
    ? 'bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-lg'
    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg';
  const headerBg = isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const headerText = isDark ? 'text-gray-100' : 'text-gray-900';
  const mainBg = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const brandText = isDark ? 'text-gray-100' : 'text-gray-900';

  const renderNavLinks = (onClickExtra?: () => void) => (
    <>
      {navigation.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onClickExtra}
            className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive ? sidebarActive : `${sidebarText} ${sidebarHover}`
            }`}
          >
            <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  const renderFooter = (onClickExtra?: () => void) => (
    <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} p-4`}>
      <Link
        href="/settings"
        onClick={onClickExtra}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-2 ${
          pathname === '/settings' ? sidebarActive : `${sidebarText} ${sidebarHover}`
        }`}
      >
        <Cog6ToothIcon className="h-5 w-5 mr-3 flex-shrink-0" />
        Configuración
      </Link>
      <button
        onClick={() => { onClickExtra?.(); logout(); }}
        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
          isDark ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:bg-red-50'
        }`}
      >
        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
        Cerrar Sesión
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${mainBg}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className={`fixed inset-y-0 left-0 w-72 ${sidebarBg} border-r flex flex-col shadow-xl`}>
            <div className={`flex h-16 items-center justify-between px-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <img src="/assets/icon.png" alt="ContenixIA" className="w-8 h-8 rounded-lg" />
                <span className={`text-lg font-bold ${brandText}`}>
                  Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
                </span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {renderNavLinks(() => setSidebarOpen(false))}
            </nav>
            {renderFooter(() => setSidebarOpen(false))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex flex-col flex-grow ${sidebarBg} border-r`}>
          <div className={`flex h-16 items-center px-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} gap-2`}>
            <img src="/assets/icon.png" alt="ContenixIA" className="w-8 h-8 rounded-lg" />
            <span className={`text-lg font-bold ${brandText}`}>
              Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span>
            </span>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {renderNavLinks()}
          </nav>
          {renderFooter()}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className={`sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b ${headerBg} px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8`}>
          <button
            type="button"
            className={`-m-2.5 p-2.5 lg:hidden ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center gap-4">
              <h2 className={`text-lg font-semibold hidden lg:block ${headerText}`}>
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
              <CompanyBrandSelector />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`relative -m-2.5 p-2.5 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'}`}
                >
                  <BellIcon className="h-6 w-6" />
                </button>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg border z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Notificaciones</h3>
                      </div>
                      <div className="py-8 text-center">
                        <BellIcon className={`h-10 w-10 mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No tienes notificaciones</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={`hidden lg:block lg:h-6 lg:w-px ${isDark ? 'lg:bg-gray-700' : 'lg:bg-gray-200'}`} />

              <div className="flex items-center gap-x-3">
                <UserCircleIcon className={`h-8 w-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="hidden lg:block">
                  <p className={`text-sm font-semibold ${headerText}`}>
                    {user?.email || 'Usuario'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
