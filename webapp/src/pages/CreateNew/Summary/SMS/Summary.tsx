import { useContext, useEffect, useRef, useState } from 'react';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useNavigate } from 'react-router';

import { PopUpContext } from 'contexts';
import store from 'contexts/store';

import { Button } from 'innbyggerkontakt-design-system';

import { StandardPopUp } from 'components';
import { CreateMessageError } from 'containers/CreateMessagePage/components';
import { TestSmsPopup } from 'molecules';
import { RecipientsSummary, ScheduleSummary, SMSContentSummary, SMSInvoiceSummary } from 'organisms';
import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';

import { SMSContent } from 'models';

import { sendTestSmsToUsers } from 'utils/api';
import { setFinishedBulletin } from 'utils/SMS/utils';

import './Summary.scss';
interface SummaryProps {
  onClickNext: (sendToPath?: string | undefined) => void;
}
const Summary: React.FC<SummaryProps> = ({ onClickNext }) => {
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;
  const { setPopUp } = useContext(PopUpContext);

  const navigate = useNavigate();

  const [isRecipientsFinished, setIsRecipientsFinished] = useState(false);
  const [isContentFinished, setIsContentFinished] = useState(false);
  const [isScheduleFinished, setIsScheduleFinished] = useState(false);
  const [isInvoiceFinished, setIsInvoiceFinished] = useState(false);

  const testPhoneNumber = useRef<string>('');

  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    if (isRecipientsFinished && isContentFinished && isScheduleFinished && isInvoiceFinished) {
      setFinished(true);
    } else {
      setFinished(false);
    }

    return () => {
      setFinished(false);
    };
  }, [isRecipientsFinished, isContentFinished, isScheduleFinished, isInvoiceFinished]);

  const postBulletin = (activate: boolean) => {
    if (currentBulletin?.smsContent?.nb && currentBulletinId) {
      const content: SMSContent = {
        nb: currentBulletin.smsContent.nb,
      };

      const bulletin = setFinishedBulletin(activate, currentBulletin, content);

      const summaryCleanup = () => {
        store.setBulletinId(null);
        store.setBulletin(null);
        store.setInvoice(null);
        navigate('/oversikt/hjem');
      };
      if (activate && bulletin) {
        store.dbAccess.persistBulletin(bulletin, currentBulletinId, 'draft', 'active').then(() => summaryCleanup());
      } else {
        store.dbAccess.persistBulletin(bulletin || currentBulletin, currentBulletinId).then(() => summaryCleanup());
      }
    }
  };

  const post = (activate: boolean) =>
    store.dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(activate))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  const sendTestSMS = () => {
    const phoneNumber = testPhoneNumber.current;

    if (!phoneNumber) return;
    if (!isValidPhoneNumber(phoneNumber)) {
      alert(`${phoneNumber} er ikke et gyldig telefonnummer.`);
    } else {
      const message = currentBulletin?.smsContent?.nb ?? '';
      if (message.length > 0) {
        sendTestSmsToUsers([phoneNumber], message);
      } else {
        alert('Ugyldig tekstmelding.');
      }
    }

    testPhoneNumber.current = '';
  };

  const sendPopUp = (
    <StandardPopUp
      className="noStandardIcon"
      onPopUpAccept={() => post(true)}
      acceptButtonText="Send SMS"
      cancelButton="Avbryt"
    >
      <p>Er du sikker på at du vil sette meldingen klar til utsending?</p>
    </StandardPopUp>
  );

  const testPopUp = (
    <StandardPopUp
      className="noStandardIcon"
      onPopUpAccept={sendTestSMS}
      acceptButtonText="Send test"
      cancelButton="Avbryt"
    >
      <TestSmsPopup phoneNumberRef={testPhoneNumber} />
    </StandardPopUp>
  );

  return (
    <CreateNewTemplate title={'Oppsummering'} subtitle={currentBulletin?.name}>
      <RecipientsSummary
        changeSummaryStep={() => onClickNext('mottakere')}
        setSummaryStepIsFinished={setIsRecipientsFinished}
      />
      <SMSContentSummary
        changeSummaryStep={() => onClickNext('innhold')}
        setSummaryStepIsFinished={setIsContentFinished}
      />
      <ScheduleSummary
        changeSummaryStep={() => onClickNext('tidspunkt')}
        setSummaryStepIsFinished={setIsScheduleFinished}
      />
      <SMSInvoiceSummary
        changeSummaryStep={() => onClickNext('fakturering')}
        setSummaryStepIsFinished={setIsInvoiceFinished}
      />
      <div className="sms-summary__button__wrappper">
        <Button color="tertiary" onClick={() => post(false)}>
          Lagre SMS som utkast
        </Button>
        <Button color="secondary" onClick={() => setPopUp(testPopUp)}>
          Send test SMS
        </Button>
        <Button disabled={!finished} onClick={() => setPopUp(sendPopUp)}>
          Send SMS
        </Button>
      </div>
    </CreateNewTemplate>
  );
};

export default Summary;
