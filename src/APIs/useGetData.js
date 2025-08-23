import { useQuery } from '@tanstack/react-query';
import baseAPI from './baseAPI';


// Accepts params for query string (e.g., pagination)
export const useGetData = (key, url, params = {}) => {
  return useQuery({
    queryKey: [...key, params],
    queryFn: async () => {
      const { data } = await baseAPI.get(url, { params });
      return data;
    }
  });
};