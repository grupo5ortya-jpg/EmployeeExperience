import { useQuery } from '@tanstack/react-query';
import { getUnreadCount } from '../services/alertService';

export function useUnreadAlerts() {
  return useQuery({
    queryKey:        ['alerts-unread-count'],
    queryFn:         getUnreadCount,
    refetchInterval: 30_000,
  });
}
