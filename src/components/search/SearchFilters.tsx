import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '../ui/Button';
import { cities, districts } from '../../utils/locations';
import type { FilterOptions, LifestylePreference } from '../../types';
import { useTranslation } from '../../translate/useTranslations';
interface SearchFiltersProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

type LifestyleKey = keyof Pick<FilterOptions['preferences'], 'smoking' | 'pets' | 'nightLife'>;

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const { t } = useTranslation(); // Translation function
  const [selectedCity, setSelectedCity] = useState('');

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    onFilterChange({
      ...filters,
      location: city ? city : ''
    });
  };

  const handleDistrictChange = (district: string) => {
    onFilterChange({
      ...filters,
      location: district ? `${district}, ${selectedCity}` : selectedCity
    });
  };

  const handleClear = () => {
    setSelectedCity('');
    onFilterChange({
      priceRange: [0, 50000],
      roomType: [],
      location: '',
      preferences: {
        smoking: null,
        pets: null,
        nightLife: null,
        gender: 'any',
        ageRange: [18, 99],
        occupation: 'any'
      }
    });
  };

  const handleLifestyleChange = (key: LifestyleKey, value: boolean) => {
    onFilterChange({
      ...filters,
      preferences: {
        ...filters.preferences,
        [key]: value ? true : null
      }
    });

    
  };
  const lifestylePreferences: { key: LifestyleKey; label: string }[] = [
    { key: 'smoking', label: t('filters_lifestyle_smoking') },
      { key: 'pets', label: t('filters_lifestyle_pets') },
      { key: 'nightLife', label: t('filters_lifestyle_night_life') },
  ];
  return (
    <div className="bg-white dark:bg-slate-950 p-4 rounded-lg shadow-sm text-gray-600 dark:text-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('filters_title')}</h3>
        <Button variant="outline" size="sm" onClick={handleClear}>
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          {t('filters_clear_all')}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('filters_location')}
          </label>
          <div className="space-y-2">
            <select
              className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">{t('filters_select_city')}</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            
            {selectedCity && (
              <select
                className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value="">{t('filters_select_district')}</option>
                {districts[selectedCity]?.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('filters_price_range')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
              placeholder={t('filters_min')}
              value={filters.priceRange[0]}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: [Number(e.target.value), filters.priceRange[1]]
                })
              }
            />
            <input
              type="number"
              className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
              placeholder={t('filters_max')}
              value={filters.priceRange[1]}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(e.target.value)]
                })
              }
            />
          </div>
        </div>

        {/* Room Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('filters_room_type')}
          </label>
          <div className="space-y-2">
          {['private', 'shared'].map((type) => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-gray-700 text-state-600 focus:ring-state-500 text-gray-600"
                checked={filters.roomType.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...filters.roomType, type]
                    : filters.roomType.filter((t) => t !== type);
                  onFilterChange({ ...filters, roomType: newTypes });
                }}
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                {t(`filters_room_${type}`)}
              </span>
            </label>
          ))}
        </div>
       </div>

        {/* Preferences */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('filters_preferences')}</h4>

          {/* Gender */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('filters_gender')}</label>
            <select
              className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
              value={filters.preferences.gender}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  preferences: {
                    ...filters.preferences,
                    gender: e.target.value as FilterOptions['preferences']['gender']
                  }
                })
              }
            >
              <option value="any">{t('filters_gender_any')}</option>
              <option value="male">{t('filters_gender_male_only')}</option>
              <option value="female">{t('filters_gender_female_only')}</option>
            </select>
          </div>

          {/* Age Range */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('filters_age_range')}</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
                placeholder={t('filters_min_age')}
                min="18"
                max="99"
                value={filters.preferences.ageRange[0]}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    preferences: {
                      ...filters.preferences,
                      ageRange: [Number(e.target.value), filters.preferences.ageRange[1]]
                    }
                  })
                }
              />
              <input
                type="number"
                className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
                placeholder={t('filters_max_age')}
                min="18"
                max="99"
                value={filters.preferences.ageRange[1]}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  onFilterChange({
                    ...filters,
                    preferences: {
                      ...filters.preferences,
                      ageRange: [filters.preferences.ageRange[0], Number(e.target.value)]
                    }
                  })
                }
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="mb-3">
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">{t('filters_occupation')}</label>
            <select
              className="w-full px-3 py-2 text-sm border rounded-md text-gray-600"
              value={filters.preferences.occupation}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  preferences: {
                    ...filters.preferences,
                    occupation: e.target.value as FilterOptions['preferences']['occupation']
                  }
                })
              }
            >
              <option value="any">{t('filters_occupation_any')}</option>
              <option value="student">{t('filters_occupation_student')}</option>
              <option value="professional">{t('filters_occupation_professional')}</option>
            </select>
          </div>

          {/* Lifestyle */}
          <div className="space-y-2">
            {lifestylePreferences.map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-700 text-state-600 focus:ring-state-500"
                  checked={filters.preferences[key] === true}
                  onChange={(e) => handleLifestyleChange(key, e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
