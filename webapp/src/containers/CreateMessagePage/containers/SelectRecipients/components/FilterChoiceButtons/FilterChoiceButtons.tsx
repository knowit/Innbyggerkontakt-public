import { Bulletin, FilterValues, RECIPIENT_STAGE } from '../../../../../../models';
import { RecipientsTypeItem } from '../../../../components';

interface Props {
  channel?: Bulletin['channel'];
  setActiveFilter: React.Dispatch<React.SetStateAction<FilterValues['recipientFilter']>>;
  setStage: React.Dispatch<React.SetStateAction<RECIPIENT_STAGE>>;
  hasKart?: boolean;
}

export const FilterChoiceButtons: React.FC<Props> = ({ setActiveFilter, setStage, channel, hasKart }) => (
  <>
    <RecipientsTypeItem
      overskrift="Alle i din kommune"
      infotekst="Hvis du ønsker å nå alle i din kommune. Du får valg om å også sende til de med fritidseiendom og de
      som bor der midlertidig."
      ekstraInfotekst="Nå alle som er registrert som fastboende i kommunen din. Hvis du vil nå flere enn disse kan du
      krysse av under her for å nå andre som og har tilknytning til kommunen din. Hvis en person oppfyller flere av
      kriteriene vil den fortsatt bare få én e-post."
      filterType="alle"
      onClick={() => {
        setActiveFilter('alle');
        setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
      }}
    />
    <RecipientsTypeItem
      overskrift="Folkeregisteret"
      infotekst="Folkeregisteret som har info som alder, kjønn, bostedsadresse og så videre. Bruk for eksempel for å finne alle
      under 18."
      filterType="folkeregister"
      onClick={() => {
        setActiveFilter('folkeregister');
        setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
      }}
    />
    {channel && channel.name === 'email' && (
      <>
        <RecipientsTypeItem
          overskrift="Relasjon"
          infotekst="Søk i folkeregisteret og nå de med en relasjon, for eksempel foreldre til et barn."
          filterType="relasjon"
          onClick={() => {
            setActiveFilter('relasjon');
            setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
          }}
        />
        <RecipientsTypeItem
          overskrift="Matrikkelen"
          infotekst="Matrikkelen gir informasjon om eiendommer innenfor din kommune. Bruk for eksempel for å finne folk som eier hytter."
          ekstraInfotekst="Matrikkelen gir informasjon om eiendommer innenfor din kommune. Bruk for eksempel for å finne folk som eier hytter."
          filterType="matrikkel"
          onClick={() => {
            setActiveFilter('matrikkel');
            setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
          }}
        />
        <RecipientsTypeItem
          overskrift="Egendefinert liste"
          infotekst="Dersom du har en liste med e-poster du ønsker å sende ut en melding til kan du opprette en egendefinert liste."
          ekstraInfotekst="Dersom du har en liste med e-poster du ønsker å sende ut en melding til kan du opprette en egendefinert liste."
          filterType="manual"
          onClick={() => {
            setActiveFilter('manual');
            setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
          }}
        />
        {hasKart && (
          <RecipientsTypeItem
            overskrift="Kart"
            infotekst="Kartet gir deg mulighet til å nå de som eier eiendom i kommunen din. Her kan du selv velge områder i kartet."
            filterType="kart"
            onClick={() => {
              setActiveFilter('kart');
              setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
            }}
          />
        )}
      </>
    )}
  </>
);

export default FilterChoiceButtons;
