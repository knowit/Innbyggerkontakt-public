import { useContext, useState } from 'react';
import { Button } from 'innbyggerkontakt-design-system';
import PopUpMessage from '../../../../../components/PopUpMessage/PopUpMessage';
import { TemplateType, USER_ROLES } from '../../../../../models';
import store from '../../../../../contexts/store';
import { useNavigate } from 'react-router';
import { useTemplate } from '../../../../CreateTemplatePage/contexts/TemplateContext';
import { useUser } from '../../../../../hooks';
import { PopUpContext } from '../../../../../contexts';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ContentCopy from '@mui/icons-material/ContentCopy';
import Edit from '@mui/icons-material/Edit';

import './../TemplateButtonRow.scss';

const TemplateButtonRowEditor = () => {
  const navigate = useNavigate();
  const { template, setValues } = useTemplate();
  const { organizationId, role } = useUser();
  const { setPopUp } = useContext(PopUpContext);
  const [isLoading, setLoading] = useState(false);
  const dbAccess = store.dbAccess;

  const popUpWarning = (title: string, message: string, onAccept: () => void, onCancel?: () => void) => {
    setPopUp(
      <PopUpMessage
        popUpTitle={title}
        popUpMessage={message}
        onPopUpAccept={onAccept}
        onCancel={onCancel}
        acceptButtonText="Ja"
        cancelButton="Nei"
      />,
    );
  };

  const changeTemplateType = (type: TemplateType) => {
    if (template?.id) {
      dbAccess.updateTemplate(template?.id, { type });
      setValues({ type });
    }
  };

  const deleteTemplate = () => {
    if (template?.id) {
      dbAccess.deleteTemplate(template?.id).then(() => {
        navigate(-1);
      });
    }
  };

  const handleCopy = () => {
    if (template && organizationId) {
      setLoading(true);
      dbAccess
        .createTemplateCopy(organizationId, template)
        .then((id) => {
          setLoading(false);
          if (id) {
            navigate(`/editer/${id}`);
          }
        })
        .catch(() => setLoading(false));
    }
  };

  const handleEdit = () => {
    if (template?.id) {
      dbAccess.updateTemplate(template.id, { type: 'draft' }).then(() => {
        navigate(`/editer/${template.id}`);
      });
    }
  };
  const validateAuthentication = (): boolean => role === USER_ROLES.EDITOR && template?.orgId === organizationId;

  const createDeleteButton = () => (
    <Button
      color="tertiary"
      svg={[25, 15]}
      onClick={() =>
        popUpWarning(
          'Slette malen',
          template?.type === 'published'
            ? 'Er du sikker på at du vil slette denne malen? Når du sletter denne malen vil den ikke lenger være publisert, og vil ikke lenger vises blant de publiserte malene.'
            : 'Er du sikker på at du vil slette denne malen?',
          deleteTemplate,
        )
      }
    >
      <DeleteOutline /> Slett mal
    </Button>
  );

  const createEditButton = () => (
    <Button
      svg={[25, 15]}
      onClick={
        template?.type === 'published'
          ? () =>
              popUpWarning(
                'Redigere mal',
                'Er du sikker på at du vil redigere denne malen? Hvis du redigerer malen vil den ikke lenger være publisert, og vil ikke lenger vises blant de publiserte malene.',
                handleEdit,
              )
          : () => handleEdit()
      }
      disabled={template?.type === 'published' ? true : false}
    >
      <Edit />
      Rediger mal
    </Button>
  );

  const createRemovePublishButton = () =>
    template?.type === 'published' ? (
      <Button
        color="secondary"
        onClick={() =>
          popUpWarning(
            'Fjerne fra publiserte',
            'Er du sikker på at du vil fjerne denne malen fra publiserte maler?',
            () => changeTemplateType('archived'),
          )
        }
      >
        Fjern fra publiserte
      </Button>
    ) : null;

  const createRoleBasedButtons = () => {
    const createCopyButton = () => (
      <Button svg={[25, 15]} onClick={() => handleCopy()} disabled={isLoading}>
        <ContentCopy />
        Lag kopi
      </Button>
    );

    const createPublishButton = () => (
      <Button color="secondary" onClick={() => changeTemplateType('published')}>
        Publiser mal
      </Button>
    );

    if (validateAuthentication()) {
      return template?.type !== 'archived' ? createCopyButton() : createPublishButton();
    } else {
      return null;
    }
  };

  return (
    <div className="templateButtonRowContainer">
      <div>
        {validateAuthentication() ? (
          <>
            {createDeleteButton()}
            {createRemovePublishButton()}
          </>
        ) : null}
      </div>

      <div>
        {createRoleBasedButtons()}
        {validateAuthentication() ? createEditButton() : null}
      </div>
    </div>
  );
};

export default TemplateButtonRowEditor;
