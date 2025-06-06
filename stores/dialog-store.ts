import { create } from 'zustand';
import { ReactNode } from 'react';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

type DialogContent = {
  title: string;
  message?: string;
  component?: ReactNode;
  onClose?: () => void; // Custom close handler
  preventClose?: boolean; // Prevent closing when clicking outside or ESC key
  size?: DialogSize;
  maxWidth?: string; // For custom max-width
};

type DialogStore = {
  isOpen: boolean;
  content: DialogContent | null;
  open: (content: DialogContent) => void;
  close: () => void;
};

export const useDialogStore = create<DialogStore>((set, get) => ({
  isOpen: false,
  content: null,
  open: content => set({ isOpen: true, content }),
  close: () => {
    const currentContent = get().content;
    // Execute custom onClose if provided
    if (currentContent?.onClose) {
      currentContent.onClose();
    }
    // Reset dialog state
    set({ isOpen: false, content: null });
  },
}));
