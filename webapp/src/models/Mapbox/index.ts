import { FilterValues } from 'models/Recipient/Recipient';

export type Geo = {
  geometry: {
    type: string;
    coordinates: Array<number[]>;
  };
  properties: unknown;
  type: string;
};

export interface RecipientsKart extends FilterValues {
  type?: string;
  polygons?: string;
  ownerType: boolean;
}
