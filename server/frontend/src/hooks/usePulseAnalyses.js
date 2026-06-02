import { useQuery } from '@tanstack/react-query';
import { getPulseAnalyses } from '../services/pulseService';

export function usePulseAnalyses() {
  return useQuery({
    queryKey:        ['pulse-analyses'],
    queryFn:         getPulseAnalyses,
    refetchInterval: 60_000,
  });
}
