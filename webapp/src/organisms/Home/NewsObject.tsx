import { Card } from 'innbyggerkontakt-design-system';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { StandardPopUp } from '../../components';
import { PopUpContext, StoreContext } from '../../contexts';
import { Bulletin, InvoiceType } from '../../models';
import { translateBulletinName, translateBulletinType } from './News/utils';

interface Props {
  bulletin: Bulletin;
  bulletinId: string;
  invoice?: InvoiceType;
}

export const NewsObject: React.FC<Props> = ({ bulletinId, bulletin, invoice }) => {
  const navigate = useNavigate();
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const { setPopUp } = useContext(PopUpContext);

  const dateOptions: Intl.DateTimeFormatOptions = { dateStyle: 'short' };
  const getDate = () => {
    if (bulletin.execution) {
      if (bulletin.execution.datetime) {
        const date = new Date(bulletin.execution.datetime).toLocaleDateString('no-NO', dateOptions);
        return date;
      }
    }
  };
  const getLastChanged = () => {
    if (bulletin.lastChanged !== undefined) {
      const lastChanged = new Date(bulletin.lastChanged).toLocaleDateString('no-NO', dateOptions);
      return lastChanged;
    }
  };

  const handleOnClick = (e: Props) => {
    switch (e.bulletin.status) {
      case 'active':
        if (e.bulletin.channel.type === 'search') {
          store.setBulletin(e.bulletin);
          navigate(`/oversikt/planlagte/${e.bulletinId}`);
        }
        if (e.bulletin.channel.type === 'event') {
          navigate(`/oversikt/aktive/${e.bulletinId}`);
        }
        break;
      case 'draft':
        if (e.invoice) {
          store.setInvoice(e.invoice);
        }
        store.setBulletinId(e.bulletinId);
        store.setBulletin(e.bulletin);
        navigate(`/editer/${e.bulletinId}`);
        break;
      case 'finished':
        store.setBulletin(e.bulletin);
        navigate(`/oversikt/utsendte/${e.bulletinId}`);
        break;
    }
  };

  const generateTags = () => {
    const tags: string[] = [];
    tags.push(translateBulletinType(bulletin.channel.type));
    tags.push(translateBulletinName(bulletin.channel));

    if (bulletin.channel.type === 'search' && bulletin.status === 'finished' && getDate()) {
      tags.push(`Sendt: ${getDate()}`);
    }

    if (bulletin.status === 'draft') {
      tags.push('Utkast');
    }

    if (getLastChanged()) {
      tags.push(`Sist endret: ${getLastChanged()}`);
    }

    return tags;
  };

  return (
    <Card
      size="small"
      title={bulletin.name}
      image={
        bulletin.content?.contentInLanguage[0].variables?.bilde &&
        bulletin.content?.contentInLanguage[0].variables.bilde !== 'NO_IMAGE'
          ? {
              src: bulletin.content?.contentInLanguage[0].variables.bilde,
              text: '',
            }
          : undefined
      }
      tags={generateTags()}
      onClick={() => handleOnClick({ bulletin, bulletinId, invoice })}
      iconButtonOnClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        if (bulletin.status === 'draft') {
          setPopUp(
            <StandardPopUp
              popUpMessage="Du er i ferd med å slette en melding. Alt av tekst og bilder tilhørende meldingen vil bli slettet og det vil ikke bli mulig å gjenopprette."
              acceptButtonText={'Slett melding'}
              cancelButton="Avbryt"
              onPopUpAccept={() => {
                dbAccess.deleteBulletin(sessionStorage.organizationId, bulletinId);
                navigate('/');
              }}
            />,
          );
        }
      }}
      useDeleteButton={bulletin.status === 'draft'}
    />
  );
};

export default NewsObject;
