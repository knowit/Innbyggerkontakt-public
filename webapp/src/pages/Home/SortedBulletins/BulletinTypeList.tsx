import firebase from 'firebase/compat/app';
import { Loading } from 'innbyggerkontakt-design-system';
import Search from 'organisms/Search/Search';
import { useEffect, useState } from 'react';
import './List.scss';
import './ListView.scss';
interface Props {
  messages: { id: string; bulletin: firebase.firestore.DocumentData }[];
  messageCount?: number;
  loading?: boolean;
  overskrift: string;
  infoText: string;
  infoTextBold?: string;
}

export const ListView: React.FC<Props> = ({ messages, loading, overskrift, infoText, infoTextBold }) => {
  const [type, setType] = useState<'search' | 'event' | 'draft' | 'finished'>('search');

  useEffect(() => {
    (() => {
      switch (overskrift) {
        case 'Planlagte meldinger':
          setType('search');
          break;
        case 'Aktive meldinger':
          setType('event');
          break;
        case 'Utkast':
          setType('draft');
          break;
        case 'Historikk':
          setType('finished');
          break;
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="semibold24 darkBlue">{overskrift}</h1>
      <p className="regular11 gray">
        {infoText} <span className="semibold11 gray">{infoTextBold}</span>
      </p>

      <div className="homepageContent">
        <div className="lightBlueBackground">
          <div className="flexWrapper homepageContent__banner">
            <span className="homepageContent__span regular18 darkBrightBlue">Statistikk</span>
            <div>
              {(() => {
                switch (overskrift) {
                  case 'Planlagte meldinger':
                    return (
                      <div className="wrapperHorizontal">
                        <span className="semibold24 darkBrightBlue">
                          {messages.length.toString() + ' '}
                          <span className="regular18 darkBrightBlue">
                            {messages.length === 1 ? 'e-post skal sendes' : 'e-poster skal sendes'}
                          </span>
                        </span>
                      </div>
                    );
                  case 'Aktive meldinger':
                    return (
                      <div className="wrapperHorizontal">
                        <span className="semibold24 darkBrightBlue">
                          {messages.length.toString() + ' '}
                          <span className="regular18 darkBrightBlue">
                            {messages.length === 1 ? 'melding er aktiv' : 'meldinger er aktive'}
                          </span>
                        </span>
                      </div>
                    );
                  case 'Utkast':
                    return (
                      <div className="wrapperHorizontal">
                        <span className="semibold24 darkBrightBlue">
                          {messages.length.toString() + ' '}
                          <span className="regular18 darkBrightBlue">e-poster er utkast</span>
                        </span>
                      </div>
                    );
                  case 'Historikk':
                    return (
                      <div className="wrapperHorizontal">
                        <span className="semibold24 darkBrightBlue">
                          {messages.length.toString() + ' '}
                          <span className="regular18 darkBrightBlue">e-poster har blitt sendt ut</span>
                        </span>
                      </div>
                    );
                }
              })()}
            </div>
          </div>
        </div>
        <div className="searchPage">
          {messages.length === 0 && !loading ? (
            <span className="regular14 gray" style={{ marginTop: '20px' }}>
              Ingen utsendinger
            </span>
          ) : loading ? (
            <Loading style={{ marginTop: '20px' }} />
          ) : (
            <Search type={type} list={messages} />
          )}
        </div>
      </div>
    </div>
  );
};
export default ListView;
