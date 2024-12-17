import React from 'react';
import { User, Calendar, Briefcase } from 'lucide-react';
import type { Listing } from '../../types';
import { useTranslation } from '../../translate/useTranslations';

interface ListingPreferencesProps {
  preferences: Listing['preferences'];
}

export function ListingPreferences({ preferences }: ListingPreferencesProps) {
  const { t } = useTranslation();

  const formatGender = (gender: string) => {
    if (gender === 'any') return t("preferences_any_gender");
    return gender === 'male' ? t("preferences_male_only") : t("preferences_female_only");
  };

  const formatOccupation = (occupation: string) => {
    if (occupation === 'any') return 'Any occupation';
    return t(`preferences_occupation_${occupation.charAt(0).toUpperCase() + occupation.slice(1)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2"> {t('preferences_looking_for')}</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-400">
          <li className="flex items-center">
            <User className="w-4 h-4 mr-2" />
            {formatGender(preferences.gender)}
          </li>
          <li className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            {preferences.ageRange[0]} - {preferences.ageRange[1]} {t("preferences_age_range")}
          </li>
          <li className="flex items-center">
            <Briefcase className="w-4 h-4 mr-2" />
            {formatOccupation(preferences.occupation)}
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{t('preferences_house_rules')}</h3>
        <div className="space-y-2">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full mr-2 ${preferences.smoking ? 'bg-green-500' : 'bg-red-500'}`} />
            {preferences.smoking ? t('preferences_smoking_allowed') : t('preferences_no_smoking')}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full mr-2 ${preferences.pets ? 'bg-green-500' : 'bg-red-500'}`} />
            {preferences.pets ? t('preferences_pets_allowed') : t('preferences_no_pets')}
          </div>
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <span className={`w-2 h-2 rounded-full mr-2 ${preferences.nightLife ? 'bg-green-500' : 'bg-red-500'}`} />
            {preferences.nightLife ? t('preferences_nightlife_friendly') : t('preferences_quiet_living')}
          </div>
        </div>
      </div>
    </div>
  );
}