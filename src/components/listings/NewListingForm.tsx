import React, { useState } from 'react';
import { MapPin, Home, Calendar, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';
import { ImageUpload } from './ImageUpload';
import { cities, districts } from '../../utils/locations';
import type { Listing } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface FormData {
  title: string;
  price: number;
  description: string;
  roomType: 'private' | 'shared';
  availableFrom: string;
  amenities: string[];
  images: File[];
  host: {
    preferences: {
      smoking: boolean;
      pets: boolean;
      nightLife: boolean;
      gender: 'any' | 'male' | 'female';
      ageRange: [number, number];
      occupation: 'any' | 'student' | 'professional';
    }
  }
}

interface LocationState {
  city: string;
  district: string;
}

const initialFormState: FormData = {
  title: '',
  price: 0,
  description: '',
  roomType: 'private',
  availableFrom: '',
  amenities: [],
  images: [],
  host: {
    preferences: {
      smoking: false,
      pets: false,
      nightLife: false,
      gender: 'any',
      ageRange: [18, 99],
      occupation: 'any'
    }
  }
};

export function NewListingForm() {
  const { token } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [newAmenity, setNewAmenity] = useState('');
  const [location, setLocation] = useState<LocationState>({ city: '', district: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const fullLocation = `${location.district}, ${location.city}`;
      const formDataToSend = new FormData();

      // Append images
      formData.images.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Append other form data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('location', fullLocation);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('roomType', formData.roomType);
      formDataToSend.append('availableFrom', formData.availableFrom);
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      formDataToSend.append('preferences', JSON.stringify(formData.host.preferences));

      const response = await fetch('http://localhost:3000/api/listings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      window.location.href = '/profile';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCityChange = (city: string) => {
    setLocation({ city, district: '' });
  };

  const addAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const handleImagesSelected = (files: File[]) => {
    setFormData({
      ...formData,
      images: [...formData.images, ...files]
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200w">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center text-2xl font-bold text-blue-600">
            <img 
                src="/site-icon.png" 
                alt="Site Icon" 
                className="w-8 h-8 mr-2"
              />
              RoommateFinder
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Listing
          </h1>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <ImageUpload
              onImagesSelected={handleImagesSelected}
              onRemoveImage={handleRemoveImage}
              maxImages={5}
            />

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Cozy Room in Downtown"
              />
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <select
                    value={location.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full pl-10 px-3 py-2 border rounded-md appearance-none"
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <select
                    value={location.district}
                    onChange={(e) => setLocation({ ...location, district: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md appearance-none"
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
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type
              </label>
              <select
                value={formData.roomType}
                onChange={(e) => setFormData({ ...formData, roomType: e.target.value as 'private' | 'shared' })}
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
                value={formData.availableFrom}
                onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
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
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows={4}
                placeholder="Describe your space, house rules, and ideal roommate..."
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
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => removeAmenity(amenity)}
                      className="ml-2 focus:outline-none"
                    >
                      <Minus className="w-3 h-3" />
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
                  value={formData.host.preferences.gender}
                  onChange={(e) => setFormData({
                    ...formData,
                    host: {
                      ...formData.host,
                      preferences: {
                        ...formData.host.preferences,
                        gender: e.target.value as 'any' | 'male' | 'female'
                      }
                    }
                  })}
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
                    value={formData.host.preferences.ageRange[0]}
                    onChange={(e) => setFormData({
                      ...formData,
                      host: {
                        ...formData.host,
                        preferences: {
                          ...formData.host.preferences,
                          ageRange: [Number(e.target.value), formData.host.preferences.ageRange[1]]
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Min Age"
                  />
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={formData.host.preferences.ageRange[1]}
                    onChange={(e) => setFormData({
                      ...formData,
                      host: {
                        ...formData.host,
                        preferences: {
                          ...formData.host.preferences,
                          ageRange: [formData.host.preferences.ageRange[0], Number(e.target.value)]
                        }
                      }
                    })}
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
                  value={formData.host.preferences.occupation}
                  onChange={(e) => setFormData({
                    ...formData,
                    host: {
                      ...formData.host,
                      preferences: {
                        ...formData.host.preferences,
                        occupation: e.target.value as 'any' | 'student' | 'professional'
                      }
                    }
                  })}
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
                    checked={formData.host.preferences.smoking}
                    onChange={(e) => setFormData({
                      ...formData,
                      host: {
                        ...formData.host,
                        preferences: {
                          ...formData.host.preferences,
                          smoking: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  Smoking allowed
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.host.preferences.pets}
                    onChange={(e) => setFormData({
                      ...formData,
                      host: {
                        ...formData.host,
                        preferences: {
                          ...formData.host.preferences,
                          pets: e.target.checked
                        }
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 mr-2"
                  />
                  Pets allowed
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.host.preferences.nightLife}
                    onChange={(e) => setFormData({
                      ...formData,
                      host: {
                        ...formData.host,
                        preferences: {
                          ...formData.host.preferences,
                          nightLife: e.target.checked
                        }
                      }
                    })}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}