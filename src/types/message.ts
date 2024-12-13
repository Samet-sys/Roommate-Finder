import { Listing } from './listing';
import type { User } from './user';

export interface Message {
  _id: string;
  sender: User;
  receiver: User;
  listing: Listing;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}