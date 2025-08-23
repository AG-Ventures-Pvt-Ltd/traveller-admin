import { useMutation } from '@tanstack/react-query';
import baseAPI from './baseAPI.js';


export const usePostData = (url, callbacks = {}) => {
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await baseAPI.post(url, payload);
      return data;
    },
    onSuccess: (data, variables, context) => {
      callbacks.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      callbacks.onError?.(error, variables, context);
    },
  });
};
