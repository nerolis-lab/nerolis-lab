import type { BaseUser } from '../user';

export enum NotificationType {
  FriendRequest = 'FriendRequest',
  News = 'News'
}

export interface UserNotification {
  sender: BaseUser;
  receiver: BaseUser;
  template: NotificationType;
  externalId: string;
  news?: NewsNotification;
}

export interface NotificationResponse {
  notifications: UserNotification[];
}

export interface NewsNotificationRequest {
  authorExternalId: string;
  title: string;
  content: string;
}

export interface NewsNotification {
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  created_at?: string;
}
