import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../translate/useTranslations';

interface RegisterFormData {
  name: string;
  email: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  occupation: string;
  bio: string;
  password: string;
  preferences: {
    smoking: boolean;
    pets: boolean;
    nightLife: boolean;
  };
}

const INITIAL_FORM_STATE: RegisterFormData = {
  name: '',
  email: '',
  gender: 'male',
  phone: '',
  occupation: '',
  bio: '',
  password: '',
  preferences: {
    smoking: false,
    pets: false,
    nightLife: false
  }
};

export function RegisterForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_STATE);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t('registration_failed'));
      } 

      setIsModalVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registration_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirect = () => {
    setIsModalVisible(false);
    window.location.href = '/signin'; // Redirect on confirm
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 ">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950  border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center items-center">
          <a href="/" className="flex items-center text-2xl font-bold text-blue-600 dark:text-slate-200">
          <img 
                src="/site-icon.png" 
                alt="Site Icon" 
                className="w-8 h-8 mr-2"
              />
            {t("header_brand")}
          </a>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            {t('registration_title')}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('already_have_account')}{' '}
              <a href="/signin" className="font-medium text-blue-600 dark:text-blue-300 hover:text-blue-500 dark:hover:text-blue-400">
              {t('sign_in')}
              </a>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('full_name')}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder="Jackie Chen"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("email_address")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder={t("email_address_placeholder")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('gender')}
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                  >
                    <option value={t('gender_male')}>Male</option>
                    <option value={t('gender_female')}>Female</option>
                    <option value={t('gender_other')}>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("phone_number")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder="+90 555 555 5555"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("occupation")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="occupation"
                    name="occupation"
                    type="text"
                    required
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("bio")}
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder={t("bio_placeholder")}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div className="pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t("preferences")}</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.smoking}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          smoking: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t("smoking_allowed")}</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.pets}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          pets: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t("pet_friendly")}</span>
                  </label>
                  
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.preferences.nightLife}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          nightLife: e.target.checked
                        }
                      })}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-700 text-slate-600 focus:ring-slate-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t("night_life_friendly")}</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("password")}
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                {t("password_hint")}
                </p>
              </div>
            </div>

            <div>
              <Button 
                type="submit"
                variant="primary" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('creating_account') : t('create_account')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isVisible={isModalVisible}
        title={t('registration_successful')}
        message={t('verify_email_message')}
        onClose={() => setIsModalVisible(false)}
        onConfirm={handleRedirect} // Pass redirection handler
        confirmLabel={t('go_to_sign_in')}
        closeLabel={t('close')}
      />
    </div>
  );
}