import { Image } from 'atoms';
import { getRecipientsIsEmptyValue } from 'containers/CreateMessagePage/containers/SelectRecipients/searchUtil';
import firebase from 'firebase/compat/app';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { Button, RecipientsFilter, StandardPopUp, Text } from '../../../../components';
import { PopUpContext } from '../../../../contexts';
import { Bulletin } from '../../../../models';

interface Props {
  data: firebase.firestore.DocumentData | undefined;
  bulletinId: string;
  setBulletinToDraft: () => void;
  isDraft: boolean;
}

export const SummaryBoxSearch: React.FC<Props> = ({ data, setBulletinToDraft, isDraft }) => {
  const navigate = useNavigate();
  const { setPopUp } = useContext(PopUpContext);
  const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'short' };
  const timeOptions: Intl.DateTimeFormatOptions = { timeStyle: 'short' };

  return (
    <div className="summaryBox">
      <div className="flexWrapper">
        <h2 className="darkBlue"> {data?.bulletin?.name}</h2>
        <div className="recipientsBlueBorder" style={{ alignSelf: 'center' }}>
          Enkel
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
          <p>{data?.bulletin?.content?.contentInLanguage[0].subject}</p>

          {!isDraft && data?.bulletin?.execution.datetime && (
            <p className="" style={{ maxWidth: '80%' }}>
              <p className="regular11 gray"> Tidspunkt</p>
              {new Date(data?.bulletin.execution.datetime).toLocaleDateString('no-NO', dateOptions)} kl.{' '}
              {new Date(data?.bulletin.execution.datetime).toLocaleTimeString('no-NO', timeOptions)}
            </p>
          )}
          {!getRecipientsIsEmptyValue(data?.bulletin.recipients as Bulletin['recipients']) && (
            <div>
              <p className="regular11 gray"> Meldingen blir sendt til disse gruppene</p>
              <RecipientsFilter filters={data?.bulletin?.recipients} />
            </div>
          )}

          <div className="buttons">
            <Button
              className="secondary"
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage="Når du skal endre på denne e-posten vil den bli til en kladd og du vil derfor måtte sette
                        tidspunktet for utsending på nytt"
                    onPopUpAccept={() => {
                      setBulletinToDraft();
                      navigate(`/opprett/start`);
                    }}
                    acceptButtonText="Endre likevel"
                    cancelButton="Avbryt"
                  />,
                );
              }}
            >
              <Text className="textButton">Endre</Text>
            </Button>
            <Button
              style={{ marginLeft: '2%' }}
              className="tertiary"
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage="Dette valget vil stoppe denne utsendingen og legge den i kladd listen og du vil derfor måtte
                        sette tidspunktet for utsending på nytt"
                    onPopUpAccept={() => {
                      setBulletinToDraft();
                      navigate('/oversikt');
                    }}
                    acceptButtonText="Stopp utsending"
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

export default SummaryBoxSearch;
