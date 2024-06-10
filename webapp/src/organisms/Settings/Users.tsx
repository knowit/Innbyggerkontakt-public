import AddCircle from '@mui/icons-material/AddCircle';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Create from '@mui/icons-material/Create';
import Person from '@mui/icons-material/Person';
import firebase from 'firebase/compat/app';
import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Loader, StandardPopUp, Text } from '../../components';
import UserItem from '../../containers/SettingsPage/components/UserItem/UserItem';
import { PopUpContext, StoreContext } from '../../contexts';
import * as api from '../../utils/api';
import { FirebaseContext } from '../../utils/Firebase';

export const Users: React.FC = () => {
  const navigate = useNavigate();
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);
  const firebase = useContext(FirebaseContext);

  const dbAccess = store.dbAccess;

  const currentUser = firebase.user;
  const email = currentUser?.email || '';

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [userDoc, setuserDoc] = useState<firebase.firestore.DocumentData>();
  const [edit, setEdit] = useState(true);
  const [updated, setUpdated] = useState(false);

  const [users, setUsers] = useState<api.UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      dbAccess.getUserInOrganization(currentUser.uid, sessionStorage.organizationId).then((user) => {
        setuserDoc(user);
        if (user?.rolle === 'admin') {
          api.getUsers().then((userDataListWrapper) => {
            setUsers(userDataListWrapper.users);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      });
    }
  }, [dbAccess, currentUser]);

  const deleteUser = (id: string) => {
    api.deleteUser(id).finally(() => {
      api.getUsers().then((userDataListWrapper) => {
        setUsers(userDataListWrapper.users);
      });
    });
  };

  const submit = () => {
    firebase.updateDisplayName(displayName)?.then(() => {
      setUpdated(true);
      setTimeout(() => setUpdated(false), 5000);
    });
  };

  return (
    <div className="item item--width">
      <div className="styles__header ">
        <div className="settings__header regular14">
          <Person className="itemIcon_title" />
          <h1>Brukere</h1>
        </div>
        <p>Her kan du se og endre informasjon om deg selv og legge til eller fjerne andre brukere.</p>
      </div>
      <div className="settingsWrapper">
        <h3>Deg</h3>
        <Input
          className={`userInput settings__input ${edit ? 'settings__input--transparent' : 'settings__input--white'}`}
          iconClassName="inputicon"
          type="text"
          placeholder="Navn"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
          onClick={() => {
            setEdit(!edit);
            edit ? '' : submit();
          }}
          value={displayName}
          icon={updated ? <CheckCircle /> : <Create />}
        >
          <div className="inputicon">
            <div className="users__text--save regular11">{updated ? 'Lagret' : ''}</div>
          </div>
        </Input>
        <Input className="userInput settings__input" type="text" placeholder="Email" value={email} disabled />
        <Input
          className="userInput settings__input passord"
          iconClassName="inputicon"
          type="password"
          placeholder="Passord"
          value="passwordpasswordpassword"
          onClick={() => navigate('/innstillinger/endre-passord')}
          icon={<Create />}
          readOnly
        />
        {currentUser?.multiFactor && currentUser.multiFactor.enrolledFactors.length > 0 && (
          <Text className="mfa__text userWrapper">
            <CheckCircle className="greenIcon" />
            <p>Du har skrudd på to-faktor autentisering</p>
            <Link to="/innstillinger/mfa" className="mfa__text__link clickableIcon">
              <Create className="mfa__text__icon" />
            </Link>
          </Text>
        )}
        <div className="mfa__email">
          {!currentUser?.emailVerified && (
            <div
              className="mfa__email--verified clickableIcon"
              role="button"
              onClick={() => {
                currentUser?.sendEmailVerification().then(() => {
                  setPopUp(
                    <StandardPopUp
                      onPopUpAccept={() => ({})}
                      acceptButtonText="Ok"
                      popUpMessage={`Vi har sendt en epost til \'${currentUser?.email}\' for å bekrefte epostadressen din.`}
                    />,
                  );
                });
              }}
            >
              <AddCircle className="controlPointIcon" />
              <p>Bekreft epost for å legge til to-faktor autentisering</p>
            </div>
          )}
          {currentUser?.emailVerified && currentUser.multiFactor.enrolledFactors.length === 0 && (
            <Link className="mfa__email--verified clickableIcon" to="/innstillinger/mfa">
              <AddCircle className="controlPointIcon" />
              <p>Legg til telefonnummer for to-faktor autentisering</p>
            </Link>
          )}
        </div>
      </div>

      <div className="otherUsersWrapper">
        {userDoc?.rolle === 'admin' ? (
          <>
            <h3>Andre brukere</h3>
            <Link className="otherUsersWrapper__icon clickableIcon" to="/innstillinger/ny-bruker">
              <AddCircle className="controlPointIcon" />
              <Text className="settingsExplainText">Gi tilgang til ny person</Text>
            </Link>

            {loading ? (
              <Loader className="otherUsersWrapper--loadig loader" />
            ) : (
              <div>
                {users.map((user) => (
                  <UserItem
                    currentUser={currentUser?.email === user.email}
                    id={user.localId}
                    key={user.localId}
                    email={user.email}
                    name={user.displayName}
                    onClick={() => {
                      setPopUp(
                        <StandardPopUp
                          popUpMessage={`Er du sikker på at du vil slette bruker ${user.email}?`}
                          onPopUpAccept={() => deleteUser(user.localId)}
                          acceptButtonText="Slett bruker"
                          cancelButton="Avbryt"
                        />,
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
export default Users;
