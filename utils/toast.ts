import toast, { Renderable, Toast, ValueOrFunction } from 'react-hot-toast';

type ToastType = {
  type?: 'success' | 'error' | 'loading' | 'info' | 'custom';
  id?: string;
  message: ValueOrFunction<Renderable, Toast>;
  duration?: number;
};

export const customToast = ({ type = 'success', message, id, duration }: ToastType) => {
  switch (type) {
    case 'success': {
      toast.success(message, {
        id,
        duration,
      });
      break;
    }
    case 'error': {
      toast.error(message, {
        id,
      });
      break;
    }
    case 'loading': {
      toast.loading(message, {
        id,
      });
      break;
    }
    case 'info': {
      toast(message, {
        id,
      });
      break;
    }
    default: {
      toast(message, {
        id,
      });
    }
  }
};
