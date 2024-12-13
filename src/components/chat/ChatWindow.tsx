// src/components/ChatWindow.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../profile/Avatar';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import type { Message, User } from '../../types';

interface ChatWindowProps {
  otherUser: User;
  listingId: string;
  onBack: () => void;
  showBackButton?: boolean;
  showListingsButton?: boolean;
}

export function ChatWindow({
  otherUser,
  listingId,
  onBack,
  showBackButton = false,
  showListingsButton = false,
}: ChatWindowProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !otherUser) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/messages/${listingId}/${otherUser._id}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch messages');

        const data: Message[] = await response.json();
        setMessages(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Mesajları Okundu Olarak İşaretle
    const markMessagesAsRead = async () => {
      try {
        await fetch(
          `http://localhost:3000/api/messages/read/${otherUser._id}`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();

    // Socket event listeners
    const handleNewMessage = (message: Message) => {
      if (
        (message.sender._id === otherUser._id && message.receiver._id === user._id) ||
        (message.sender._id === user._id && message.receiver._id === otherUser._id)
      ) {
        setMessages((prev) => [...prev, message]);

        // Eğer mesajı gönderen diğer kullanıcıysa, mesajları okundu olarak işaretle
        if (message.sender._id === otherUser._id) {
          markMessagesAsRead();
        }
      }
    };

    socket?.on('newMessage', handleNewMessage);

    return () => {
      socket?.off('newMessage', handleNewMessage);
    };
  }, [user, otherUser, listingId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !user) return;

    const messageData = {
      receiver: otherUser._id,
      listing: listingId,
      content: newMessage.trim(),
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoToListing = () => {
    window.location.href = `/listing/${listingId}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="relative p-4 bg-gray-100 dark:bg-gray-900  flex justify-center items-center">
        {/* Conditionally Render Back Button */}
        {showBackButton && (
          <button
            onClick={onBack}
            className="absolute left-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        )}

        {/* Avatar and Contact Info */}
        <div className="flex flex-col items-center justify-center mx-auto">
          <Avatar src={otherUser.avatar} alt={otherUser.name} size="sm" />
          <div className="text-center">
            <h3 className="font-medium">{otherUser.name}</h3>
          </div>
        </div>

        {/* Go to Listing Button */}
        {showListingsButton && (
          <button
            onClick={handleGoToListing}
            className="absolute right-4 flex items-center text-blue-600 hover:text-blue-800 font-semibold"
          >
            Listing
            <Home className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender._id === user._id;
          return (
            <div
              key={message._id} // Unique key kullanımı
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  isOwnMessage
                    ? 'bg-blue-600 dark:bg-slate-200 text-white dark:text-slate-950'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-75 mt-1 block">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 text-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 resize-none border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-slate-500"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
