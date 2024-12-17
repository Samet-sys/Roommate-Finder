import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Hero } from './components/home/Hero';
import { ListingCard } from './components/listings/ListingCard';
import { ListingDetail } from './components/listings/ListingDetail';
import { NewListingForm } from './components/listings/NewListingForm';
import { EditListingForm } from './components/listings/EditListingForm';
import { SearchFilters } from './components/search/SearchFilters';
import { SignInForm } from './components/auth/SignInForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProfilePage } from './components/profile/ProfilePage';
import { SettingsPage } from './components/settings/SettingsPage';
import { EmailVerification } from './components/email/EmailVerification';
import { ChatPortal } from './components/chat/ChatPortal';
import { useAuth } from './contexts/AuthContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import type { FilterOptions, Listing } from './types';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { Settings } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';

const initialFilters: FilterOptions = {
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
};

export default function App() {
  const { isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/listings');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const data = await response.json();
        setListings(data);
        setFilteredListings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    let result = [...listings];

    // Apply search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(listing => 
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower) ||
        listing.location.toLowerCase().includes(searchLower)
      );
    }

    // Apply price range filter
    result = result.filter(listing => 
      listing.price >= filters.priceRange[0] &&
      listing.price <= filters.priceRange[1]
    );

    // Apply room type filter
    if (filters.roomType.length > 0) {
      result = result.filter(listing => 
        filters.roomType.includes(listing.roomType)
      );
    }

    // Apply location filter
    if (filters.location) {
      const locationLower = filters.location.toLowerCase();
      result = result.filter(listing =>
        listing.location.toLowerCase().includes(locationLower)
      );
    }

    // Apply preference filters
    if (filters.preferences) {
      // Gender preference
      if (filters.preferences.gender !== 'any') {
        result = result.filter(listing =>
          listing.preferences.gender === 'any' || 
          listing.preferences.gender === filters.preferences.gender
        );
      }

      // Age range preference
      result = result.filter(listing =>
        listing.preferences.ageRange[0] <= filters.preferences.ageRange[1] &&
        listing.preferences.ageRange[1] >= filters.preferences.ageRange[0]
      );

      // Occupation preference
      if (filters.preferences.occupation !== 'any') {
        result = result.filter(listing =>
          listing.preferences.occupation === 'any' ||
          listing.preferences.occupation === filters.preferences.occupation
        );
      }

      // Lifestyle preferences
      if (filters.preferences.smoking !== null) {
        result = result.filter(listing => listing.preferences.smoking === filters.preferences.smoking);
      }
      if (filters.preferences.pets !== null) {
        result = result.filter(listing => listing.preferences.pets === filters.preferences.pets);
      }
      if (filters.preferences.nightLife !== null) {
        result = result.filter(listing => listing.preferences.nightLife === filters.preferences.nightLife);
      }
    }

    setFilteredListings(result);
  }, [searchTerm, filters, listings]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      fetch(`http://localhost:3000/api/auth/verify-email?token=${token}`)
        .then((res) => res.json())
        .then((data) => {
          setVerificationMessage(data.message || 'Verifying email...');
          if (data.message === 'Email successfully verified.') {
            // Redirect to the Sign-In page after a brief delay
            setTimeout(() => {
              window.location.href = '/signin';
            }, 2000);
          }
        })
        .catch(() => {
          setVerificationMessage('An error occurred while verifying your email.');
        });
    } else {
      setVerificationMessage('Invalid verification token.');
    }
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Simple client-side routing
  const path = window.location.pathname;
  const listingMatch = path.match(/^\/listing\/(.+)$/);
  const editListingMatch = path.match(/^\/listing\/(.+)\/edit$/);
  const verificationMatch = path.match(/^\/auth\/verify-email$/);

  return (
    <LanguageProvider>
      <DarkModeProvider>
        {editListingMatch ? (
          <EditListingForm listingId={editListingMatch[1]} />
        ) : listingMatch ? (
          <ListingDetail listingId={listingMatch[1]} />
        ) : path === '/signin' ? (
          <SignInForm />
        ) : path === '/register' ? (
          <RegisterForm />
        ) : path === '/profile' ? (
          <ProfilePage />
        ) : path === '/settings' ? (
          <SettingsPage />
        ) : path === '/new-listing' ? (
          <NewListingForm />
        ) : path === '/auth/verify-email' ? (
          <EmailVerification />
        ) : verificationMatch ? (
          <div>
            <h1>Email Verification</h1>
            <p>{verificationMessage || 'Verifying email...'}</p>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <Header />
            <Hero onSearch={handleSearch} />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                  <SearchFilters filters={filters} onFilterChange={setFilters} />
                </div>
                <div className="lg:col-span-3">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner />
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                  ) : filteredListings.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-600 dark:text-gray-300">No listings found matching your criteria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredListings.map((listing) => (
                        <ListingCard key={listing._id} listing={listing} />
                      ))}
                    </div>
                  )}
                </div>
                </div>
             </main>
              {isAuthenticated && <ChatPortal />}
            </div>
        )}
      </DarkModeProvider>
    </LanguageProvider>
  );
}