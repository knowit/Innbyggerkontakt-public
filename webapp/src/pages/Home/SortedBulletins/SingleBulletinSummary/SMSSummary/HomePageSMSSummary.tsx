import { useContext } from 'react';
import { useNavigate } from 'react-router';

import store from 'contexts/store';

import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';

import { RecipientsSummary, ScheduleSummary, SMSContentSummary, SMSInvoiceSummary } from 'organisms';

import { ButtonLineContainer, StandardPopUp } from 'components';
import { PopUpContext } from 'contexts';
import { Button } from 'innbyggerkontakt-design-system';

interface HomePageSMSSummary {
  finished?: boolean;
  editable?: boolean;
  setBulletinToDraft: () => void;
}

const HomePageSMSSummary: React.FC<HomePageSMSSummary> = ({
  editable = false,
  finished = false,
  setBulletinToDraft,
}) => {
  const { setPopUp } = useContext(PopUpContext);
  const navigate = useNavigate();
  return (
    <CreateNewTemplate title={'Oppsummering'} subtitle={store.currentBulletin?.name}>
      <RecipientsSummary />
      <SMSContentSummary />
      <ScheduleSummary />
      <SMSInvoiceSummary />
      <ButtonLineContainer>
        {!finished ? (
          !editable ? (
            <Button
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage="Dette valget vil stoppe denne utsendingen og legge den i kladd listen og du vil derfor måtte
                          sette tidspunktet for utsending på nytt."
                    onPopUpAccept={() => {
                      setBulletinToDraft();
                      navigate('/oversikt/hjem');
                    }}
                    acceptButtonText="Stopp utsending"
                    cancelButton="Avbryt"
                  />,
                );
              }}
            >
              Stopp utsending
            </Button>
          ) : null
        ) : (
          <></>
        )}
      </ButtonLineContainer>
      {editable && <Button onClick={() => navigate(`/editer/${store.currentBulletinId}`)}>Endre SMS</Button>}
    </CreateNewTemplate>
  );
};

export default HomePageSMSSummary;
