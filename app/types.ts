export type AppHeaderNavbarItemType = {
  label: string;
  route?: string | string[];
  isProtected?: boolean;
  comingSoon?: boolean;
  closeSheet?: () => void;
};
