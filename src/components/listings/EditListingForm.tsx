import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from './ImageUpload';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cities, districts } from '../../utils/locations';
import type { Listing } from '../../types';
import type { ListingPreferences } from '../../types/preferences';
import { useTranslation } from '../../translate/useTranslations';

interface EditListingFormProps {
  listingId: string;
}

interface LocationState {
  city: string;
  district: string;
}

export function EditListingForm({ listingId }: EditListingFormProps) {
  const { t } = useTranslation();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationState>({ city: '', district: '' });
  const [newAmenity, setNewAmenity] = useState('');
  const [images, setImages] = useState<File[]>([]); // Yeni fotoğraflar
  const [existingImages, setExistingImages] = useState<string[]>([]); // Mevcut fotoğraflar


  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error(t('fetchListingError'));
        }
        const data = await response.json();
        setListing(data);
        
        // Parse location
        const [district, city] = data.location.split(', ');
        setLocation({ city, district });

        setExistingImages(data.images || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('loadListingError'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);


  const handleImagesSelected = (files: File[]) => {
    setImages([...images, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((img) => img !== imageUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setIsSaving(true);
    setError(null);

    try {
      const fullLocation = `${location.district}, ${location.city}`;
      const formData = new FormData();

      // Append new images
      images.forEach((file) => {
        formData.append('images', file);
      });
      // Append basic listing data
      formData.append('title', listing.title);
      formData.append('description', listing.description);
      formData.append('location', fullLocation);
      formData.append('price', listing.price.toString());
      formData.append('roomType', listing.roomType);
      formData.append('availableFrom', new Date(listing.availableFrom).toISOString());
      formData.append('amenities', JSON.stringify(listing.amenities));
      formData.append('preferences', JSON.stringify(listing.preferences));

      // Append existing images to retain
      formData.append('existingImages', JSON.stringify(existingImages));

      const response = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(t('updateListingError'));
      }

      
      window.location.href = `/profile`;
    } catch (err) {
      setError(err instanceof Error ? err.message : t('updateListingError'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCityChange = (city: string) => {
    setLocation({ city, district: '' });
  };

  const addAmenity = () => {
    if (!listing || !newAmenity.trim()) return;
    if (!listing.amenities.includes(newAmenity.trim())) {
      setListing({
        ...listing,
        amenities: [...listing.amenities, newAmenity.trim()]
      });
    }
    setNewAmenity('');
  };

  const removeAmenity = (amenityToRemove: string) => {
    if (!listing) return;
    setListing({
      ...listing,
      amenities: listing.amenities.filter(amenity => amenity !== amenityToRemove)
    });
  };

  const updatePreference = (key: keyof ListingPreferences, value: any) => {
    if (!listing) return;
    setListing({
      ...listing,
      preferences: {
        ...listing.preferences,
        [key]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Listing</h2>
          <p className="text-gray-600 dark:text-gray-300">{error || t('errorLoadingListing')}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            {t('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-600">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950  border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-950  rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('editListing')}
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
              {error}
            </div>
          )}


          
          
<         form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <ImageUpload
              onImagesSelected={handleImagesSelected}
              onRemoveImage={handleRemoveImage}
              maxImages={5}
            />

            {/* Existing Images */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">{t("existing_images")}</h3>
              <div className="flex gap-4 flex-wrap">
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className="relative">
                    <img
                      src={imageUrl}
                      alt="Existing Listing"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('title')}
              </label>
              <input
                type="text"
                required
                value={listing.title}
                onChange={(e) => setListing({ ...listing, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('location')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={location.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">{t('select_city')}</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                
                <select
                  value={location.district}
                  onChange={(e) => setLocation({ ...location, district: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  disabled={!location.city}
                >
                  <option value="">{t('select_district')}</option>
                  {location.city && districts[location.city]?.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('monthly_rent')}
              </label>
              <input
                type="number"
                required
                min="0"
                value={listing.price}
                onFocus={(e) => e.target.select()} 
                onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('room_type')}
              </label>
              <select
                value={listing.roomType}
                onChange={(e) => setListing({ ...listing, roomType: e.target.value as 'private' | 'shared' })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="private">{t('private_room')}</option>
                <option value="shared">{t('shared_room')}</option>
              </select>
            </div>

            {/* Available From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('available_from')}
              </label>
              <input
                type="date"
                required
                value={new Date(listing.availableFrom).toISOString().split('T')[0]}
                onChange={(e) => setListing({ ...listing, availableFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('description')}
              </label>
              <textarea
                required
                value={listing.description}
                onChange={(e) => setListing({ ...listing, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
              />
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('amenities')}
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder={t("add_amenity_placeholder")}
                />
                <Button variant="outline" size="sm" onClick={addAmenity} className="flex items-center">
                  <Plus className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t('add')}</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-slate-50 text-slate-700"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t("roommate_preferences")}</h3>
              
              {/* Gender Preference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('preferred_gender')}
                </label>
                <select
                  value={listing.preferences.gender}
                  onChange={(e) => updatePreference('gender', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="any">{t('any')}</option>
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </select>
              </div>

              {/* Age Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('age_range')}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={listing.preferences.ageRange[0]}
                    onFocus={(e) => e.target.select()} 
                    onChange={(e) => updatePreference('ageRange', [
                      Number(e.target.value),
                      listing.preferences.ageRange[1]
                    ])}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Min Age"
                  />
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={listing.preferences.ageRange[1]}
                    onFocus={(e) => e.target.select()} 
                    onChange={(e) => updatePreference('ageRange', [
                      listing.preferences.ageRange[0],
                      Number(e.target.value)
                    ])}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Max Age"
                  />
                </div>
              </div>

              {/* Occupation */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('preferred_occupation')}
                </label>
                <select
                  value={listing.preferences.occupation}
                  onChange={(e) => updatePreference('occupation', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="any">{t('any')}</option>
                  <option value="student">{t('student')}</option>
                  <option value="professional">{t('professional')}</option>
                </select>
              </div>

              {/* Lifestyle Preferences */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.smoking}
                    onChange={(e) => updatePreference('smoking', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-slate-600 mr-2"
                  />
                  {t('smoking_allowed')}
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.pets}
                    onChange={(e) => updatePreference('pets', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-slate-600 mr-2"
                  />
                  {t('pets_allowed')}
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.nightLife}
                    onChange={(e) => updatePreference('nightLife', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-700 text-slate-600 mr-2"
                  />
                  {t('night_life_friendly')}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary" 
                size="lg"
                disabled={isSaving}
              >
                {isSaving ? t("saving_changes") : t("save_changes")}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}