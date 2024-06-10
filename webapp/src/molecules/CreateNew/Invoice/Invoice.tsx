import store from 'contexts/store';
import { useEffect, useState } from 'react';
import { Control, Controller, DeepRequired, FieldErrorsImpl, UseFormSetValue } from 'react-hook-form';

import { ErrorMessage, Input } from 'innbyggerkontakt-design-system';

import { BrregInfo, InvoiceType } from 'models';

import { parseOrgNr } from './util';

interface InvoiceCoreProps {
  brregInfo?: BrregInfo;
  setBrregInfo: React.Dispatch<React.SetStateAction<BrregInfo | undefined>>;
  control: Control<InvoiceType, object>;
  setValue: UseFormSetValue<InvoiceType>;
  errors: FieldErrorsImpl<DeepRequired<InvoiceType>>;
}
const InvoiceCore: React.FC<InvoiceCoreProps> = ({ brregInfo, setBrregInfo, control, setValue, errors }) => {
  const dbAccess = store.dbAccess;
  const currentBulletinId = store.currentBulletinId;

  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (brregInfo) {
      Object.entries(brregInfo).forEach(([key, value]) => {
        setValue(key as keyof BrregInfo, value);
      });
    }
  }, [brregInfo]);

  useEffect(() => {
    if (currentBulletinId) {
      const fetch = async () => {
        const invoice = await dbAccess.getBulletinInvoice(currentBulletinId);
        setBrregInfo(invoice);
      };
      fetch().catch((error) => setError(error.message));
    }
  }, []);

  const fetchOrgInfo = async (orgnr: string): Promise<boolean> => {
    const noSpacesOrgnr = orgnr.replace(/\s+/g, '');
    if (noSpacesOrgnr.length === 9) {
      return await fetch(`https://data.brreg.no/enhetsregisteret/api/enheter/${noSpacesOrgnr}`)
        .then((response) => response.json())
        .then((orgInfo) => {
          if (orgInfo?.postadresse) {
            const orgInfoToFaktura: BrregInfo = {
              orgnr: orgnr,
              name: orgInfo.navn,
              postnr: orgInfo.postadresse.postnummer,
              postcity: orgInfo.postadresse.poststed,
              address: orgInfo.postadresse.adresse[0],
            };
            setBrregInfo(orgInfoToFaktura);
          } else if (orgInfo?.forretningsadresse) {
            const orgInfoToFaktura: BrregInfo = {
              orgnr: orgnr,
              name: orgInfo.navn,
              postnr: orgInfo.forretningsadresse.postnummer,
              postcity: orgInfo.forretningsadresse.poststed,
              address: orgInfo.forretningsadresse.adresse[0],
            };
            setBrregInfo(orgInfoToFaktura);
          }

          return true;
        })
        .catch(() => {
          return false;
        });
    } else {
      return false;
    }
  };
  return (
    <>
      {error && (
        <ErrorMessage
          color={'error'}
          errorTitle={'Det har skjedd en feil'}
          errorMessage={error}
          onClose={() => setError('')}
        />
      )}
      <Controller
        control={control}
        defaultValue={''}
        name="orgnr"
        render={({ field: { onChange, onBlur, ref, ...rest } }) => (
          <Input
            ref={ref}
            onChange={(e) => {
              onChange(e);
            }}
            onBlur={(e) => {
              fetchOrgInfo(e.target.value);
              onBlur();
            }}
            label={'Organisasjonsnummer'}
            id={'Organisasjonsnummer'}
            error={!!errors.orgnr?.message}
            helperText={
              errors.orgnr?.message ? errors.orgnr?.message : 'Kan også være referanse eller navn til bestiller.'
            }
            {...rest}
          />
        )}
        rules={{
          required: 'Må ha et orgnr',
          validate: {
            lessThanNine: (v) =>
              parseOrgNr(v) === 9 || `Organisasjonsnummeret skal ha 9 siffer, den har nå ${parseOrgNr(v)}`,
            error: async (v) => (await fetchOrgInfo(v)) || 'Feil orgnr',
          },
          pattern: {
            value: /^[\d ]+$/,
            message: 'Må inneholde kun tall',
          },
        }}
      />
      <Controller
        control={control}
        defaultValue={''}
        name="name"
        render={({ field: { ref, ...rest } }) => (
          <Input
            {...rest}
            ref={ref}
            label={'Virksomhetens navn'}
            id={'virksomhetens navn'}
            error={!!errors.name?.message}
            helperText={
              errors.name?.message ? errors.name?.message : 'Ofte navnet på kommunen, ikke avdeling eller lignende.'
            }
          />
        )}
        rules={{
          required: 'Må ha et navn',
        }}
      />
      <Controller
        control={control}
        defaultValue={''}
        name="postcity"
        render={({ field: { ref, ...rest } }) => (
          <Input
            {...rest}
            ref={ref}
            label={'Fakturaadresse'}
            id={'Fakturaadresse'}
            error={!!errors.postcity?.message}
            helperText={errors.postcity?.message}
          />
        )}
        rules={{
          required: 'Må ha en fakturaadresse',
        }}
      />
      <div className="invoice__address">
        <Controller
          control={control}
          defaultValue={''}
          name="address"
          render={({ field: { ref, ...rest } }) => (
            <Input
              {...rest}
              className="invoice__address--flexBasis"
              ref={ref}
              label={'Poststed'}
              id={'Poststed'}
              error={!!errors.address?.message}
              helperText={errors.address?.message}
            />
          )}
          rules={{
            required: 'Må ha et poststed',
          }}
        />
        <Controller
          control={control}
          defaultValue={''}
          name="postnr"
          render={({ field: { ref, ...rest } }) => (
            <Input
              {...rest}
              ref={ref}
              label={'Postnummer'}
              id={'Postnr'}
              type={'number'}
              error={!!errors.postnr?.message}
              helperText={errors.postnr?.message}
            />
          )}
          rules={{
            required: 'Må ha et postnummer',
            validate: {
              equal: (v) => v.length === 4 || 'Må ha 4 siffer',
            },
          }}
        />
      </div>
    </>
  );
};

export default InvoiceCore;
