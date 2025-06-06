import { create } from 'zustand';

export type PopupName = 'tokens-list' | 'new';

type PopupStore = {
  popupsOpen: PopupName[];
  openPopup: (name: PopupName) => void;
  closePopup: (name: PopupName) => void;
};

export const usePopupStore = create<PopupStore>((set, get) => ({
  popupsOpen: [],
  openPopup: (name: PopupName) => {
    const currentPopups = get().popupsOpen;
    if (!currentPopups.includes(name)) {
      set({ popupsOpen: [...currentPopups, name] });
    }
  },
  closePopup: (name: PopupName) => {
    const currentPopups = get().popupsOpen;
    if (currentPopups.includes(name)) {
      set({ popupsOpen: currentPopups?.filter(popup => popup !== name) });
    }
  },
}));
