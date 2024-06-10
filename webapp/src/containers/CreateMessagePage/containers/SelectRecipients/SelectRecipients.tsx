import { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../../../contexts';
import { Bulletin, FilterTypes } from '../../../../models';

import { Button, Text } from '../../../../components';
import { CreateMessageHeader, NavigationButton } from '../../components';
import { CreateNewFilterHeader, FilterChoiceButtons } from './components';
import { EditFilterMenu, RecipientsDisplay } from './containers';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { FilterValues, RECIPIENT_STAGE } from '../../../../models';
import { SaveOptions } from '../../util';
import { getRecipientsIsEmptyValue } from './searchUtil';

import './SelectRecipients.scss';
import { useUser } from 'hooks';

interface Props {
  onClickNext: () => void;
}
const SelectRecipients: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;

  const [activeFilter, setActiveFilter] = useState<FilterValues['recipientFilter']>('');
  const [emptyRecipients, setEmptyRecipients] = useState<boolean>(true);
  const [saveState, setSaveState] = useState<SaveOptions>(SaveOptions.NONE);
  const [stage, setStage] = useState<RECIPIENT_STAGE>(RECIPIENT_STAGE.START);
  const [evaluatedFilter, setEvaluatedFilter] = useState<FilterTypes | null>(null);
  const [bulletinHook, setBulletinHook] = useState<Bulletin | null>(currentBulletin);

  const { organization } = useUser();

  useEffect(() => {
    if (!bulletinHook || getRecipientsIsEmptyValue(bulletinHook.recipients)) {
      setEmptyRecipients(true);
    } else {
      setEmptyRecipients(false);
    }
    // Dette burde endres til å bruke bare en funksjon som skal ligge i util
  }, [
    bulletinHook?.recipients?.query,
    bulletinHook?.recipients?.manual,
    bulletinHook?.recipients?.matrikkel,
    bulletinHook?.recipients?.kart,
  ]);

  useEffect(() => {
    if (activeFilter !== '') {
      setSaveState(SaveOptions.NONE);
    } else {
      setSaveState(SaveOptions.SAVED);
    }
    return () => setSaveState(SaveOptions.NONE);
  }, [activeFilter]);

  useEffect(() => store.setBulletin(bulletinHook), [bulletinHook]);

  const updateStage = () => {
    if (activeFilter) {
      !evaluatedFilter ? setStage(RECIPIENT_STAGE.CHOOSE_SOURCE) : setStage(RECIPIENT_STAGE.RECIPIENTS);
    } else {
      setStage(RECIPIENT_STAGE.CHOOSE_CRITERIA);
    }
  };

  const onSubmit = (bulletin: Bulletin) => {
    setActiveFilter('');
    setStage(RECIPIENT_STAGE.RECIPIENTS);
    setBulletinHook(bulletin);
  };

  const expandToEdit = (group: FilterTypes) => {
    setEvaluatedFilter(group);
    setActiveFilter(group.recipientFilter);
    setStage(RECIPIENT_STAGE.EDIT_GROUP);
  };

  const onDeleteFilter = (bulletin: Bulletin) => {
    setBulletinHook(bulletin);
  };

  const next = () => {
    // Håndterer kun pagenumbering, burde nok vært en submit
    if (bulletinHook && !getRecipientsIsEmptyValue(bulletinHook.recipients)) {
      const bulletinToPost: Bulletin = { ...bulletinHook };
      store.dbAccess.checkForPotentialOverwrite(store.currentBulletinId).then(() => {
        store.dbAccess.persistBulletin(bulletinToPost, store.currentBulletinId).then(() => {
          store.setBulletin(bulletinToPost);
          onSubmit(bulletinToPost);
          onClickNext();
        });
      });
    }
  };

  return (
    <div className="selectRecipients__wrapper">
      <CreateMessageHeader title="Mottakere" save={saveState} />
      <div className="topBox">
        {stage === RECIPIENT_STAGE.START &&
          getRecipientsIsEmptyValue(bulletinHook?.recipients as Bulletin['recipients']) && (
            <p className="regular14 infoText">
              Nå skal du finne mottakerne du ønsker skal motta meldingen du lager. Mottakere blir laget i grupper sånn
              at flere grupper kan motta samme melding. Gruppene du oppretter kan fjernes og endres etter du har laget
              dem. Dersom noen er i flere av gruppene vil man kun motta én melding.
            </p>
          )}

        {(stage === RECIPIENT_STAGE.START || stage === RECIPIENT_STAGE.RECIPIENTS) && (
          <>
            {bulletinHook?.recipients && (
              <RecipientsDisplay
                recipients={bulletinHook?.recipients}
                currentBulletinId={currentBulletinId}
                onDeleteFilter={onDeleteFilter}
                setStage={setStage}
                expandToEdit={expandToEdit}
                emptyRecipients={emptyRecipients}
                setActiveFilter={setActiveFilter}
              />
            )}

            <Button
              className="textButton secondary newGroupBtn"
              onClick={() => {
                setStage(RECIPIENT_STAGE.CHOOSE_SOURCE);
              }}
            >
              <AddCircleIcon className="addCircleIconRecipients" />
              <Text className="medium14">Lag ny gruppe av mottakere</Text>
            </Button>
          </>
        )}
      </div>
      {stage !== RECIPIENT_STAGE.START && stage !== RECIPIENT_STAGE.RECIPIENTS && (
        <div className="blueBox">
          {stage === RECIPIENT_STAGE.EDIT_GROUP ? (
            <h2 className="semibold18 subHeader">Endre gruppe</h2>
          ) : (
            <CreateNewFilterHeader stage={stage} />
          )}

          {!activeFilter ? (
            <FilterChoiceButtons
              setActiveFilter={setActiveFilter}
              setStage={setStage}
              channel={currentBulletin?.channel}
              hasKart={organization?.hasKart}
            />
          ) : (
            <EditFilterMenu
              activeFilter={activeFilter}
              onSubmit={onSubmit}
              onCancel={() => {
                setActiveFilter('');
                updateStage();
                setEvaluatedFilter(null);
              }}
              evaluatedFilter={evaluatedFilter}
              stage={stage}
            />
          )}

          {stage === RECIPIENT_STAGE.CHOOSE_SOURCE && (
            <div className="buttonContainer">
              <Button
                className="textButton tertiary"
                onClick={() => {
                  if (getRecipientsIsEmptyValue(bulletinHook?.recipients as Bulletin['recipients'])) {
                    setStage(RECIPIENT_STAGE.RECIPIENTS);
                  } else {
                    setStage(RECIPIENT_STAGE.START);
                  }
                }}
              >
                <ChevronLeftIcon fontSize="small" />
                <Text className="medium14">Tilbake</Text>
              </Button>
            </div>
          )}
        </div>
      )}

      {(stage === RECIPIENT_STAGE.START || stage === RECIPIENT_STAGE.RECIPIENTS) && (
        <NavigationButton
          className="selectRecipientsNavigationButtons"
          disabled={emptyRecipients}
          onClick={next}
          submit={false}
        />
      )}
    </div>
  );
};

export default SelectRecipients;
