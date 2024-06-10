import { Loader } from 'components';
import { StoreContext } from 'contexts';
import { TemplateApplication } from 'models';
import { useContext, useLayoutEffect, useState } from 'react';
import ContentForm from './EmailContent/ContentForm';
import SMSContent from './SMSContent/SMSContent';

interface Props {
  onClickNext: () => void;
}
const ContentPage: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;

  const currentTemplateId = currentBulletin?.templateApplicationId;

  const [template, setTemplate] = useState<TemplateApplication | null>(null);
  useLayoutEffect(() => {
    if (currentTemplateId && currentBulletin.channel.name === 'email') {
      dbAccess.getTemplateApplication(currentTemplateId, sessionStorage.organizationId).then(setTemplate);
    }
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {currentBulletin?.channel.name === 'sms' ? (
        <SMSContent onClickNext={onClickNext} />
      ) : template ? (
        <ContentForm onClickNext={onClickNext} template={template} />
      ) : (
        <Loader />
      )}
    </>
  );
};

export default ContentPage;
