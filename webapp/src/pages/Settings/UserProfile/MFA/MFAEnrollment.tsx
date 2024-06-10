import Add from '@mui/icons-material/Add';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import parsePhoneNumber, {
  AsYouType,
  ParseError,
  parsePhoneNumberWithError,
  PhoneNumber,
} from 'libphonenumber-js/mobile';
import { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Input, Text } from '../../../../components';
import { FirebaseContext } from '../../../../utils/Firebase';
import {
  createMultifactorAssertion,
  getEnrollmentVerificationId,
  MFAVerifier,
} from '../../../../utils/Firebase/firebase';
import { MFAEnrollmentState, MFAPropTypes } from './types';

type EnrollmentAction =
  | { type: 'PHONE_NUMBER_VERIFIED' }
  | { type: 'PHONE_NUMBER_VALID'; payload: boolean }
  | { type: 'PHONE_NUMBER_UPDATED'; payload: string }
  | { type: 'MFA_CODE_SENT'; payload: { id: string } }
  | { type: 'MFA_CODE_INPUT_UPDATED'; payload: string }
  | { type: 'MFA_CODE_SUBMITTED' }
  | { type: 'MFA_ENABLED'; payload: boolean }
  | { type: 'RESET_MFA_FLOW' };

const initialState: MFAEnrollmentState = {
  phonenumberValid: false,
  phonenumber: '',
  mfaVerificationId: '',
  mfaCode: '',
  mfaEnabled: false,
};

const MFAReducer = (prevState: MFAEnrollmentState, action: EnrollmentAction) => {
  switch (action.type) {
    case 'PHONE_NUMBER_VALID':
      return {
        ...prevState,
        phonenumberValid: action.payload,
      };
    case 'PHONE_NUMBER_UPDATED':
      return {
        ...prevState,
        phonenumber: action.payload,
      };
    case 'MFA_CODE_SENT':
      return {
        ...prevState,
        mfaVerificationId: action.payload.id,
      };
    case 'MFA_CODE_SUBMITTED':
      return {
        ...prevState,
      };
    case 'MFA_CODE_INPUT_UPDATED':
      return {
        ...prevState,
        mfaCode: action.payload,
      };
    case 'MFA_ENABLED':
      return {
        ...prevState,
        mfaEnabled: action.payload,
      };
    case 'RESET_MFA_FLOW':
      return {
        ...initialState,
      };
    default:
      return {
        ...prevState,
      };
  }
};

