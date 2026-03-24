'use client';

import { useState } from 'react';
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
  const pathname = usePathname();
  const { user, logout } = useAuth();

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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white">
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img src="/assets/icon.png" alt="ContenixIA" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-bold text-gray-900">Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span></span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 gap-2">
            <img src="/assets/icon.png" alt="ContenixIA" className="w-8 h-8 rounded-lg" />
            <span className="text-lg font-bold text-gray-900">Contenix<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">IA</span></span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <Link
              href="/settings"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors mb-2"
            >
              <Cog6ToothIcon className="h-5 w-5 mr-3" />
              Configuración
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900 hidden lg:block">
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
              <CompanyBrandSelector />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                >
                  <BellIcon className="h-6 w-6" />
                </button>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                      </div>
                      <div className="py-8 text-center">
                        <BellIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No tienes notificaciones</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              <div className="flex items-center gap-x-3">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.email || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.roles?.[0]?.role || 'Usuario'}
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
