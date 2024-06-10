/* used in both homepage and create new*/
import store from 'contexts/store';
import { useLayoutEffect, useState } from 'react';

import { Loader } from 'components';
import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';

import { InvoiceType } from 'models';

import { SummaryProps } from 'organisms/CreateNew/Summary/types';
import './SMSInvoiceSummary.scss';

const SMSInvoiceSummary: React.FC<SummaryProps> = ({ changeSummaryStep, setSummaryStepIsFinished }) => {
  const invoice = store.invoice;
  const currentBulletinId = store.currentBulletinId;

  const checkIfInvoiceIsDone = (invoice: InvoiceType): boolean => {
    const invoiceCopy = Object.keys(invoice).filter((key) => key !== 'tjeneste');
    const invoiceIsTrue = Object.values(invoiceCopy).every((value) => !!value);
    return invoiceIsTrue;
  };

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useLayoutEffect(() => {
    if (currentBulletinId && !store.invoice) {
      store.dbAccess
        .getBulletinInvoice(currentBulletinId)
        .then((invoice) => {
          if (invoice) {
            store.setInvoice(invoice);
          }
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  useLayoutEffect(() => {
    if (invoice) {
      setSummaryStepIsFinished?.(checkIfInvoiceIsDone(invoice));
    }

    return () => {
      setSummaryStepIsFinished?.(false);
    };
  }, [invoice]);

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <SummaryItem overskrift="Faktura" finished={!!invoice} buttonProps={{ onClick: changeSummaryStep }}>
          <div className="smsInvoice">
            <div className="smsInvoice__row">
              <span>
                Organisasjonsnummer: <p>{invoice?.orgnr}</p>
              </span>
              <span>
                Virksomhetens navn: <p>{invoice?.name}</p>
              </span>
            </div>
            <div className="smsInvoice__row">
              <span>
                Fakturaadresse: <p>{invoice?.address}</p>
              </span>
              <span>
                Poststed: <p>{invoice?.postnr}</p>
              </span>
            </div>
            <div className="smsInvoice__row">
              <span>
                Navn på bestiller: <p>{invoice?.sender_name}</p>
              </span>
              <span>
                Referanse: <p>{invoice?.ref}</p>
              </span>
            </div>
            {invoice?.tjeneste && (
              <div className="smsInvoice__row">
                <span>
                  Tjeneste: <p>{invoice?.tjeneste}</p>
                </span>
              </div>
            )}
          </div>
        </SummaryItem>
      )}
    </>
  );
};

export default SMSInvoiceSummary;
