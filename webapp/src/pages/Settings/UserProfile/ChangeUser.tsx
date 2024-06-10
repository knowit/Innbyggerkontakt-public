import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Loader, StandardPopUp, Text } from '../../../components';
import { useOrganizationUser } from '../../../containers/SettingsPage/useOrganizationUser';
import { PopUpContext, StoreContext } from '../../../contexts';
import { sendPasswordResetEmail } from '../../../utils/Firebase/firebase';

const ChangeUser: React.FC = () => {
  type ParamTypes = 'id';
  // userID
  const { id } = useParams<ParamTypes>();
  //user custom hook
  const { name, email, isAdmin, isLoading, setIsAdmin, setIsLoading } = useOrganizationUser(id as string);
  const { setPopUp } = useContext(PopUpContext);
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  const sendResetPasswordMail = (email: string) => {
    sendPasswordResetEmail(email);
  };

  const toggleAdmin = () => {
    setIsLoading(true);
    if (id) {
      dbAccess
        .updateOrganizationUser(id, sessionStorage.organizationId, isAdmin === true ? 'bruker' : 'admin')
        .then(() =>
          dbAccess.getUserInOrganization(id, sessionStorage.organizationId).then((user) => {
            setIsAdmin(user?.rolle === 'admin');
            setIsLoading(false);
          }),
        );
    } else {
      // TODO: Catch to a error-message
    }
  };

  const resetPassord = () => {
    setPopUp(
      <StandardPopUp
        popUpMessage={`Send mail med en lenke for tilbakestilling av passord til bruker: ${email}`}
        onPopUpAccept={() => sendResetPasswordMail(email)}
        acceptButtonText="Send"
        cancelButton="Avbryt"
      />,
    );
  };

  return (
    <div className="item">
      <p className="settings__header semibold24">Endre bruker</p>
      {isLoading ? (
        <Loader style={{ marginTop: '50px' }} />
      ) : (
        <div className="settingsWrapper">
          <div className="userWrapper">{name === '' ? 'Fornavn Etternavn' : name}</div>
          <div className="userWrapper">{email}</div>
          <div>
            <Button className="secondary" type="button" onClick={() => resetPassord()}>
              <Text className="textButton">Send ny passord e-post</Text>
            </Button>
            <label>
              <input type="checkbox" onChange={toggleAdmin} name="erAdmin" checked={isAdmin} style={{ margin: '1%' }} />
              Er admin
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeUser;
