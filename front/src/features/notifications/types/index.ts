export interface NotificationData {
 [key: string]: any;
}

export interface Notification {
 id: number;
 type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM';
 title: string;
 message: string;
 data: NotificationData;
 isRead: boolean;
 readAt?: string;
 createdAt: string;
 expiresAt?: string;
}

export interface NotificationState {
 items: Notification[];
 unreadCount: number;
 loading: boolean;
}
