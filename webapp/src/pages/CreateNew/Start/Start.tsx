import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { CreateMessageError, NavigationButton } from 'containers/CreateMessagePage/components';
import { ChannelForm, ChooseTypeForm, NameForm } from 'containers/CreateMessagePage/containers';

import { PopUpContext, StoreContext } from 'contexts';
import { Bulletin } from 'models';

import { Loading } from 'innbyggerkontakt-design-system';

import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';
import './Start.scss';

interface StartProps {
  onClickNext: () => void;
  channel: Bulletin['channel'];
  setChannel: React.Dispatch<React.SetStateAction<Bulletin['channel']>>;
}

export type NameData = {
  name: string;
};

const Start = ({ onClickNext, channel, setChannel }: StartProps) => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const { setPopUp } = useContext(PopUpContext);
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;

  const [allBulletinNames, setAllBulletinNames] = useState<Array<string>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<NameData>({
    defaultValues: {
      name: currentBulletin?.name || '',
    },
    shouldFocusError: true,
    mode: 'onBlur',
  });

  useEffect(() => {
    const tempNames: string[] = [];
    dbAccess.getAllBulletinsFromOrganization(sessionStorage.organizationId).then((bulletins) => {
      bulletins.forEach((snapshot) => {
        snapshot?.forEach((doc) => {
          const data = doc.data() as Bulletin;
          if (doc.id !== currentBulletinId) {
            tempNames.push(data.name);
          }
        });
      });
      setAllBulletinNames(tempNames);
    });
  }, []);

  const uniqueNameCheck = (name: string) => {
    if (allBulletinNames.includes(name)) {
      return false;
    } else {
      return true;
    }
  };

  const postBulletin = (nameData: NameData) => {
    const bulletin: Bulletin = {
      ...currentBulletin,
      channel,
      type: channel.type,
      status: 'draft',
      sandboxMode: process.env.REACT_APP_PROJECT_ID !== 'innbyggerkontakt',
      name: nameData.name,
      kommunenummer:
        sessionStorage.getItem('organization') !== null &&
        JSON.parse(sessionStorage.getItem('organization') as string).type === 'kommune' &&
        JSON.parse(sessionStorage.getItem('organization') as string).municipalityNumber.toString(),
      userId: sessionStorage.getItem('user') !== null && JSON.parse(sessionStorage.getItem('user') as string).uid,
    };
    store.setBulletin(bulletin);

    dbAccess.persistBulletin(bulletin, currentBulletinId || undefined).then((res) => {
      store.setBulletinId(res);
      onClickNext();
    });
  };

  const post = (data: NameData): void => {
    setIsLoading(true);
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(data))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      )
      .finally(() =>
        setTimeout(() => {
          setIsLoading(false);
        }, 1000),
      );
  };

  return (
    <CreateNewTemplate title={'Oppstart'}>
      {isLoading ? (
        <Loading />
      ) : (
        <form className="start__form" onSubmit={handleSubmit(post)}>
          <Controller
            render={({ field: { ref, ...rest } }) => (
              <NameForm errorMessage={errors.name?.message} ref={ref} {...rest} />
            )}
            control={control}
            name="name"
            rules={{
              required: 'Må ha et navn!',
              validate: {
                equals: (name) => uniqueNameCheck(name) || 'Det eksisterer en bulletin med samme navn',
              },
            }}
          />
          <ChannelForm channel={channel} setChannel={setChannel} />
          <ChooseTypeForm channel={channel} setChannel={setChannel} />

          <NavigationButton />
        </form>
      )}
    </CreateNewTemplate>
  );
};

export default Start;
