import React from 'react';
import { Settings, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { SettingsPage } from '../settings/SettingsPage';
import { ProfileInfo } from './ProfileInfo';
import { UserListings } from './UserListings';
import { useProfile } from '../../hooks/useProfile';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ChatPortal } from '../chat/ChatPortal';
import { useTranslation } from '../../translate/useTranslations';

export function ProfilePage() {
  const { logout } = useAuth();
  const { isLoading, error, profileData, updateProfile } = useProfile();
  const { t } = useTranslation();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('profile_error_title')}</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || t('profile_error_message')}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            {t('profile_try_again')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-slate-200">
              <img 
                  src="/site-icon.png" 
                  alt="Site Icon" 
                  className="w-8 h-8 mr-2"
                />
              {t("header_brand")}
            </a>
            <div className="flex items-center space-x-2">
              <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.location.href = '/settings'}
                  className="flex items-center"
                >
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('profile_settings')}</span>
              </Button>
              <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={logout}
                  className="flex items-center"
                >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t('profile_sign_out')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ProfileInfo
              user={profileData}
              onUpdateProfile={updateProfile}
            />
            </div>
          </div>

          {/* User Listings */}
          <div className="lg:col-span-2">
            <UserListings listings={profileData.listings || []} />
          </div>
        </div>
      </main>
      <ChatPortal/>
    </div>
  );
}