'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import apiClient from '@/lib/api/client';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  KeyIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const SETTINGS_KEY = 'marketing_user_settings';

interface UserSettings {
  profile: { name: string; company: string; phone: string };
  notifications: { emailNotifications: boolean; campaignAlerts: boolean; weeklyReports: boolean; socialMentions: boolean };
  security: { twoFactorAuth: boolean; sessionTimeout: string };
  appearance: { theme: string; language: string; timezone: string };
}

function loadSettings(email: string): UserSettings {
  try {
    const raw = localStorage.getItem(`${SETTINGS_KEY}_${email}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    profile: { name: '', company: '', phone: '' },
    notifications: { emailNotifications: true, campaignAlerts: true, weeklyReports: true, socialMentions: false },
    security: { twoFactorAuth: false, sessionTimeout: '30' },
    appearance: { theme: 'light', language: 'es', timezone: 'America/Mexico_City' },
  };
}

function saveSettings(email: string, settings: UserSettings) {
  localStorage.setItem(`${SETTINGS_KEY}_${email}`, JSON.stringify(settings));
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [settings, setSettings] = useState<UserSettings>(() =>
    loadSettings(user?.email || '')
  );

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Load settings when user is available
  useEffect(() => {
    if (user?.email) {
      setSettings(loadSettings(user.email));
    }
  }, [user?.email]);

  const updateProfile = (field: string, value: string) => {
    setSettings((s) => ({ ...s, profile: { ...s.profile, [field]: value } }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setSettings((s) => ({ ...s, notifications: { ...s.notifications, [field]: value } }));
  };

  const updateSecurity = (field: string, value: string | boolean) => {
    setSettings((s) => ({ ...s, security: { ...s.security, [field]: value } }));
  };

  const updateAppearance = (field: string, value: string) => {
    setSettings((s) => ({ ...s, appearance: { ...s.appearance, [field]: value } }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    saveSettings(user?.email || '', settings);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      await apiClient.post('/v1/auth/change-password', {
        currentPassword: passwordForm.current,
        newPassword: passwordForm.newPass,
      });
      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || 'Error al cambiar la contraseña');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notificaciones', icon: BellIcon },
    { id: 'security', name: 'Seguridad', icon: ShieldCheckIcon },
    { id: 'appearance', name: 'Apariencia', icon: PaintBrushIcon },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
            <p className="mt-2 text-gray-600">Gestiona tu cuenta y preferencias</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="h-5 w-5 mr-3" />
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6">
                {saveSuccess && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <p className="text-sm text-green-800">Configuración guardada exitosamente</p>
                  </div>
                )}

                <form onSubmit={handleSaveSettings}>
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Información de Perfil</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                          <input
                            type="text"
                            value={settings.profile.name}
                            onChange={(e) => updateProfile('name', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Juan Pérez"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Empresa</label>
                          <input
                            type="text"
                            value={settings.profile.company}
                            onChange={(e) => updateProfile('company', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Mi Empresa S.A."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                          <input
                            type="tel"
                            value={settings.profile.phone}
                            onChange={(e) => updateProfile('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Preferencias de Notificaciones</h2>
                      <div className="space-y-4">
                        {[
                          { key: 'emailNotifications', title: 'Notificaciones por Email', desc: 'Recibir actualizaciones por correo' },
                          { key: 'campaignAlerts', title: 'Alertas de Campañas', desc: 'Notificar sobre campañas activas' },
                          { key: 'weeklyReports', title: 'Reportes Semanales', desc: 'Resumen de actividad cada semana' },
                          { key: 'socialMentions', title: 'Menciones en Redes', desc: 'Alertas de menciones sociales' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateNotifications(item.key, !(settings.notifications as any)[item.key])}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                (settings.notifications as any)[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  (settings.notifications as any)[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'security' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Seguridad de la Cuenta</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                            <p className="text-sm text-gray-500">Seguridad adicional para tu cuenta</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSecurity('twoFactorAuth', !settings.security.twoFactorAuth)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.security.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                settings.security.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo de Sesión (minutos)</label>
                          <select
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSecurity('sessionTimeout', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="60">1 hora</option>
                            <option value="120">2 horas</option>
                          </select>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <KeyIcon className="h-5 w-5 mr-2" />
                            Cambiar Contraseña
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">Apariencia</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                          <select
                            value={settings.appearance.theme}
                            onChange={(e) => updateAppearance('theme', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="light">Claro</option>
                            <option value="dark">Oscuro</option>
                            <option value="auto">Automático</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                          <select
                            value={settings.appearance.language}
                            onChange={(e) => updateAppearance('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                            <option value="fr">Français</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Zona Horaria</label>
                          <select
                            value={settings.appearance.timezone}
                            onChange={(e) => updateAppearance('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                            <option value="America/Bogota">America/Bogota (GMT-5)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                            <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (user?.email) setSettings(loadSettings(user.email));
                        }}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Cambiar Contraseña</h2>

                {passwordSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-medium">Contraseña actualizada</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña Actual</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nueva Contraseña</label>
                      <input
                        type="password"
                        value={passwordForm.newPass}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                        minLength={8}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                      <input
                        type="password"
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                        minLength={8}
                      />
                    </div>

                    {passwordError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-800">{passwordError}</p>
                      </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => { setShowPasswordModal(false); setPasswordError(''); }}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Cambiar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
