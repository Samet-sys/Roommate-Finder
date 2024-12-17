import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ListingCard } from '../listings/ListingCard';
import type { Listing } from '../../types';
import { useTranslation } from '../../translate/useTranslations';

interface UserListingsProps {
  listings: Listing[];
}

export function UserListings({ listings }: UserListingsProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-slate-950  rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{t('user_listings_title')}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.href = '/new-listing'}
        >
          <Plus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">{t('user_listings_add_new')}</span>
        </Button>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900  rounded-lg">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('user_listings_no_listings')}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/new-listing'}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('user_listings_create_first')}
          </Button>
        </div>
      )}
    </div>
  );
}