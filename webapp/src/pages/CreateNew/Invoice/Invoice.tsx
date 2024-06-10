import { ErrorMessage, Input } from 'innbyggerkontakt-design-system';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { CreateMessageError, NavigationButton } from 'containers/CreateMessagePage/components';
import { InvoiceCore } from 'molecules';

import { PopUpContext } from 'contexts';
import store from 'contexts/store';
import { BrregInfo, InvoiceType } from 'models';

import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';
import './Invoice.scss';

interface InvoiceProps {
  onClickNext: () => void;
}
const Invoice: React.FC<InvoiceProps> = ({ onClickNext }) => {
  const { setPopUp } = useContext(PopUpContext);

  const dbAccess = store.dbAccess;
  const currentBulletinId = store.currentBulletinId;

  const navigate = useNavigate();

  const [brregInfo, setBrregInfo] = useState<BrregInfo>();
  const [error, setError] = useState<string>('');

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<InvoiceType>({
    defaultValues: {
      sender_name: '',
      ref: '',
      tjeneste: '',
    },
    shouldFocusError: true,
    mode: 'onChange',
  });

  const postInvoice = (data: InvoiceType): void => {
    if (currentBulletinId) {
      const invoice: InvoiceType = {
        ...data,
        tjeneste: data.tjeneste ? data.tjeneste : '',
      };
      store.setInvoice(invoice);
      dbAccess.addBulletinInvoice(currentBulletinId, invoice);
      onClickNext();
    } else {
      setError('Det har skjedd en feil, vannligst kontakt vår support');
    }
  };

  const post = (data: InvoiceType) => {
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postInvoice(data))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );
  };
  return (
    <CreateNewTemplate
      title={'Fakturering'}
      subtitle={
        'Siden dette er første gang det blir sendt ut SMS fra denne kommunen, er du nødt til å fylle ut felter som lar oss sende faktura riktig sted etter utsendingen har blitt sendt ut. Mesteparten av denne informasjonen vil bli lagret til neste utsending, så du slipper å fylle det ut hver gang. Du vil også kunne endre på feltene i innstillinger senere.'
      }
    >
      <form className="invoice" onSubmit={handleSubmit(post)}>
        <div className="invoice--gap invoice--flex">
          <div className="invoice__input__wrapper">
            <InvoiceCore
              brregInfo={brregInfo}
              setBrregInfo={setBrregInfo}
              control={control}
              setValue={setValue}
              errors={errors}
            />
            <Controller
              control={control}
              name="sender_name"
              render={({ field: { ref, ...rest } }) => (
                <Input
                  {...rest}
                  ref={ref}
                  label={'Navn på bestiller'}
                  id={'Bestillernavn'}
                  error={!!errors.sender_name?.message}
                  helperText={
                    errors.sender_name?.message
                      ? errors.sender_name?.message
                      : 'Navnet på den som utfører bestillingen. Hentet fra brukersiden din i innstillinger.'
                  }
                />
              )}
              rules={{
                required: 'Må ha et bestillernavn',
              }}
            />
            <Controller
              control={control}
              name="ref"
              render={({ field: { ref, ...rest } }) => (
                <Input
                  {...rest}
                  ref={ref}
                  label={'Referanse'}
                  id={'referanse'}
                  error={!!errors.ref?.message}
                  helperText={errors.ref?.message ? errors.ref?.message : 'Ofte bestillernummer eller lignende.'}
                />
              )}
              rules={{
                required: 'Må ha en referanse',
              }}
            />
            <Controller
              control={control}
              name="tjeneste"
              render={({ field: { ref, ...rest } }) => (
                <Input
                  {...rest}
                  ref={ref}
                  label={'Tjenesteområde (Valgfri)'}
                  id={'Tjenesteområde'}
                  helperText={'Hvilket tjenesteområde tilhører utsendingen? '}
                />
              )}
            />
          </div>
          {error && (
            <ErrorMessage
              color={'error'}
              errorTitle={'Det har skjedd en feil'}
              errorMessage={error}
              onClose={() => setError('')}
            />
          )}
          <NavigationButton />
        </div>
      </form>
    </CreateNewTemplate>
  );
};

export default Invoice;
