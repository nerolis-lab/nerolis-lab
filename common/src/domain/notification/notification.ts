import type { BaseUser } from '../user';

export enum NotificationType {
  FriendRequest = 'FriendRequest',
  News = 'News'
}

export interface UserNotification {
  sender: BaseUser;
  receiver: BaseUser;
  template: NotificationType;
}

export interface NotificationResponse {
  notifications: UserNotification[];
}
