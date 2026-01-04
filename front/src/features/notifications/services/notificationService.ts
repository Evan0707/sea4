import api from '@/shared/api/client';
import type { Notification } from '../types';

export const notificationService = {
 getAll: async () => {
  const response = await api.get<Notification[]>('/notifications');
  return response.data;
 },

 getUnreadCount: async () => {
  const response = await api.get<{ count: number }>('/notifications/unread-count');
  return response.data.count;
 },

 markAsRead: async (id: number) => {
  const response = await api.patch<Notification>(`/notifications/${id}/read`);
  return response.data;
 },

 markAllAsRead: async () => {
  const response = await api.patch<{ message: string; count: number }>('/notifications/read-all');
  return response.data;
 }
};
