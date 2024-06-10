import PopUpMessage from 'components/PopUpMessage/PopUpMessage';
import { RadioButton } from 'innbyggerkontakt-design-system';
import { useContext } from 'react';

import { PopUpContext, StoreContext } from 'contexts';
import { Bulletin } from 'models';
import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';

import './ChooseTypeForm.scss';

interface Props {
  channel: Bulletin['channel'];
  setChannel: React.Dispatch<React.SetStateAction<Bulletin['channel']>>;
}
type EmailType = 'search' | 'event';

const ChooseTypeForm: React.FC<Props> = ({ setChannel, channel }) => {
  const { setPopUp } = useContext(PopUpContext);

  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;

  const changeType = (channel: Bulletin['channel']) => {
    if (currentBulletin) {
      const bulletin: Bulletin = {
        type: currentBulletin.channel.type,
        channel: currentBulletin.channel,
        status: currentBulletin.status,
        sandboxMode: currentBulletin.sandboxMode,
        name: currentBulletin.name,
        kommunenummer: currentBulletin.kommunenummer,
        content: currentBulletin.content,
        templateApplicationStyleId: currentBulletin.templateApplicationStyleId,
      };
      store.setBulletin(bulletin);
      dbAccess.persistBulletin(bulletin, currentBulletinId);
      setChannel(channel);
    }
  };

  const changeTypeWarning = (channelType: EmailType): void => {
    if (currentBulletinId && currentBulletin?.basedOn?.type === 'bulletin' && channel.name === 'email') {
      setPopUp(
        <PopUpMessage
          popUpMessage="Du er i ferd med å endre utsendingstype, noe som vil medføre at stegene etter navngi, unntatt utseende og innhold, vil bli slettet"
          onPopUpAccept={() => changeType({ ...channel, type: channelType })}
          acceptButtonText="Endre likevel"
          cancelButton="Avbryt"
          popUpTitle={'Endre utsendingstype'}
        />,
      );
    } else if (channel.name === 'email') {
      setChannel({ ...channel, type: channelType });
    } else if (channel.name === 'sms') {
      setChannel({ ...channel, type: 'search' });
    }
  };

  return (
    <CreateNewTemplate title="Velg type:">
      <div className="start__radio--wrapper start--margin">
        <div className="start__radio">
          <RadioButton
            onChange={(e) => {
              changeTypeWarning(e.target.value as EmailType);
            }}
            value={'search'}
            label={'Enkel'}
            checked={channel.type === 'search'}
          />
          <p
            className={`start__radio__info ${
              channel.type === 'search' ? 'regular14 darkBrightBlue' : 'regular14 gray'
            }`}
          >
            Sendes én gang til de innbyggerne du ønsker å nå.
          </p>
        </div>

        <div className="start__radio">
          <RadioButton
            onChange={(e) => {
              changeTypeWarning(e.target.value as EmailType);
            }}
            disabled={channel.name === 'sms'}
            value={'event'}
            label={'Automatisk'}
            checked={channel.name === 'email' && channel.type === 'event'}
          />
          <p
            className={`start__radio__info ${
              channel.name === 'email' && channel.type === 'event' ? 'regular14 darkBrightBlue' : 'regular14 gray'
            } ${channel.name === 'sms' && 'automatisk__radio--disabled'}`}
          >
            Denne meldingen sendes hver gang en gitt hendelse finner sted. Ikke kompatibel med SMS.
          </p>
        </div>
      </div>
    </CreateNewTemplate>
  );
};

export default ChooseTypeForm;
