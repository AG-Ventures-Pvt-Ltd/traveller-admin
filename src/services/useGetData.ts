import { useQuery } from '@tanstack/react-query';
import baseAPI from './baseApi';

interface queryProps {
  key: string[]
  url: string
  params?: Record<string, unknown>
  enabled?: boolean
}



// Accepts params for query string (e.g., pagination)
export const useGetData = ({ key, url, params = {}, enabled = true }: queryProps) => {

  return useQuery({
    queryKey: [...key, params],
    queryFn: async () => {
      const response = await baseAPI.get(url, { params });
      return response.data;
    },
    enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,   // 5 min — data is fresh, no background refetch
    gcTime: 10 * 60 * 1000,     // 10 min — keep in cache after unmount (avoids re-fetch on navigation)
  });
};