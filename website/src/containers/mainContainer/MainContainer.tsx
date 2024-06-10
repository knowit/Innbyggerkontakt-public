import React, { useEffect, useState } from 'react';
import { ConsentModal } from 'innbyggerkontakt-design-system';

import Footer from '../../components/footer/Footer';
import Navbar from '../../components/navbar/Navbar';
import '../../styles/index.scss';
import './MainContainer.scss';
import { Link } from 'gatsby';

interface Props {
  children: React.ReactNode;
  pagename?: string;
}

const MainContainer: React.FC<Props> = ({ children, pagename }: Props) => {
  const [showPopup, setShowPopup] = useState<boolean>(false);

  useEffect(() => {
    const showPopup = localStorage.getItem('analyticsReponseGiven');
    if (showPopup) {
      setShowPopup(false);
    } else {
      setShowPopup(true);
    }
  }, []);

  const handleConsent = () => {
    setShowPopup(false);
    localStorage.setItem('analyticsReponseGiven', 'true');
  };

  const giveConsent = () => {
    const _paq = (window._paq = window._paq || []);
    _paq.push(['rememberConsentGiven']);
  };

  const removeConsent = () => {
    const _paq = (window._paq = window._paq || []);
    _paq.push(['forgetConsentGiven']);
  };

  return (
    <>
      <Navbar pagename={pagename} />
      {showPopup && (
        <div className="consentWrapper">
          <ConsentModal
            className="consentModal"
            infoText={
              <>
                Når du besøker denne siden, vil vi gjerne samle inn data dersom du gir oss tillatelse til det. Dersom vi
                får tillatelse vil vi samle inn statistikk for å forbedre våre tjenester, huske dine valg for senere
                besøk på denne siden samt benytte informasjonen vi henter inn til markedsføring. Hvis du ikke ønsker
                dette, vil vi kun huske ditt valg om å ikke lagre informasjon. Her kan du lese mer om{' '}
                <Link to="/personvern">informasjonskapsler og personvererklæring.</Link>
              </>
            }
            headerText={'Innbyggerkontakt.no bruker informasjonskapsler'}
            onClose={() => {
              handleConsent();
              removeConsent();
            }}
            onSave={() => {
              handleConsent();
              giveConsent();
            }}
          />
        </div>
      )}
      <div className="content">{children}</div>
      <Footer />
    </>
  );
};

export default MainContainer;
