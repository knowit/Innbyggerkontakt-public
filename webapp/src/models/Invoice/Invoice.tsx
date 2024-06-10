export interface BrregInfo {
  orgnr: string;
  name: string;
  postnr: string;
  postcity: string;
  address: string;
}

export interface InvoiceType extends BrregInfo {
  sender_name: string;
  ref: string;
  tjeneste?: string;
}
