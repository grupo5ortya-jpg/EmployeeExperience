import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAlerts, markAlertAsRead } from '../services/alertService';

export function useAlerts(status) {
  return useQuery({
    queryKey: ['alerts', status ?? 'all'],
    queryFn:  () => getAlerts(status),
    refetchInterval: 30_000,
  });
}

export function useMarkAlertAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAlertAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['alerts-unread-count'] });
    },
  });
}
