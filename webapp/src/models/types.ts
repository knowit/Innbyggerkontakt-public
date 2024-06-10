import { ReactNode } from 'react';
import firebase from 'firebase/compat';

export type OptionType = {
  value: string;
  label: string;
};

export type LinkStatisticsData = {
  ClickedEventsCount: number;
  ClickedMessagesCount: number;
  PositionIndex: number;
  URL: string;
};

export type ValidationType = {
  metric: 'width' | 'height' | 'size' | 'type';
  metricValue: string;
  check?: 'max' | 'min';
  type: 'error' | 'warning';
  shortMessage: string;
  longMessage: string;
  shortWarningMessage?: string;
};

export interface FieldWrapperProps {
  disabled?: boolean;
  info?: string;
  mandatory?: boolean;
  title?: string;
  errorMessage?: string;
  showTitle?: boolean;
  children?: ReactNode | undefined;
  labelForId?: string;
  icon?: ReactNode;
  titleComponent?: ReactNode;
  additionalTitleClassName?: string;
}

export enum USER_ROLES {
  ADMIN = 'admin',
  USER = 'bruker',
  EDITOR = 'editor',
}

export interface UserContextType {
  role?: USER_ROLES;
  user?: firebase.User | null;
  organizationId?: string;
  organization?: Organization | null;
}

export interface Organization {
  defaultEmailAddress: string;
  defaultLanguage: string;
  feedbackText: string;
  kommuneVaapen: string;
  kommuneVaapenWithName: string;
  municipalityNumber: string;
  navn: string;
  type: string;
  webside: string;
  annet: string;
  hasSms: boolean;
  hasKart: boolean;
}

export type DeepPartial<T> = T extends unknown
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export interface OrganizationUser {
  rolle: USER_ROLES;
  orgId: string;
}
