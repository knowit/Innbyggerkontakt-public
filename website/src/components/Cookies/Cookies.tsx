import React from 'react';
import './Cookies.scss';

export const Cookies: React.FC = () => {
  return (
    <div className="cookies">
      <h1>Informasjonskapsler</h1>
      <h2>Informasjonskapsler</h2>
      <p>
        Vi bruker informasjonskapsler på nettsiden vår. En informasjonskapsel er en liten bit med data som et nettsted
        lagrer på den besøkendes datamaskin eller mobilenhet.
      </p>
      <h2>KF Analytics og dens informasjonskapsler</h2>
      <p>
        KF Analytics er tjenesten som overvåker og evaluerer effektiviteten og virkningen av KF og KFs nettsteder, samt
        de andre nettstedene som KF er vert for i KFs datasenter.
      </p>
      <p>
        Den bruker en åpen kildekode-analyseplattform, Matomo (tidligere Piwik), som KF har full kontroll over. Denne
        plattformen gjør det mulig å beskytte sluttbrukeres personopplysninger takket være funksjoner som f.eks
        avidentifikasjon av IP-adresser. I tillegg har KF laget en funksjon for å administrere brukernes samtykke til å
        samle brukernes brukeropplevelse for anonym statistikk.
      </p>
      <h2>Informasjon om databeskyttelse og tiltak i KF Matomo Analytics</h2>
      <p>
        KF Analytics er konfigurert til å bruke kf.no-domenet på andre nivå (brukes av nettsidene til KFs tjenester) og
        lagre førsteparts informasjonskapsler.
      </p>
      <p>
        Informasjonskapslene (fra Matomo) som brukes av KF Analytics gjør det mulig for KF å spore følgende informasjon
        om besøkende. Denne informasjonen brukes til å sammenstille aggregerte statistiske rapporter om besøkendes
        aktivitet som ikke inneholder noen personlig informasjon:
      </p>
      <ul className="cookies__list">
        <li>IP-adresse (maskert, ikke hele IP-adressen);</li>
        <li>Sted: land, region, by, omtrentlig lengdegrad og breddegrad (geolokalisering);</li>
        <li>Dato og klokkeslett for forespørselen (besøk på nettstedet);</li>
        <li>Tittelen på siden som har blitt vist (sidetittel);</li>
        <li>URL til siden som vises (Side URL);</li>
        <li>URL til siden som ble vist før gjeldende side (Referrer URL);</li>
        <li>Skjermoppløsning på brukerens enhet; Tid i den lokale besøkendes tidssone;</li>
        <li>Filer klikket og lastet ned (Last ned);</li>
        <li>Lenker til et eksternt domene som ble klikket på (Outlink);</li>
        <li>
          Generering av sider (tiden det tar før nettsider genereres av webserveren og deretter lastes ned av besøkende:
          Sidehastighet); hovedspråket til nettleseren som brukes (Accept-Language header);
        </li>
        <li>
          Nettleserversjon, nettleserplugins (PDF, Flash, Java, ...), operativsystemversjon, enhetsidentifikasjon
          (User-Agent header);
        </li>
        <li>Språket på siden som er besøkt;</li>
        <li>Kampanjer;</li>
        <li>Nettstedsøk;</li>
        <li>Hendelser.</li>
      </ul>
      <p>
        For å forbedre nøyaktigheten til rapportene som produseres, lagres informasjon også i en
        førstepartsinformasjonskapsel fra nettstedet vårt og samles deretter inn av KF Analytics:
      </p>
      <ul className="cookies__list">
        <li>Tilfeldig unik besøks-ID;</li>
        <li>Tidspunktet for den spesifikke besøkendes første besøk;</li>
        <li>Tidspunktet for forrige besøk for den spesifikke besøkende;</li>
        <li>Antall besøk for den spesifikke besøkende.</li>
      </ul>
      <p>
        KF beholder full kontroll over dataene som samles inn gjennom førsteparts informasjonskapsler ved å lagre
        dataene på servere som eies og kontrolleres av KF selv.
      </p>
      <p>
        I tillegg til noen øktinformasjonskapsler, genereres en permanent informasjonskapsel med en tilfeldig ID av
        Matomo, som gjør det mulig for KF Analytics å identifisere når en bruker kommer tilbake til nettstedet. Denne
        informasjonskapselen har en utløpsdato på 13 måneder, hvoretter den automatisk fjernes fra brukerens enhet.
      </p>
      <p>
        Førsteparts informasjonskapsler er informasjonskapsler satt av nettstedet du besøker. Bare denne siden kan lese
        dem. I tillegg kan et nettsted potensielt bruke en ekstern tjeneste for å analysere hvordan folk bruker
        nettstedet deres. KF Analytics setter sin egen informasjonskapsel for å gjøre dette og bruker ikke eksterne
        parter.
      </p>
      <p>
        Vedvarende informasjonskapsler er informasjonskapsler som lagres på datamaskinen din og slettes ikke automatisk
        når du lukker nettleseren, i motsetning til en økt-informasjonskapsel som slettes når du lukker nettleseren.
        Vedvarende informasjonskapsler brukes kun til å identifisere deg på nytt ved ditt neste besøk.
      </p>
      <h2>
        Samtykke til innsamling av nettleseropplevelsen din, inkludert personlig informasjon, med det formål å kompilere
        anonym statistikk
      </h2>
      <p>
        Som standard sporer KF Analytics IKKE besøkendes nettleseropplevelse på nettstedet vårt. Du kan imidlertid velge
        å gi oss ditt samtykke til at vi skal behandle personopplysninger som samles inn under din surfing på nettstedet
        vårt, slik at vi kan utarbeide anonymisert statistikk.
      </p>
      <p>
        Hvis du aktiverer “Ikke spor”-alternativet (se nedenfor for en forklaring) i nettleseren din, respekterer vi
        valget ditt, og din nettleseropplevelse på nettstedet vårt vil ikke bli sporet for vår anonymiserte statistikk.
        Hvis du ikke har aktivert “Ikke spor”-alternativet, vil vi vise deg et informasjonskapselbanner slik at du kan
        gjøre ditt valg og installere en informasjonskapsel kalt “kf_cookie_agree” for å holde styr på valget ditt.
      </p>
      <p>
        Hvis du gir ditt samtykke til behandlingen ovenfor, aktiveres KF Analytics og noen relevante informasjonskapsler
        lastes inn. Du kan når som helst bestemme deg for å trekke tilbake samtykket ditt eller gi ditt samtykke på
        nytt.
      </p>
      <p>
        “kf_cookie_agree” utløper etter 6 måneder: Hvis “Do Not Track”-innstillingen ikke er aktivert, vil
        informasjonskapselbanneret vises igjen slik at du kan fornye valget ditt.
      </p>
      <p>
        Hvis du har deaktivert alle informasjonskapsler, vil du bli vist et informasjonskapselbanner ved hvert besøk på
        nettstedet vårt. Hvis du ønsker å gi ditt samtykke til (eller trekke tilbake ditt samtykke fra) analyse:
      </p>
      <p>AKSEPTER-knapp, NEKTE-knapp</p>
      <h2>Ikke spor-preferanser</h2>
      <p>
        Ikke spor er en funksjon som lar besøkende ikke spores av nettsteder. Ikke spor-alternativer er tilgjengelige i
        en rekke nettlesere, inkludert:
      </p>
      <ul className="cookies__list">
        <li>Firefox</li>
        <li>Internet</li>
        <li>Explorer</li>
        <li>Chrome</li>
        <li>Safari</li>
        <li>Opera</li>
      </ul>
      <h2>Begrenset tilgang til informasjon</h2>
      <p>
        All kommunikasjon av analysedata er kryptert via HTTPS-protokollen. Analyserapportene som genereres av KF
        Analytics kan bare nås via KFs autentiseringssystem av autorisert personell som arbeider med Matomo, av det
        relevante personalet hos KF eller av behørig autoriserte eksterne underleverandører, som kan være nødvendig for
        å analysere, utvikle og/eller vedlikeholde visse nettsteder med jevne mellomrom.
      </p>
      <h2>Maskering av IP-adresser</h2>
      <p>
        Merk: Institusjon, by og opprinnelsesland for statistiske formål bestemmes ut fra den fullstendige IP-adressen
        og lagres og aggregeres før en maske påføres. KF Analytics bruker en mekanisme for avidentifikasjon av
        IP-adresser som automatisk maskerer en del av hver besøkendes IP-adresse (Internet Protocol), noe som gjør det
        umulig å identifisere en bestemt Europa-besøkende kun gjennom deres IP-adresse.
      </p>
      <h2>Besøkslogger</h2>
      <p>
        KF Analytics sletter besøkendes logger automatisk etter 13 måneder. Samlede datasett som ikke inneholder
        personopplysninger lagres av KF for analyseformål på ubestemt tid.
      </p>
      <h2>Kontakt</h2>
      <p>
        Spesifikke spørsmål om lagring og bruk av KF Analytics-data eller forespørsler om ytterligere informasjon om KFs
        retningslinjer for informasjonskapsler kan sendes til <a href="mailto:kundeservice@kf.no">kundeservice@kf.no</a>
        .
      </p>
      <p>
        Hvis du har spørsmål angående behandling av personopplysninger, kan du også kontakte KF via{' '}
        <a href="mailto:kundeservice@kf.no">kundeservice@kf.no</a>.
      </p>
    </div>
  );
};
