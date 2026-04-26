'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  KeyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { applyTheme } from '@/components/ThemeToggle';
import { useTranslation } from '@/hooks/useTranslation';

interface UserSettings {
  fullName: string;
  phone: string;
  emailNotifications: boolean;
  campaignAlerts: boolean;
  weeklyReports: boolean;
  socialMentions: boolean;
  twoFactorAuth: boolean;
  sessionTimeout: number;
  theme: string;
  language: string;
  timezone: string;
}

const defaultSettings: UserSettings = {
  fullName: '',
  phone: '',
  emailNotifications: true,
  campaignAlerts: true,
  weeklyReports: true,
  socialMentions: false,
  twoFactorAuth: false,
  sessionTimeout: 30,
  theme: 'light',
  language: 'es',
  timezone: 'America/Bogota',
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Linked auth methods
  type LinkedProvider = { provider: string; linkedAt?: string | null; lastUsedAt?: string | null };
  const [linkedProviders, setLinkedProviders] = useState<LinkedProvider[] | null>(null);
  const [linkedLoading, setLinkedLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== 'security' || linkedProviders !== null) return;
    setLinkedLoading(true);
    fetch('/api/auth/providers')
      .then(r => r.ok ? r.json() : [])
      .then(data => setLinkedProviders(Array.isArray(data) ? data : []))
      .catch(() => setLinkedProviders([]))
      .finally(() => setLinkedLoading(false));
  }, [activeTab, linkedProviders]);

  // Password change
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      loadSettings();
    }
  }, [user?.email, loadSettings]);

  const updateField = (field: keyof UserSettings, value: string | boolean | number) => {
    setSettings((s) => ({ ...s, [field]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError('');

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al guardar');
      }

      const data = await response.json();
      setSettings(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Apply theme immediately and save to cookie
      const t = data.theme || settings.theme;
      applyTheme(t);
      document.cookie = `theme=${t}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    } catch (error: any) {
      setSaveError(error.message || 'Error al guardar configuración');
      setTimeout(() => setSaveError(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError(t('settings_pass_no_match'));
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setPasswordError(t('settings_pass_min_len'));
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPass,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al cambiar la contraseña');
      }

      setPasswordSuccess(true);
      setPasswordForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', name: t('settings_tab_profile'), icon: UserCircleIcon },
    { id: 'notifications', name: t('settings_tab_notifications'), icon: BellIcon },
    { id: 'security', name: t('settings_tab_security'), icon: ShieldCheckIcon },
    { id: 'appearance', name: t('settings_tab_appearance'), icon: PaintBrushIcon },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('settings_title')}</h1>
            <p className="mt-2 text-gray-600">{t('settings_desc')}</p>
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
                    <p className="text-sm text-green-800">{t('settings_saved')}</p>
                  </div>
                )}

                {saveError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
                    <p className="text-sm text-red-800">{saveError}</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                <form onSubmit={handleSaveSettings}>
                  {activeTab === 'profile' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('settings_profile_title')}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_fullname')}</label>
                          <input
                            type="text"
                            value={settings.fullName || ''}
                            onChange={(e) => updateField('fullName', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="Juan Pérez"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_email')}</label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                            disabled
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_phone')}</label>
                          <input
                            type="tel"
                            value={settings.phone || ''}
                            onChange={(e) => updateField('phone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            placeholder="+1 234 567 8900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('settings_notif_title')}</h2>
                      <div className="space-y-4">
                        {([
                          { key: 'emailNotifications' as const, title: t('settings_notif_email'), desc: t('settings_notif_email_desc') },
                          { key: 'campaignAlerts' as const, title: t('settings_notif_campaigns'), desc: t('settings_notif_campaigns_desc') },
                          { key: 'weeklyReports' as const, title: t('settings_notif_reports'), desc: t('settings_notif_reports_desc') },
                          { key: 'socialMentions' as const, title: t('settings_notif_mentions'), desc: t('settings_notif_mentions_desc') },
                        ]).map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.title}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => updateField(item.key, !settings[item.key])}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings[item.key] ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                  settings[item.key] ? 'translate-x-6' : 'translate-x-1'
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
                      <h2 className="text-xl font-bold text-gray-900">{t('settings_security_title')}</h2>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{t('settings_2fa')}</p>
                            <p className="text-sm text-gray-500">{t('settings_2fa_desc')}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateField('twoFactorAuth', !settings.twoFactorAuth)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_session_timeout')}</label>
                          <select
                            value={settings.sessionTimeout}
                            onChange={(e) => updateField('sessionTimeout', parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={15}>{t('settings_session_15')}</option>
                            <option value={30}>{t('settings_session_30')}</option>
                            <option value={60}>{t('settings_session_60')}</option>
                            <option value={120}>{t('settings_session_120')}</option>
                          </select>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <KeyIcon className="h-5 w-5 mr-2" />
                            {t('settings_change_password')}
                          </button>
                        </div>

                        {/* Linked accounts */}
                        <div className="pt-4 border-t border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('settings_linked_accounts')}</h3>
                          <p className="text-xs text-gray-500 mb-3">{t('settings_linked_accounts_desc')}</p>
                          {linkedLoading || linkedProviders === null ? (
                            <p className="text-sm text-gray-400">{t('settings_linked_loading')}</p>
                          ) : linkedProviders.length === 0 ? (
                            <p className="text-sm text-gray-400">{t('settings_linked_none')}</p>
                          ) : (
                            <ul className="space-y-2">
                              {linkedProviders.map((p) => {
                                const label = t(`provider_${p.provider}`) || p.provider;
                                const linkedAt = p.linkedAt ? new Date(p.linkedAt).toLocaleDateString() : '—';
                                const lastUsed = p.lastUsedAt ? new Date(p.lastUsedAt).toLocaleDateString() : '—';
                                return (
                                  <li
                                    key={p.provider}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">{label}</p>
                                        <p className="text-xs text-gray-500">
                                          {t('settings_linked_at')}: {linkedAt} · {t('settings_last_used')}: {lastUsed}
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold text-gray-900">{t('settings_appearance_title')}</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_theme')}</label>
                          <select
                            value={settings.theme}
                            onChange={(e) => {
                              const newTheme = e.target.value;
                              updateField('theme', newTheme);
                              applyTheme(newTheme);
                              document.cookie = `theme=${newTheme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="light">{t('settings_theme_light')}</option>
                            <option value="dark">{t('settings_theme_dark')}</option>
                            <option value="auto">{t('settings_theme_auto')}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_language')}</label>
                          <select
                            value={settings.language}
                            onChange={(e) => updateField('language', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                            <option value="fr">Français</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_timezone')}</label>
                          <select
                            value={settings.timezone}
                            onChange={(e) => updateField('timezone', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                            <option value="America/Bogota">America/Bogota (GMT-5)</option>
                            <option value="America/New_York">America/New_York (GMT-5)</option>
                            <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                            <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                            <option value="America/Lima">America/Lima (GMT-5)</option>
                            <option value="America/Santiago">America/Santiago (GMT-4)</option>
                            <option value="America/Buenos_Aires">America/Buenos_Aires (GMT-3)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => loadSettings()}
                        className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                      >
                        {t('common_cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? t('common_saving') : t('common_save')}
                      </button>
                    </div>
                  </div>
                </form>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('settings_modal_title')}</h2>

                {passwordSuccess ? (
                  <div className="text-center py-4">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-700 font-medium">{t('settings_pass_updated')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_current_pass')}</label>
                      <input
                        type="password"
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_new_pass')}</label>
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
<label className="block text-sm font-medium text-gray-700 mb-2">{t('settings_confirm_pass')}</label>
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
                        {t('common_cancel')}
                      </button>
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {passwordLoading ? t('settings_changing') : t('settings_change_btn')}
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
