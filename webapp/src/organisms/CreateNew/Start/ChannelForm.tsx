import { useUser } from 'hooks';
import { RadioButton } from 'innbyggerkontakt-design-system';
import { Bulletin } from '../../../models';
import CreateNewTemplate from '../../../templates/CreateNewBulletin/CreateNewTemplate';

interface ChannelProps {
  channel: Bulletin['channel'];
  setChannel: React.Dispatch<React.SetStateAction<Bulletin['channel']>>;
}

//! TODO: Remove organization check when we are ready to allow all organizations to send SMS
const ChannelForm: React.FC<ChannelProps> = ({ channel, setChannel }) => {
  const { organization } = useUser();

  return (
    <CreateNewTemplate title="Velg kanal:">
      <div className="start__radio--wrapper start__radio--wrapper--column start--margin">
        <div className="start__radio">
          <RadioButton
            value={'email'}
            label={'Email'}
            checked={channel.name === 'email'}
            onChange={() => setChannel({ ...channel, name: 'email' })}
          />
          <p
            className={`start__radio__info ${channel.name === 'email' ? 'regular14 darkBrightBlue' : 'regular14 gray'}`}
          >
            E-postutsendinger lar deg utforme tekst og bilde sammen med en valgt stil for å gi et helhetlig inntrykk og
            utsending som sendes på epost til mottakere du velger. Denne typen utsending passer best til større mengder
            informasjon, som for eksempel informasjon til nylig innflyttede i kommunen.
          </p>
        </div>
        <div className="start__radio">
          <RadioButton
            disabled={!organization?.hasSms}
            value={'sms'}
            label={'SMS'}
            checked={channel.name === 'sms'}
            onChange={() => setChannel({ name: 'sms', type: 'search' })}
          />
          <p
            className={`start__radio__info ${channel.name === 'sms' ? 'regular14 darkBrightBlue' : 'regular14 gray'} ${
              organization?.hasSms ? '' : 'start__radio__disabled'
            }`}
          >
            SMS-utsendinger lar deg sende kortere meldinger til direkte innbyggeres telefoner, men med reduserte
            utformingsmuligheter. Denne typen utsending passer bedre for mindre mengder informasjon eller påminnelser,
            som for eksempel stenging av en vei eller påminnelse om et arrangement.
            <br />
            <br />
            <span>
              NB! Når du velger SMS kommer du til å trenge å måtte betale for hver melding som sendes ut. Prisen per
              melding er 0,32kr.
            </span>
          </p>
        </div>
      </div>
    </CreateNewTemplate>
  );
};

export default ChannelForm;
