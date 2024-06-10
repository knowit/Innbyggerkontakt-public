import firebase from 'firebase/compat/app';
import { useContext, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { getRecipientsIsEmptyValue } from 'containers/CreateMessagePage/containers/SelectRecipients/searchUtil';
import { PopUpContext } from '../../../../contexts';
import { Bulletin } from '../../../../models';

import Image from 'atoms/Home/Image/Image';
import { Button, RecipientsFilter, StandardPopUp, Text } from '../../../../components';

interface Props {
  data?: firebase.firestore.DocumentData;
  cancelBulletin: () => void;
}

export const SummaryBoxEvent: React.FC<Props> = ({ data, cancelBulletin }) => {
  const navigate = useNavigate();
  const { setPopUp } = useContext(PopUpContext);
  const [eventType, setEventType] = useState<string>('');

  useLayoutEffect(() => {
    if (data?.bulletin.recipients.event.eventType)
      switch (data.bulletin.recipients.event.eventType) {
        case 'flyttingTilKommune':
          setEventType('En ny innbygger melder flytting til din kommune');
          break;
        case 'endringIAlder':
          setEventType(`Endring i alder ${data?.bulletin?.recipients.query[0].alder.age} år`); // todo: Trengs en tekst her
          break;
        case 'flyttingInnenKommune':
          setEventType('En innbygger melder flytting internt i din kommune');
          break;
        default:
          setEventType('Ikke satt');
      }
    else {
      setEventType('Det har skjedd en feil');
    }
  }, [data]);
  return (
    <div className="summaryBox">
      <div className="flexWrapper">
        <h2 className="darkBlue"> {data?.bulletin?.name}</h2>
        <div className="recipientsBlueBorder" style={{ alignSelf: 'center' }}>
          Automatisk
        </div>
      </div>
      <div className="flexWrapperNoSpace">
        <Image
          content={data?.bulletin.content}
          className="imageVertical"
          classNamePlaceholder="placeholderImageLarge"
        />
        <div className="wrapperContent">
          <p className="regular11 gray"> Emnefelt</p>
          <p>{data?.bulletin?.content.contentInLanguage[0].subject}</p>
          <p className="regular11 gray"> Sendes ut når</p>
          <p>{eventType}</p>
          {!getRecipientsIsEmptyValue(data?.bulletin.recipients as Bulletin['recipients']) && (
            <div>
              <p className="regular11 gray"> Meldingen blir sendt til disse gruppene</p>
              <RecipientsFilter filters={data?.bulletin?.recipients} />
            </div>
          )}
          <div className="buttons">
            <Button className="secondary" disabled={true}>
              <Text className="textButton">Endre</Text>
            </Button>
            <Button
              style={{ marginLeft: '2%' }}
              className="tertiary"
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage="Når du avslutter denne e-posten vil den bli lagt til i historikk og ikke lenger bli sendt ut."
                    onPopUpAccept={() => {
                      cancelBulletin();
                      navigate('/oversikt/hjem');
                    }}
                    acceptButtonText="Endre likevel"
                    cancelButton="Avbryt"
                  />,
                );
              }}
            >
              <Text className="textButton">Stopp utsending</Text>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryBoxEvent;
