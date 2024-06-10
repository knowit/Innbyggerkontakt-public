import { useContext } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { PopUpContext, StoreContext } from '../../../../contexts';
import { Bulletin } from '../../../../models';

import { CreateMessageError, CreateMessageHeader, NavigationButton } from 'containers/CreateMessagePage/components';
import { SMSText } from 'innbyggerkontakt-design-system';

import './SMSContent.scss';

interface SMSContentProps {
  onClickNext: () => void;
}

interface SMSContent {
  content: string;
}

const SMSContent: React.FC<SMSContentProps> = ({ onClickNext }) => {
  const navigate = useNavigate();

  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);

  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;

  const { handleSubmit, watch, control } = useForm<SMSContent>({
    defaultValues: {
      content: currentBulletin?.smsContent?.nb || '',
    },
    shouldFocusError: true,
    mode: 'onBlur',
  });

  const watchContent = watch('content');

  const postBulletin = (data: SMSContent): void => {
    if (currentBulletin) {
      const bulletin: Bulletin = {
        ...currentBulletin,
        smsContent: {
          nb: data.content,
        },
      };
      store.setBulletin(bulletin);

      dbAccess.persistBulletin(bulletin, currentBulletinId || undefined).then((res) => {
        store.setBulletinId(res);
        onClickNext();
      });
    } else {
      throw new Error('Det har oppstått ukjent feil');
    }
  };

  const post = (data: SMSContent): void => {
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(data))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );
  };

  return (
    <form onSubmit={handleSubmit(post)}>
      <CreateMessageHeader title={'Innhold'} />
      <Controller
        render={({ field: { ref, ...rest } }) => (
          <SMSText className="smsContent" id={'sms tekst'} ariaLabel={'sms tekst'} ref={ref} {...rest} />
        )}
        control={control}
        name="content"
        rules={{
          required: 'Må ha innhold',
        }}
      />
      <NavigationButton disabled={watchContent.length <= 0} />
    </form>
  );
};

export default SMSContent;
