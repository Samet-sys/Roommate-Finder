import React, { useState } from 'react';
import { Search, Menu, User, LogIn, UserPlus, LogOut, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../profile/Avatar';
import { useTranslation } from '../../translate/useTranslations'; 
import { useLanguage } from '../../contexts/LanguageContext'; 

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { t } = useTranslation();
  const { setLanguage, language } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-950  border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-slate-200">
              <img 
                src="/site-icon.png" 
                alt="Site Icon" 
                className="w-8 h-8 mr-2"
              />
              {t('header_brand')}
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <a 
                  href="/profile" 
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name || 'User'}
                    size="sm"
                  />
                  <span className="ml-2">{user?.name}</span>
                </a>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/new-listing'}
                  className="flex items-center"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  {t('header_create_listing')}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.href = '/signin'}
                  className="flex items-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('header_sign_in')}
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => window.location.href = '/register'}
                  className="flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {t('header_register')}
                </Button>
              </>
            )}

            {/* Dil değiştirici butonlar */}
            <div className="relative inline-block text-left">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-4 py-2 pr-8 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="en">🌐 {t("header_language_en")}</option>
                <option value="tr">🌐 {t("header_language_tr")}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          <div className="md:hidden">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
      />
    </header>
  );
}