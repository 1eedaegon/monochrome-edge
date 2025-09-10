import { useCallback } from 'react';
import { Toast, ToastConfig } from '@monochrome-edge/core';

export interface UseToastReturn {
  show: (config: Partial<ToastConfig>) => Toast;
  success: (message: string, title?: string, config?: Partial<ToastConfig>) => Toast;
  error: (message: string, title?: string, config?: Partial<ToastConfig>) => Toast;
  warning: (message: string, title?: string, config?: Partial<ToastConfig>) => Toast;
  info: (message: string, title?: string, config?: Partial<ToastConfig>) => Toast;
  clear: () => void;
}

export function useToast(): UseToastReturn {
  const show = useCallback((config: Partial<ToastConfig>) => {
    return Toast.show(config);
  }, []);

  const success = useCallback((message: string, title?: string, config?: Partial<ToastConfig>) => {
    return Toast.success(message, title, config);
  }, []);

  const error = useCallback((message: string, title?: string, config?: Partial<ToastConfig>) => {
    return Toast.error(message, title, config);
  }, []);

  const warning = useCallback((message: string, title?: string, config?: Partial<ToastConfig>) => {
    return Toast.warning(message, title, config);
  }, []);

  const info = useCallback((message: string, title?: string, config?: Partial<ToastConfig>) => {
    return Toast.info(message, title, config);
  }, []);

  const clear = useCallback(() => {
    Toast.clear();
  }, []);

  return { show, success, error, warning, info, clear };
}
