import Image from 'atoms/Home/Image/Image';
import { getRecipientsIsEmptyValue } from 'containers/CreateMessagePage/containers/SelectRecipients/searchUtil';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router';
import { Button, RecipientsFilter, Text } from '../../../../components';
import { Bulletin } from '../../../../models';

interface Props {
  data: firebase.firestore.DocumentData | undefined;
  baseOnBulletin: () => void;
}

export const SummaryBoxHistory: React.FC<Props> = ({ data, baseOnBulletin }) => {
  const navigate = useNavigate();
  const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'short' };
  const timeOptions: Intl.DateTimeFormatOptions = { timeStyle: 'short' };

  return (
    <div className="summaryBox">
      <div className="flexWrapper">
        <h2 className="darkBlue"> {data?.bulletin?.name}</h2>
        <div className="recipientsBlueBorder" style={{ alignSelf: 'center' }}>
          {data?.bulletin.type === 'event' ? 'Automatisk' : 'Enkel'}
        </div>
      </div>
      <div className="flexWrapperNoSpace">
        <Image
          content={data?.bulletin?.content}
          className="imageVertical"
          classNamePlaceholder="placeholderImageLarge"
        />
        <div className="wrapperContent">
          <p className="regular11 gray"> Emnefelt</p>
          <p>{data?.bulletin?.content.contentInLanguage[0].subject}</p>
          {data?.bulletin.type === 'event' ? (
            <div>
              <p className="regular11 gray">Tidspunkt meldingen var aktiv</p>
              {`${new Date(data?.bulletin.startDate).toLocaleDateString('no-NO', dateOptions)} til ${new Date(
                data?.bulletin.endDate,
              ).toLocaleDateString('no-NO', dateOptions)}`}
            </div>
          ) : (
            <div>
              <p className="regular11 gray">Tidspunkt</p>
              {`${new Date(data?.bulletin.execution.datetime).toLocaleDateString('no-NO', dateOptions)} kl. ${new Date(
                data?.bulletin.execution.datetime,
              ).toLocaleTimeString('no-NO', timeOptions)}`}
            </div>
          )}

          {!getRecipientsIsEmptyValue(data?.bulletin.recipients as Bulletin['recipients']) && (
            <div>
              <p className="regular11 gray"> Meldingen blir sendt til disse gruppene</p>
              <RecipientsFilter filters={data?.bulletin?.recipients} />
            </div>
          )}
          <div style={{ marginTop: '30px' }}>
            <Button
              className="secondary"
              onClick={() => {
                baseOnBulletin();
                navigate(`/opprett/start`);
              }}
            >
              <Text className="textButton">Lag ny utsending basert på denne</Text>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryBoxHistory;
