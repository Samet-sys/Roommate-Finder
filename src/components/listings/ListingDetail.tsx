import React, { useState, useEffect } from 'react';
import { MapPin, Home, Calendar, ArrowLeft, Share2, Heart, Edit2, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Avatar } from '../profile/Avatar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ListingPreferences } from './ListingPreferences';
import { ImageSlider } from './ImageSlider';
import { ChatWindow } from '../chat/ChatWindow';
import { useAuth } from '../../contexts/AuthContext';
import type { Listing, Message } from '../../types';
import { ChatPortal } from '../chat/ChatPortal';
import { useTranslation } from '../../translate/useTranslations';

interface ListingDetailProps {
  listingId: string;
}

export function ListingDetail({ listingId }: ListingDetailProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInquiries, setShowInquiries] = useState(false);
  const [inquiries, setInquiries] = useState<Message[]>([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Message | null>(null);

  const isOwner = user?._id === listing?.host._id;

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/listings/${listingId}`);
        if (!response.ok) {
          throw new Error(t("error_loading_listing"));
        }
        const data = await response.json();
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error_loading_listing"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!isOwner || !listing || !user) return;

      setIsLoadingInquiries(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/messages/listing/${listingId}/inquiries`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch inquiries');
        }

        const data = await response.json();
        setInquiries(data);
      } catch (err) {
        console.error('Error fetching inquiries:', err);
      } finally {
        setIsLoadingInquiries(false);
      }
    };

    if (showInquiries) {
      fetchInquiries();
    }
  }, [isOwner, listingId, listing, user, showInquiries]);

  const handleDelete = async () => {
    if (!window.confirm(t("delete_listing"))) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(t("error_loading_listing"));
      }

      window.location.href = '/profile';
    } catch (err) {
      setError(err instanceof Error ? err.message : t("error_loading_listing"));
      setIsDeleting(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      title: 'Check out this listing!',
      text: 'Take a look at this great listing I found on RoommateFinder!',
      url: `${window.location.origin}/listing/${listingId}`,
    };

    if (navigator.share) {
      navigator
        .share(shareData)
        .catch((err) => console.error('Error sharing:', err));
    } else {
      navigator.clipboard
        .writeText(shareData.url)
        .then(() => {
          setIsModalVisible(true);
        })
        .catch((err) => {
          console.error('Failed to copy the link:', err);
        });
    }
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
          <p className="text-gray-600 dark:text-gray-300">{error || t("listing_not_found")}</p>
          <Button
            variant="primary"
            size="sm"
            className="mt-4"
            onClick={() => window.history.back()}
          >
           {t("go_back")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-950 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative">
            {/* Back Button*/}
            <button
              onClick={() => window.history.back()}
              className="hidden md:flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">{t("back_button")}</span>
            </button>
            
            {/* Logo */}
            <a
              href="/"
              className="flex items-center text-2xl font-bold text-blue-600 dark:text-slate-200 
                        md:absolute md:left-1/2 md:transform md:-translate-x-1/2 " 
            >
            <img 
              src="/site-icon.png" 
              alt="Site Icon" 
              className="w-8 h-8 mr-2"
            />
            RoommateFinder
          </a>
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isOwner ? (
                <>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => window.location.href = `/listing/${listingId}/edit`}
                    className="flex items-center"
                  >
                    <Edit2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("edit_listing")}</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">
                      {isDeleting ? t("deleting_listing") : t("delete_listing")}
                    </span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleShare} className="flex items-center">
                    <Share2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("share_button")}</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Heart className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("save_button")}</span>
                  </Button>
                </>
              )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageSlider images={listing.images} />

            {/* Listing Information */}
            <div className="bg-white dark:bg-slate-950  rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {listing.title}
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Home className="w-5 h-5 mr-2" />
                  <span className="capitalize">{t(`filters_room_${listing.roomType}`)} {t("room_type")}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{t("available_from")} {new Date(listing.availableFrom).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-lg font-semibold mb-4">{t("description")}</h2>
                <p className="text-gray-600 dark:text-gray-300">{listing.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">{t("amenities")}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {listing.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center text-gray-600 dark:text-gray-400"
                    >
                      <span className="w-2 h-2 bg-blue-600 dark:bg-slate-600 rounded-full mr-2" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              {/* Roommate Preferences Section */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-4">{t("roommate_preferences")}</h2>
                <ListingPreferences preferences={listing.preferences} />
              </div>
            </div>
          </div>

          {/* Contact and Host Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-950  rounded-lg shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ₺{listing.price}
                  <span className="text-lg text-gray-500 font-normal"> / {t("month")}</span>
                </div>
              </div>

              {/* Host Information */}
              <div className="mb-6 text-center">
                <Avatar
                  src={listing.host.avatar}
                  alt={listing.host.name}
                  size="lg"
                />
                <h3 className="font-semibold text-lg mt-4">{listing.host.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{listing.host.occupation}</p>
              </div>

              {isOwner ? (
                <Button
                  variant={showInquiries ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full mb-4 flex items-center justify-center relative"
                  onClick={() => {
                    setShowInquiries(!showInquiries);
                    setShowChat(false);
                    setSelectedInquiry(null);
                  }}
                >
                  {/* Simgeyi sola sabitledik */}
                  <MessageCircle className="absolute left-4 w-6 h-6" />
                  {/* Yazıyı ortaladık */}
                  <span>{showInquiries ? t("hide_inquiries") : t("view_inquiries")}</span>
              </Button>
              
              ) : (
                <Button
                  variant={showChat ? 'secondary' : 'primary'}
                  size="lg"
                  className="w-full mb-4 flex items-center justify-center relative"
                  onClick={() => setShowChat(!showChat)}
                >
                  <MessageCircle className="absolute left-6 w-6 h-6" />
                  <span>{showChat ? t("hide_chat") : t("contact_host")}</span>
                </Button>
              )}

              {showInquiries && isOwner && (
                <div className="mt-6">
                  <h4 className="font-medium mb-4">Recent Inquiries</h4>
                  {isLoadingInquiries ? (
                    <div className="flex justify-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : inquiries.length === 0 ? (
                    <p className="text-gray-500 text-center">{t('no_inquiries')}</p>
                  ) : (
                    <div className="space-y-4">
                      {inquiries.map((inquiry) => (
                        <div
                          key={inquiry._id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedInquiry?._id === inquiry._id
                              ? 'bg-blue-50 dark:bg-slate-300 dark:text-gray-600'
                              : 'bg-gray-50 dark:text-gray-400 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setSelectedInquiry(inquiry)}
                        >
                          <div className="flex items-center mb-2">
                            <Avatar
                              src={inquiry.sender.avatar}
                              alt={inquiry.sender.name}
                              size="sm"
                            />
                            <div className="ml-3">
                              <p className="font-medium">{inquiry.sender.name}</p>
                              <p className="text-sm text-gray-500">
                                {inquiry.sender.occupation}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm line-clamp-2">
                            {inquiry.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {((showChat && !isOwner) || (selectedInquiry && isOwner)) && (
                <div className="mt-6 rounded-lg shadow-md">
                  <ChatWindow
                    otherUser={isOwner ? selectedInquiry!.sender : listing.host}
                    listingId={listingId}
                    onBack={() => setShowChat(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <ChatPortal/>
      
      {/* Share Confirmation Modal */}
      <Modal
        isVisible={isModalVisible}
        title="Link Copied!"
        message={`The link has been successfully copied to your clipboard.`}
        onClose={() => setIsModalVisible(false)}
      />

    </div>
  );
}