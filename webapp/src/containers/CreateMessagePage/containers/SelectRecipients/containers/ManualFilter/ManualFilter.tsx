import { useContext, useEffect, useLayoutEffect, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';
import { v4 as uuid } from 'uuid';
import { PopUpContext, StoreContext } from '../../../../../../contexts';

import { Bulletin, BulletinRecipients, FilterTypes, FilterValues, RecipientsManual } from '../../../../../../models';

import { Button, CSVUploader, Input, ManualRecipientsList, StandardPopUp, Text } from '../../../../../../components';
import { RecipientsAddCancelButtons } from '../../../../components';
import { FilterWrapper } from '../../components';

import AddCircle from '@mui/icons-material/AddCircle';

import * as EmailValidator from 'email-validator';

import './ManualFilter.scss';

interface Props {
  onCancel: () => void;
  activeFilter: FilterValues['recipientFilter'];
  editMode: boolean;
  onSubmit: (bulletinToPost: Bulletin) => void;
  evaluatedFilter: FilterTypes | null;
}

type Inputs = {
  manualListName: string;
};

export const ManualFilter: React.FC<Props> = ({ onCancel, activeFilter, editMode, onSubmit, evaluatedFilter }) => {
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);

  const [listName, setListName] = useState<string>('');
  const [listType, setListType] = useState<RecipientsManual['listType']>('email');
  const [recipientsList, setRecipientsList] = useState<Record<string, string>[]>([]);
  const [filterId, setFilterId] = useState<string>('');

  const [addingNewRecipients, setAddingNewRecipients] = useState<boolean>(false);
  const [newRecipient, setNewRecipient] = useState<string>('');

  const [errorLines, setErrorLines] = useState<number[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [singleAdditionErrorMessage, setSingleAdditionErrorMessage] = useState<string>('');

  useLayoutEffect(() => {
    if (evaluatedFilter && editMode) {
      const queryGroup = evaluatedFilter as RecipientsManual;
      setListName(queryGroup.listName || '');
      setListType(queryGroup.listType || 'email');
      setRecipientsList(queryGroup.recipientsList || []);
      setFilterId(queryGroup.id || '');
    } else {
      setFilterId(uuid());
    }
  }, []);

  const generateLineMessage = (array: number[]) => {
    const lastElement = array.pop();
    const remappedArray = array.map((number) => {
      return `linje ${number}`;
    });
    return remappedArray.join(', ') + `${remappedArray.length !== 0 ? ' og' : ''}` + ` linje ${lastElement}.`;
  };

  useEffect(() => {
    if (errorLines.length !== 0) {
      let message = 'Det ble funnet avvik i dokumentet på ';
      message += generateLineMessage(errorLines.filter((number, idx) => idx < 5));
      if (errorLines.length > 5) {
        message += ' Det er også flere avvik i dokumentet.';
      }
      message +=
        ' Alle avvik har blitt fjernet fra den følgende listen. Pass på at kravene er oppfylt i punktlisten ovenfor.';
      setError(true);
      setErrorMessage(message);
    } else {
      setError(false);
      setErrorMessage('');
    }
  }, [errorLines]);

  const setFiltersForBulletin = (bulletinToStore: Bulletin, newListName: string) => {
    const prevRecipients: BulletinRecipients | undefined = bulletinToStore?.recipients;
    const prevManualList: RecipientsManual[] = prevRecipients && prevRecipients.manual ? prevRecipients.manual : [];

    const filter: RecipientsManual = {
      id: filterId,
      recipientFilter: activeFilter,
      recipientsCount: recipientsList.length,
      listType: listType,
      listName: newListName,
      createdTimestamp: Date.now(),
    };
    const recipients: BulletinRecipients = {
      ...prevRecipients,
      manual: prevManualList.concat([filter]),
    };
    const bulletin: Bulletin = {
      ...bulletinToStore,
      recipients,
    };
    return bulletin;
  };

  const deleteRecipient = (index: number) => {
    setRecipientsList(recipientsList.filter((element) => element !== recipientsList[index]));
  };

  const validateSingleAddition = (uploadElement: string) => {
    let newElement = {};
    const splitElement = uploadElement.split(/[,/:;|+*\\]/g);
    if (splitElement.length < 3 && splitElement.length > 0) {
      if (listType === 'email') {
        if (splitElement.length === 1 && EmailValidator.validate(splitElement[0].trim())) {
          newElement = { email: splitElement[0].trim() };
        } else if (splitElement.length === 2 && EmailValidator.validate(splitElement[0].trim())) {
          newElement = { email: splitElement[0].trim(), name: splitElement[1].trim() };
        } else if (splitElement.length === 2 && EmailValidator.validate(splitElement[1].trim())) {
          newElement = { email: splitElement[1].trim(), name: splitElement[0].trim() };
        }
      } else if (listType === 'identifier') {
        newElement = { identifier: splitElement[0] };
      }
    }
    if (Object.keys(newElement).length === 0) {
      setSingleAdditionErrorMessage(
        'Mottakeren kunne ikke bli prosessert. Vennligst se til epost-adressen er gyldig, et potensielt navn adskilles med komma og at det bare legges til én mottaker.',
      );
    }
    return newElement;
  };

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>({
    shouldFocusError: true,
  });

  return (
    <FilterWrapper
      overskrift="Egendefinert liste"
      infotekst="Dersom du har en liste med e-poster du ønsker å sende ut en melding til kan du opprette en egendefinert liste."
      ekstraInfotekst="Dersom du har en liste med e-poster du ønsker å sende ut en melding til kan du opprette en egendefinert liste."
      filterType="manual"
    >
      <form
        onSubmit={handleSubmit((data) => {
          setPopUp(
            <StandardPopUp
              popUpMessage={`Av personvernshensyn vil ikke denne listen kunne endres etter at den har blitt lagret. Hvis det i etterkant er nødvendig å gjøre endringer, må denne listen slettes og lastes opp på nytt. OBS! Denne listen vil kun lagres i 30 dager av personvernshensyn, dette betyr at filteret også vil slettes etter 30 dager hvis utsendingen ikke er startet.`}
              onPopUpAccept={() => {
                if (store.currentBulletin && store.currentBulletinId) {
                  const bulletinToPost = setFiltersForBulletin(store.currentBulletin, data.manualListName);
                  store.dbAccess.checkForPotentialOverwrite(store.currentBulletinId).then(() => {
                    store.dbAccess.persistBulletin(bulletinToPost, store.currentBulletinId).then(() => {
                      store.dbAccess
                        .persistMmlBulletinFilterList(store.currentBulletinId, filterId, {
                          list: recipientsList,
                          listName: data.manualListName,
                          listType: listType,
                          recipientsCount: recipientsList.length,
                          createdTimestamp: Date.now(),
                        })
                        .then(() => {
                          store.setBulletin(bulletinToPost);
                          onSubmit(bulletinToPost);
                        });
                    });
                  });
                }
              }}
              acceptButtonText="Godkjenn"
              cancelButton="Avbryt"
            />,
          );
        })}
      >
        <div className="recipientItemContent">
          <Controller
            render={({ field: { ref, ...rest } }) => (
              <Input
                aria-label={`Navn for for egendefinert liste-filter`}
                key={`ManualListFilterInput`}
                id={`ManualListFilterInput`}
                className={errors?.manualListName?.message ? `contentFormFields__elements--invalid` : ''}
                type="text"
                title={'Navn'}
                inputRef={ref}
                info={errors?.manualListName?.message ? errors.manualListName.message : ''}
                {...rest}
              />
            )}
            defaultValue={listName}
            control={control}
            name={'manualListName'}
            rules={{ required: { value: true, message: 'Dette filteret må ha et navn!' } }}
          />
          {recipientsList.length === 0 && (
            <div className="manualListAlternatives">
              <button
                onClick={() => setListType('email')}
                className={listType === 'email' ? 'buttonAlternative active_button' : 'buttonAlternative'}
                type="button"
              >
                Epost
              </button>
              {/*<button
                onClick={() => setListType('emailAndName')}
                className={listType === 'emailAndName' ? 'buttonAlternative active_button' : 'buttonAlternative'}
                type="button"
              >
                Epost og navn
              </button>*/}
              {/*<button
                onClick={() => setListType('identifier')}
                className={listType === 'identifier' ? 'buttonAlternative active_button' : 'buttonAlternative'}
                type="button"
              >
                Fødselsnummer
              </button>*/}
            </div>
          )}
          <ul className="mmlInfoBulletPoints">
            <li className="mmlInfoPoint">
              De godkjente filformatene er csv og xlsx og alle filene må ha godkjente headere på relevante kolonner. For
              xlsx-filer vil bare det første arket bli brukt.
            </li>
            <li className="mmlInfoPoint">
              Disse listene kan være opptil 10.000 linjer lange, hvis filer er lengre må de kortes ned før opplasting.
            </li>
            {listType === 'email' ? (
              <>
                <li className="mmlInfoPoint">
                  For epost vil følgende headere godkjennes:{' '}
                  <span className="highlightedMmlText">E-post, Epost og E post.</span> Dersom det finnes flere kolonner
                  som inkluderer én av de headerne, så vil den første kolonnen bli valgt.
                </li>
                <li className="mmlInfoPoint">
                  For navn vil følgende headere godkjennes:{' '}
                  <span className="highlightedMmlText">
                    Navn, Fullt navn, Fornavn med Mellomnavn og/eller Etternavn, eller bare Etternavn.
                  </span>{' '}
                  Hvis det finnes flere kolonner av denne typen vil kolonnene bli prioritert i den rekkefølgen som står
                  her.
                </li>
              </>
            ) : (
              <>
                <li className="mmlInfoPoint">
                  For fødselsnummer vil følgende headere godkjennes:{' '}
                  <span className="highlightedMmlText">Fødselsnummer og Personnummer.</span> Hvis begge headerene finnes
                  vil de bli prioritert i den rekkefølgen.
                </li>
              </>
            )}
          </ul>
          {recipientsList.length > 0 ? (
            <>
              {addingNewRecipients ? (
                <div className="wrapperNewRecipient">
                  <Input
                    title={'Legg til ny mottaker'}
                    aria-label={`Nytt element i opplastet liste`}
                    key={`ManualListFilterNewElement`}
                    id={`ManualListFilterNewElement`}
                    className={'inputNewRecipient'}
                    type="text"
                    //inputRef={ref}
                    placeholder={listType === 'email' ? 'Skill epost og navn med et komma.' : ''}
                    errorMessage={singleAdditionErrorMessage}
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    //{...rest}
                  />
                  <Button
                    className="tertiary buttonNewRecipient textButton"
                    onClick={() => {
                      setNewRecipient('');
                      setAddingNewRecipients(false);
                      setSingleAdditionErrorMessage('');
                    }}
                  >
                    Avbryt
                  </Button>
                  <Button
                    className="secondary buttonNewRecipient textButton"
                    onClick={() => {
                      const newElement = validateSingleAddition(newRecipient);
                      if (Object.keys(newElement).length !== 0) {
                        const newList = [newElement].concat(recipientsList);
                        setRecipientsList(newList);
                        setNewRecipient('');
                        setAddingNewRecipients(false);
                        setSingleAdditionErrorMessage('');
                      }
                    }}
                  >
                    Legg til
                  </Button>
                </div>
              ) : (
                <div className="addRemoveRowContainer">
                  <div className="clickableIcon" onClick={() => setAddingNewRecipients(true)}>
                    <AddCircle />
                    <p>Legg til én til</p>
                  </div>
                  <Button
                    onClick={() => {
                      setRecipientsList([]);
                      setError(false);
                      setErrorMessage('');
                    }}
                    className={'tertiary'}
                    type="button"
                  >
                    Fjern innhold i listen
                  </Button>
                </div>
              )}

              {error && <Text className="textError">{errorMessage}</Text>}

              <ManualRecipientsList recipients={recipientsList} deleteRecipient={deleteRecipient} listType={listType} />
            </>
          ) : (
            <>
              <label className="fieldTitle">Liste med {listType === 'email' ? 'e-poster' : 'fødselsnummer'}</label>
              <Text className="regular11">
                Her kan du laste opp en liste med {listType === 'email' ? 'e-poster' : 'fødselsnummer'} i csv- eller
                xlsx-format.
              </Text>
              <CSVUploader
                onChange={(e: Record<string, string>[]) => setRecipientsList(e)}
                listType={listType}
                setErrorLines={(e) => setErrorLines(e)}
              />
            </>
          )}
        </div>
        <RecipientsAddCancelButtons onCancel={onCancel} editMode={editMode} />
      </form>
    </FilterWrapper>
  );
};

export default ManualFilter;
