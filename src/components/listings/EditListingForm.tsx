import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from './ImageUpload';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { cities, districts } from '../../utils/locations';
import type { Listing } from '../../types';
import type { ListingPreferences } from '../../types/preferences';
interface EditListingFormProps {
  listingId: string;
}

interface LocationState {
  city: string;
  district: string;
}

export function EditListingForm({ listingId }: EditListingFormProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationState>({ city: '', district: '' });
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }
        const data = await response.json();
        setListing(data);
        
        // Parse location
        const [district, city] = data.location.split(', ');
        setLocation({ city, district });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listing');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing) return;

    setIsSaving(true);
    setError(null);

    try {
      const fullLocation = `${location.district}, ${location.city}`;
      const formData = new FormData();

      // Append basic listing data
      formData.append('title', listing.title);
      formData.append('description', listing.description);
      formData.append('location', fullLocation);
      formData.append('price', listing.price.toString());
      formData.append('roomType', listing.roomType);
      formData.append('availableFrom', new Date(listing.availableFrom).toISOString());
      formData.append('amenities', JSON.stringify(listing.amenities));
      formData.append('preferences', JSON.stringify(listing.preferences));

      const response = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update listing');
      }

      window.location.href = `/listing/${listingId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Listing</h2>
          <p className="text-gray-600">{error || 'Listing not found'}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => window.history.back()}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Listing
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Listing
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={location.city}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select City</option>
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
                  <option value="">Select District</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent (₺)
              </label>
              <input
                type="number"
                required
                min="0"
                value={listing.price}
                onChange={(e) => setListing({ ...listing, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                value={listing.roomType}
                onChange={(e) => setListing({ ...listing, roomType: e.target.value as 'private' | 'shared' })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="private">Private Room</option>
                <option value="shared">Shared Room</option>
              </select>
            </div>

            {/* Available From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder="e.g., WiFi, Air Conditioning"
                />
                <Button type="button" onClick={addAmenity} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Roommate Preferences</h3>
              
              {/* Gender Preference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Gender
                </label>
                <select
                  value={listing.preferences.gender}
                  onChange={(e) => updatePreference('gender', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Age Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={listing.preferences.ageRange[0]}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Occupation
                </label>
                <select
                  value={listing.preferences.occupation}
                  onChange={(e) => updatePreference('occupation', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="any">Any</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              {/* Lifestyle Preferences */}
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.smoking}
                    onChange={(e) => updatePreference('smoking', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  Smoking allowed
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.pets}
                    onChange={(e) => updatePreference('pets', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  Pets allowed
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={listing.preferences.nightLife}
                    onChange={(e) => updatePreference('nightLife', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  Night life friendly
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
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}