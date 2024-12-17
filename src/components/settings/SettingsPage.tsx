import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useTranslation } from '../../translate/useTranslations';

export function SettingsPage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuth();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null); // Clear any previous error
  
    try {
      const response = await fetch(`http://localhost:3000/api/users/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('delete_account_error'));
      }

      // Close the confirmation modal before showing the success modal
      setIsConfirmationModalVisible(false);

      // Wait for the confirmation modal to unmount
      setTimeout(() => {
        // On success, show the success modal and logout
        setIsSuccessModalVisible(true);
        setIsDeleting(false);
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('delete_account_error'));
      setIsDeleting(false);
    }
  };  
  
  
  
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950  border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
          >
            <ArrowLeft className="w-5 h-5 sm:mr-2" />
            <span className="hidden sm:inline">{t('back')}</span>
          </button>
          <a href="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-slate-200">
          <img 
                src="/site-icon.png" 
                alt="Site Icon" 
                className="w-8 h-8 mr-2"
              />
            {t('header_brand')}
          </a>
          <div className="w-16" /> {/* Spacer to balance layout */}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-950  rounded-lg shadow p-6 space-y-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('settings_title')}
          </h1>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300 font-medium">{t('dark_mode')}</span>
            <button
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                darkMode ? 'bg-slate-600' : 'bg-gray-400'
              }`}
              onClick={toggleDarkMode}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white dark:bg-slate-950  rounded-full transition-transform ${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmationModalVisible(true)}
              disabled={isDeleting}
            >
              {isDeleting ? <LoadingSpinner /> : t('delete_account')}
            </Button>
          </div>
        </div>
      </main>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isVisible={isConfirmationModalVisible}
        title={t('confirm_deletion_title')}
        message={t('confirm_deletion_message')}
        onClose={() => setIsConfirmationModalVisible(false)}
        onConfirm={handleDeleteAccount}
        confirmLabel={isDeleting ? <LoadingSpinner /> : t('delete')}
        closeLabel={t('cancel')}
      />

      {/* Success Modal */}
      <Modal
        isVisible={isSuccessModalVisible}
        title={t('account_deleted_title')}
        message={t('account_deleted_message')}
        onClose={() => {
          setIsSuccessModalVisible(false);
          logout(); // Perform logout
        }}
        closeLabel="OK"
      />
    </div>
  );
}
