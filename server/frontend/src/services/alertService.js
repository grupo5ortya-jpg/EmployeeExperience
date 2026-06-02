import apiClient from './apiClient';

export const getAlerts = (status) =>
  apiClient.get('/alerts', { params: status ? { status } : {} }).then((r) => r.data);

export const getUnreadCount = () =>
  apiClient.get('/alerts/unread-count').then((r) => r.data.count);

export const markAlertAsRead = (id) =>
  apiClient.patch(`/alerts/${id}/read`).then((r) => r.data);
