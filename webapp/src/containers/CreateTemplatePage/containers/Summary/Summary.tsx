import ChevronLeft from '@mui/icons-material/ChevronLeft';
import { Button } from 'innbyggerkontakt-design-system';
import { useContext, useRef } from 'react';
import { useNavigate } from 'react-router';
import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';
import { ButtonLineContainer } from '../../../../components';
import { StoreContext } from '../../../../contexts';
import { Template } from '../../../../models';
import { useTemplate } from '../../contexts/TemplateContext';
import AboutSummary from './components/AboutSummary/AboutSummary';
import ContentSummary from './components/ContentSummary/ContentSummary';

interface Props {
  onClickNext: (back?: boolean, sendToPath?: string | undefined) => void;
}

const Summary: React.FC<Props> = ({ onClickNext }) => {
  const dbAccess = useContext(StoreContext).dbAccess;
  const navigate = useNavigate();

  const { template } = useTemplate();
  const templateRef = useRef<Template | null>(template);
  templateRef.current = template;

  const publishTemplate = () => {
    if (templateRef.current?.id) {
      dbAccess.updateTemplate(templateRef.current?.id, { type: 'published' }).then(() => navigate('/'));
    }
  };

  return (
    <CreateNewTemplate title={'Oppsummering'}>
      <AboutSummary />
      <ContentSummary />
      <div>
        <ButtonLineContainer>
          <Button color="tertiary" svg={[25, 15]} onClick={() => onClickNext(true)}>
            <ChevronLeft />
            Tilbake
          </Button>

          <Button style={{ float: 'right' }} color="primary" onClick={() => publishTemplate()}>
            Publiser mal
          </Button>
        </ButtonLineContainer>
      </div>
    </CreateNewTemplate>
  );
};

export default Summary;
