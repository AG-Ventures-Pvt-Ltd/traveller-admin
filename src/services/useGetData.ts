import { useQuery } from '@tanstack/react-query';
import baseAPI from './baseApi';

interface queryProps {
  key: string[]
  url: string
  params?: Record<string, unknown>
}



// Accepts params for query string (e.g., pagination)
export const useGetData = ({ key, url, params = {} }: queryProps) => {

  return useQuery({
    queryKey: [...key, params],
    queryFn: () => {
      const data = baseAPI.get(url, { params });

      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
  });
};