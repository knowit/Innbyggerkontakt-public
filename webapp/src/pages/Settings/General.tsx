import Settings from '@mui/icons-material/Settings';
import { useContext, useLayoutEffect, useState } from 'react';
import { Button, ImageUploader, Input, Text } from '../../components';
import RadioButton from '../../components/RadioButton/RadioButton';
import { ValidationRules } from '../../containers/SettingsPage/OrganizationEmblemValidationRules';
import { StoreContext } from '../../contexts';

export const General: React.FC = () => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  const [name, setname] = useState('');
  const [kommunevaapen, setKommunevaapen] = useState<string>('');
  const [warningWithoutName, setWarningWithoutName] = useState<string>('');
  const [kommunevaapenWithName, setKommunevaapenWithName] = useState<string>('');
  const [warningWithName, setWarningWithName] = useState<string>('');
  const [hovedmaalform, sethovedmaalform] = useState<string>('');
  const [nettside, setNettside] = useState<string>('');
  const [updated, setUpdated] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  useLayoutEffect(() => {
    const organization = sessionStorage.getItem('organization');
    if (organization) {
      const data = JSON.parse(organization);
      setname(data.navn || '');
      setKommunevaapen(data.kommuneVaapen || '');
      setKommunevaapenWithName(data.kommunevaapenWithName || '');
      setNettside(data.webside || '');
      sethovedmaalform(data.defaultLanguage || 'nb');
      setFeedbackText(data.feedbackText || '');
    }
  }, []);

  const submit = () => {
    const data = {
      defaultLanguage: hovedmaalform,
      kommuneVaapen: kommunevaapen,
      kommunevaapenWithName: kommunevaapenWithName,
      navn: name,
      webside: nettside,
      feedbackText: feedbackText,
    };

    dbAccess.setOrganization(sessionStorage.organizationId, data).then(() => {
      dbAccess
        .getorganization(sessionStorage.organizationId)
        .then((organization) => {
          sessionStorage.setItem('organization', JSON.stringify(organization));
        })
        .finally(() => {
          setUpdated(true);
          const interval = setInterval(() => {
            setUpdated(false);
          }, 8000);
          return () => clearInterval(interval);
        });
    });
  };

  return (
    <div className="item item--width">
      <div className="settings__header general__header">
        <Settings className="itemIcon_title" />
        <h1>Generelt </h1>
      </div>
      <form onSubmit={submit} className="settingsWrapper">
        <div className="genereltItem">
          <h3 className="regular18">Navn</h3>
          <Input
            className="userInput"
            type="text"
            info="Skriv inn navnet på kommunen"
            onChange={(e) => setname(e.target.value)}
            value={name}
          ></Input>
        </div>

        <div className="imageUploader_wrapper">
          <div className="genereltItem">
            <h3 className="regular18">Kommunevåpen uten navn </h3>
            <p className="regular14 gray">
              Kommunevåpenet bør være i formatet .png og ha transparent bakgrunn. Våpenet bør være kant i kant med
              bredden på bildet. Dette skal brukes i e-posten.
            </p>
            {warningWithoutName !== '' && <p className="regular11 error">{warningWithoutName}</p>}
            <ImageUploader
              key="kommunevaapen"
              onChange={(e: string | undefined) => setKommunevaapen(e || '')}
              setWarningMessage={(warning: string) => setWarningWithoutName(warning)}
              imageUrl={kommunevaapen}
              altText={'Kommunevåpen til ' + name}
              validation={ValidationRules}
              location="organization_emblem_without_text"
            />
          </div>
          <div className="genereltItem">
            <h3 className="regular18">Kommunevåpen med navn </h3>
            <p className="regular14 gray">
              Dersom du har et kommunevåpen med navnet til kommunen skrevet til høyre for våpenet kan du legge det til
              her. Denne filen må også være i png og ha transparent bakgrunn.
            </p>
            {warningWithName !== '' && <p className="regular11 error">{warningWithName}</p>}
            <ImageUploader
              key="kommunevaapenWithName"
              onChange={(e: string | undefined) => setKommunevaapenWithName(e || '')}
              setWarningMessage={(warning: string) => setWarningWithName(warning)}
              imageUrl={kommunevaapenWithName}
              altText={'Kommunevåpen til ' + name}
              validation={ValidationRules}
              location="organization_emblem_with_text"
            />
          </div>
        </div>

        <div className="genereltItem">
          <h3 className="regular18">Hovedmålform </h3>
          <p className="regular14 gray">
            Alle e-poster sendt fra kommunen må være skrevet på den valgte målformen. I tillegg til hovedmålformen kan
            meldingen sendes ut på andre målformer og språk.
          </p>
          <RadioButton
            onChange={(e) => sethovedmaalform(e.target.value)}
            value={'nb'}
            title={'Bokmål'}
            checked={hovedmaalform === 'nb'}
          />
          <RadioButton
            onChange={(e) => sethovedmaalform(e.target.value)}
            value={'nn'}
            title={'Nynorsk'}
            checked={hovedmaalform === 'nn'}
          />
        </div>

        <div className="genereltItem">
          <h3 className="regular18"> Nettside</h3>
          <Input
            className="userInput"
            type="text"
            info="Skriv inn lenken til kommunens nettside"
            onChange={(e) => setNettside(e.target.value)}
            value={nettside}
          />
        </div>

        <div className="genereltItem">
          <Input
            className="userInput"
            type="text"
            info="Dersom en innbygger gir tilbakemelding på en melding kommer de inn på en nettside hvor det står “Takk for tilbakemeldingen” pluss en liten tekst. Det er denne lille teksten som skal skrives inn her."
            onChange={(e) => setFeedbackText(e.target.value)}
            value={feedbackText}
          />
        </div>
        <Button className="primary" type="button" onClick={() => submit()} style={{ alignSelf: 'flex-end' }}>
          <Text className="textButton">Lagre</Text>
        </Button>
        {updated ? <Text className="textSucess">informasjonen er oppdatert.</Text> : null}
      </form>
    </div>
  );
};
export default General;
