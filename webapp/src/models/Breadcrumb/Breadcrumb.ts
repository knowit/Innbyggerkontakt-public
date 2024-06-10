export interface Breadcrumb {
  name: string;
  url: string;
  icon: string;
  className?: string;
  onClick?: () => void;
}
