import { useMutation, UseMutationResult } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import baseAPI from './baseApi';

interface Callbacks<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables, context: unknown) => void;
  onError?: (error: AxiosError, variables: TVariables, context: unknown) => void;
}

export const usePutData = <TData = unknown, TVariables = unknown>(
  url: string,
  callbacks: Callbacks<TData, TVariables> = {}
): UseMutationResult<TData, AxiosError, TVariables> => {
  return useMutation({
    mutationFn: async (putData: TVariables) => {
      const data = await baseAPI.put<TData>(url, putData);
      return data.data;
    },
    onSuccess: (data, variables, context) => {
      callbacks.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      callbacks.onError?.(error, variables, context);
    },
  });
};

export const usePatchData = <TData = unknown, TVariables = unknown>(
  url: string,
  callbacks: Callbacks<TData, TVariables> = {}
): UseMutationResult<TData, AxiosError, TVariables> => {
  return useMutation({
    mutationFn: async (patchData: TVariables) => {
      const data = await baseAPI.patch<TData>(url, patchData);
      return data.data;
    },
    onSuccess: (data, variables, context) => {
      callbacks.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      callbacks.onError?.(error, variables, context);
    },
  });
};
