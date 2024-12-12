import React, { useState, useEffect } from 'react';
import { MessageCircle, Home, X } from 'lucide-react';
import { Avatar } from '../profile/Avatar';
import { ChatWindow } from './ChatWindow';
import { useAuth } from '../../contexts/AuthContext';
import type { Message, User, Listing } from '../../types';

interface ChatThread {
  otherUser: User;
  listing: Listing;
  lastMessage: Message;
  unreadCount: number;
}

export function ChatPortal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchThreads = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/messages/threads', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch threads');
        
        const data = await response.json();
        setThreads(data);
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [user]);

  if (!user) return null;

  // Tüm unread mesajları topla
  const totalUnread = threads.reduce((sum, thread) => sum + thread.unreadCount, 0);

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors "
      >
        <MessageCircle className="w-6 h-6" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full">
            {totalUnread}
          </span>
        )}
      </button>

      {/* Chat Portal */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-lg">Messages</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="h-[500px]">
            {selectedThread ? (
              <ChatWindow
                otherUser={selectedThread.otherUser}
                listingId={selectedThread.listing._id}
                onBack={() => setSelectedThread(null)}
                showBackButton={true}
                showListingsButton={true}
              />
            ) : (
              <div className="h-full overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-2" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {threads.map((thread) => (
                      <button
                        key={`${thread.listing._id}-${thread.otherUser._id}`}
                        onClick={() => setSelectedThread(thread)}
                        className="w-full p-4 hover:bg-gray-50 flex items-start space-x-3 text-left"
                      >
                        <Avatar
                          src={thread.otherUser.avatar}
                          alt={thread.otherUser.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium truncate">
                              {thread.otherUser.name}
                            </h3>
                            {thread.unreadCount > 0 && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {thread.lastMessage.content}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Home className="w-3 h-3 mr-1" />
                            <span className="truncate">{thread.listing.title}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}