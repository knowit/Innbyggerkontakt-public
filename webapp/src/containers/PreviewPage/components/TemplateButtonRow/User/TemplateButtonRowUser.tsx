import ChevronRight from '@mui/icons-material/ChevronRight';
import { Button } from 'innbyggerkontakt-design-system';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import store from '../../../../../contexts/store';
import { useUser } from '../../../../../hooks';
import { Bulletin, convertTemplateDataToBulletinData } from '../../../../../models';
import { useTemplate } from '../../../../CreateTemplatePage/contexts/TemplateContext';

import './../TemplateButtonRow.scss';

type Props = {
  showEmailPreview: boolean;
  setShowEmailPreview: React.Dispatch<React.SetStateAction<boolean>>;
};

const TemplateButtonRowUser = ({ showEmailPreview, setShowEmailPreview }: Props) => {
  const navigate = useNavigate();
  const { template } = useTemplate();
  const { organizationId, organization, user } = useUser();
  const [isLoading, setLoading] = useState(false);
  const dbAccess = store.dbAccess;

  const bulletinBasedOnTemplate = () => {
    dbAccess.getBulletinsBasedOnTemplate(template?.id ?? '', organizationId ?? '').then((bulletins) => {
      if (!template || !template.id) return;
      setLoading(true);
      const bulletin: Bulletin = {
        content: convertTemplateDataToBulletinData(template, organization),
        basedOn: { id: template.id, type: 'template' },
        name: `Utsendelse basert på - ${template.name}${bulletins.length > 0 ? ` (${bulletins.length})` : ''}`,
        lastChangedBy: 'client',
        status: 'draft',
        channel: { name: 'email', type: 'search' },
        type: 'search',
        userId: user?.uid,
      };

      if (user && user.uid && organizationId && organization) {
        dbAccess
          .createBulletinOnTemplate(bulletin, user?.uid, organizationId, organization)
          .then((id) => {
            if (id) {
              dbAccess
                .getBulletin(organizationId, id, 'draft')
                .then((bulletin) => {
                  if (bulletin) {
                    store.setBulletinId(id);
                    store.setBulletin(bulletin as Bulletin);
                    navigate(`/editer/${id}`);
                  }
                })
                .catch((err) => {
                  console.error(err);
                  setLoading(false);
                });
            }
          })
          .catch((error) => {
            console.error(error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  };

  return (
    <div className="templateButtonRowContainer">
      <div>
        <Button color="secondary" onClick={() => setShowEmailPreview(!showEmailPreview)}>
          {showEmailPreview ? 'Skjul eposten' : 'Vis hele eposten'}
        </Button>
      </div>

      <div>
        <Button svg={[15, 25]} onClick={() => bulletinBasedOnTemplate()} disabled={isLoading}>
          Bruk i utsending
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default TemplateButtonRowUser;