export const MFAEnrollment: React.FC<MFAPropTypes> = ({ onError }) => {
  const firebase = useContext(FirebaseContext);
  const navigate = useNavigate();
  const user = firebase.user;
  const [state, dispatch] = useReducer(MFAReducer, initialState);
  const [renderCaptcha, setRenderCaptcha] = useState<boolean>(false);
  const MfaVerifier = new MFAVerifier(
    getEnrollmentVerificationId('mfa-captcha', {
      size: 'invisible',
      'expired-callback': () => {
        dispatch({ type: 'RESET_MFA_FLOW' });
      },
    }),
  );

  const [parsedE164Number, setParsedE164Number] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /**
   * Generates errormessages from a parsed phonenumber.
   * A possible phonenumber checks only legit lengths
   * TODO: Could also generate warning messages if it's
   * e.g. not a phone number.
   * Warning: errorMessage is currently not used.
   * @param parsed A PhoneNumber from libphonenumber-js
   */
  function generateParsedErrorMessages(parsed: PhoneNumber) {
    if (!parsed.isPossible()) {
      if (parsed.number.length > 11) {
        setErrorMessage('Telefonnummeret er for langt');
      } else if (parsed.number.length < 11) {
        setErrorMessage('Telefonnummeret er for kort');
      }
    } else if (!parsed.isValid()) {
      if (parsed.getType() !== 'MOBILE') {
        setErrorMessage('Telefonnummeret er ikke et mobilnummber');
      } else {
        setErrorMessage('Telefonnummeret er ugyldig');
      }
    } else {
      //Valid mobile number
      setErrorMessage('');
    }
  }

  /**
   * Tests if a string generates errors.
   * Warning: errorMessage is currently not used.
   * @param numberString A string of numbers e.g: '815 493 00'
   */
  function generateNonParsebleErrors(numberString: string) {
    try {
      parsePhoneNumberWithError(numberString, 'NO');
    } catch (error) {
      if (error instanceof ParseError) {
        // Not a phone number, non-existent country, etc.
        const translation: Record<string, string> = {
          NOT_A_NUMBER: 'Ikke et nummer',
          INVALID_COUNTRY: 'Feil landskode',
          TOO_SHORT: 'For kort',
          TOO_LONG: 'Alt for langt!',
        };
        setErrorMessage(translation[error.message]);
      } else {
        throw error;
      }
    }
  }

  const onPhoneInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    //dispatch({ type: 'PHONE_NUMBER_UPDATED', payload: event.currentTarget.value });
    dispatch({ type: 'PHONE_NUMBER_UPDATED', payload: new AsYouType('NO').input(event.currentTarget.value) });
    generateNonParsebleErrors(event.currentTarget.value);

    const parsed = parsePhoneNumber(event.currentTarget.value, 'NO');
    if (parsed) {
      generateParsedErrorMessages(parsed);
      if (parsed.isValid()) {
        setParsedE164Number(parsed.number.toString());
        dispatch({ type: 'PHONE_NUMBER_VALID', payload: true });
        return;
      }
    }
    setParsedE164Number('');
    dispatch({ type: 'PHONE_NUMBER_VALID', payload: false });
  };

  useEffect(() => {
    if (renderCaptcha) {
      user?.multiFactor
        .getSession()
        .then((multiFactorSession) => MfaVerifier.apply(multiFactorSession, parsedE164Number))
        .then((id) => dispatch({ type: 'MFA_CODE_SENT', payload: { id } }))
        .catch((error) => {
          setRenderCaptcha(false);
          dispatch({ type: 'RESET_MFA_FLOW' });
          onError(error);
        });
    }
  }, [renderCaptcha]);

  return (
    <div className="item item--width">
      <Add className="itemIcon_title" />
      <div className="settings__header regular14">
        <h1>Beskytt kontoen din med to-faktor authentisering</h1>
        <p>Du vil da trenge passordet ditt og en kode fra sms når du skal logge deg på innbyggerkontakt</p>
      </div>
      <form className="settingsWrapper">
        <div>
          <Input
            type="tel"
            autoComplete="tel"
            id="mfa-auth-phonenum"
            value={state.phonenumber}
            info="OBS: Er det utenlandsk nummer husk landskode +xx"
            onChange={onPhoneInputChange}
            disabled={state.mfaVerificationId !== ''}
            errorMessage={errorMessage}
            titleComponent={
              <Text className="multifactor__input-title-container">
                <h2 className="multifactor__input-title">Steg 1</h2>
                <p>Legg til telefonnummeret ditt</p>
              </Text>
            }
            autoFocus
          />
          {/* When Chrome Autofill a password it fills in the pw field and the username in the field directly above*/}
          {/* This is a workaround to make chrome NOT fill in username into the telephone field*/}
          <input type="email" name="email" id="email" value="" style={{ width: 0, height: 0, opacity: 0 }} />
          <Button
            className="multifactor__input-button multifactor__input-button--center"
            type="button"
            disabled={!state.phonenumberValid || state.mfaEnabled || state.mfaVerificationId !== ''}
            onClick={() => setRenderCaptcha(true)}
          >
            <span>Send meg koden</span>
          </Button>
          {renderCaptcha && !state.mfaEnabled && <div id="mfa-captcha" />}
        </div>
        {state.mfaVerificationId && (
          <div className="multifactor__input">
            <Input
              type="tel"
              id="mfa-auth-code"
              value={state.mfaCode}
              valueValidationFunc={(value) => value || ''}
              disabled={state.mfaEnabled}
              onChange={(event) => dispatch({ type: 'MFA_CODE_INPUT_UPDATED', payload: event.target.value })}
              titleComponent={
                <Text className="multifactor__input-title-container">
                  <h2 className="multifactor__input-title">Steg 2</h2>
                  <p>Skriv inn koden du mottok på sms</p>
                </Text>
              }
              autoFocus
            />

            <Button
              className="multifactor__input-button multifactor__input-button--center"
              type="button"
              disabled={state.mfaEnabled}
              onClick={() => {
                user?.multiFactor
                  .enroll(createMultifactorAssertion(state.mfaVerificationId, state.mfaCode), 'phone')
                  .then(() => dispatch({ type: 'MFA_ENABLED', payload: true }))
                  .catch((reason) => {
                    console.error(reason);
                    setRenderCaptcha(false);
                    dispatch({ type: 'RESET_MFA_FLOW' });
                  });
              }}
            >
              <span>Bekreft koden</span>
            </Button>
          </div>
        )}
        {state.mfaEnabled && (
          <>
            <Text className="multifactor__info multifactor__info--center mt-1.5 mb-1.5 ">
              <CheckCircle />
              <p>To-faktor autentisering er satt opp</p>
            </Text>
            <Button
              className="multifactor__navigate-button multifactor__navigate-button--center multifactor__navigate-button--tertiary"
              onClick={() => navigate('/oversikt/hjem')}
            >
              <ChevronLeft />
              <span>Tilbake til oversikten</span>
            </Button>
          </>
        )}
      </form>
    </div>
  );
};
export default MFAEnrollment;
