import React from 'react';
import { MapPin, Home, Calendar } from 'lucide-react';
import { Avatar } from '../profile/Avatar';
import type { Listing } from '../../types';
import { useTranslation } from '../../translate/useTranslations';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation();
  
  const handleClick = () => {
    window.location.href = `/listing/${listing._id}`;
  };

  return (
    <div 
      className="bg-white dark:bg-slate-950  rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative aspect-video">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover rounded-t-xl"
        />
        <div className="absolute top-3 right-3 bg-white dark:bg-slate-950  px-2 py-1 rounded-full text-sm font-semibold">
          ₺{listing.price}/{t("month")}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{listing.title}</h3>
        
        <div className="space-y-2">
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{listing.location}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Home className="w-4 h-4 mr-2" />
            <span className="text-sm capitalize">{t(`card_room_${listing.roomType}`)}</span>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">{t("available_from")} {new Date(listing.availableFrom).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Host Information */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center space-x-3">
            <Avatar
              src={listing.host.avatar}
              alt={listing.host.name}
              size="sm"
            />
            <div>
              <p className="text-sm font-medium">{listing.host.name}</p>
              <p className="text-xs text-gray-500">{listing.host.occupation}</p>
            </div>
          </div>
          
          {/* Host Preferences */}
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.host.preferences?.smoking && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                 {t('card_smoking_allowed')}
              </span>
            )}
            {listing.host.preferences?.pets && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {t('card_pet_friendly')}
              </span>
            )}
            {listing.host.preferences?.nightLife && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                {t('card_nightlife_friendly')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}