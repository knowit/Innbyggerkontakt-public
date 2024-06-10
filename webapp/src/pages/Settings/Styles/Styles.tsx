import AddCircleIcon from '@mui/icons-material/AddCircle';
import Brush from '@mui/icons-material/Brush';
import firebase from 'firebase/compat/app';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StandardPopUp, Text } from '../../../components';
import { StyleItem } from '../../../containers/SettingsPage/components/StyleItem';
import { PopUpContext, StoreContext } from '../../../contexts';

type StyleDocument = { id: string; style: firebase.firestore.DocumentData };

export const Styles: React.FC = () => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const [styles, setStyles] = useState<StyleDocument[]>([]);
  const { setPopUp } = useContext(PopUpContext);

  const getStyles = () => {
    dbAccess.getAllDocumentsInCollection(sessionStorage.organizationId, 'styles').then((styleDocuments) => {
      const styles: StyleDocument[] = [];
      styleDocuments.forEach((doc) => {
        styles.push({ id: doc.id, style: doc.data() });
      });
      setStyles(styles);
    });
  };

  useEffect(() => {
    getStyles();
  }, []);

  const deleteStyle = (id: string) => {
    dbAccess.deleteDocument(sessionStorage.organizationId, 'styles', id).then(() => {
      setStyles([]);
      getStyles();
    });
  };

  return (
    <div className="item item--width">
      <div className="styles__header">
        <div className="settings__header regular14">
          <Brush className="itemIcon_title" />
          <h1>Stiler</h1>
        </div>
        <p className="regular14 darkBlue">
          Stiler bestemmer utseende på e-postene du sender ut. Her kan du bestemme farger, fonter og tekst i footer.
        </p>
      </div>

      <div className="settingsWrapper">
        <Link className="settingsWrapper__link clickableIcon" to={'/innstillinger/ny-stil'}>
          <AddCircleIcon fontSize="large" className="controlPointIcon" />
          <Text>Lag ny stil</Text>
        </Link>
        {styles
          .filter((item) => item.id !== 'colors')
          .map((item, i) => (
            <StyleItem
              id={item.id}
              key={i}
              title={item.style.name}
              deleteStyle={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage={`Er du sikker på at du vil slette stilen ${item.style.name}?`}
                    onPopUpAccept={() => deleteStyle(item.id)}
                    acceptButtonText="Slett stil"
                    cancelButton="Avbryt"
                  />,
                );
              }}
            />
          ))}
      </div>
    </div>
  );
};
export default Styles;
