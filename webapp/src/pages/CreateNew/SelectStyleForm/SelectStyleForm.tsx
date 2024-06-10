import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, FieldError, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Dropdown, Loader } from 'components';
import { CreateMessageError, CreateMessageHeader, NavigationButton } from 'containers/CreateMessagePage/components';
import { getDropDownValue, SaveOptions } from 'containers/CreateMessagePage/util';
import { PopUpContext, StoreContext } from 'contexts';
import { Bulletin, BulletinContent, OptionType } from 'models';
import './SelectStyleForm.scss';

interface Props {
  onClickNext: () => void;
}

type Inputs = {
  templateApplicationStyle: OptionType;
};

const SelectStyleForm: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);
  const navigate = useNavigate();
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;

  const [styleOptions, setStyleOptions] = useState<OptionType[]>([]);
  const [saveState, setSaveState] = useState<SaveOptions>(SaveOptions.NONE);
  const formChangeFromLastSaveRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [templateApplicationId, setTemplateApplicationId] = useState<string | undefined>(undefined);
  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<Inputs>({
    shouldFocusError: true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (formChangeFromLastSaveRef.current) {
        setSaveState(SaveOptions.SAVING);
        formChangeFromLastSaveRef.current = false;
        post({ templateApplicationStyle: watch('templateApplicationStyle') }, true);
        setTimeout(() => {
          setSaveState(SaveOptions.SAVED);
          setTimeout(() => {
            setSaveState(SaveOptions.NONE);
          }, 5000);
        }, 2000);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [watch('templateApplicationStyle')]);

  useLayoutEffect(() => {
    dbAccess.getTemplateApplications(sessionStorage.organizationId).then((templateApplicationOptions) => {
      const templateApplication = templateApplicationOptions?.[0].value;
      setTemplateApplicationId(templateApplication);
      dbAccess
        .getTemplateApplicationStylesOptionList(
          sessionStorage.organizationId,
          currentBulletin?.templateApplicationId || templateApplication,
        )
        .then((templateApplicationStyles) => {
          setIsLoading(false);
          setStyleOptions(templateApplicationStyles);
          const preloadedValues = {
            templateApplicationStyle:
              getDropDownValue(templateApplicationStyles, currentBulletin?.templateApplicationStyleId) || undefined,
          };
          reset(preloadedValues);
          setIsLoading(false);
        });
    });
    // eslint-disable-next-line
  }, [dbAccess, currentBulletin]);

  const setBulletinTemplate = (
    currentBulletin: Bulletin,
    bulletinContent: BulletinContent | undefined,
    templateApplicationStyleId: string,
    isDraft?: boolean,
  ) => {
    const bulletin: Bulletin = {
      ...currentBulletin,
      templateApplicationId: templateApplicationId,
      templateApplicationStyleId,
      content: bulletinContent,
    };
    store.setBulletin(bulletin);
    if (currentBulletinId) {
      if (isDraft) {
        dbAccess.persistBulletin(bulletin, currentBulletinId);
      } else {
        dbAccess.persistBulletin(bulletin, currentBulletinId).then(() => onClickNext());
      }
    }
  };

  const postBulletin = (data: Inputs, isDraft?: boolean) => {
    const styleId = data.templateApplicationStyle.value;

    if (currentBulletin) {
      if (isDraft) {
        setBulletinTemplate(currentBulletin, currentBulletin.content, styleId, isDraft);
      } else {
        setBulletinTemplate(currentBulletin, currentBulletin.content, styleId);
      }
    }
  };

  const post = (data: Inputs, isDraft = false) =>
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(data, isDraft))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  return (
    <>
      {!isLoading ? (
        <form className="templatePageForm" onSubmit={handleSubmit((data) => post(data))}>
          <CreateMessageHeader title="Utseende" save={saveState} />
          <div className="templateSelector">
            <p className="stepExplainText">
              Stil bestemmer meldingens farge og fonter. Du kan velge mellom stiler du selv har laget under instillinger
            </p>
            <Controller
              render={({ field }) => (
                <Dropdown
                  placeholder="Velg stil"
                  options={styleOptions}
                  errorMessage={(errors?.templateApplicationStyle as FieldError)?.message}
                  className="styleSelector"
                  {...field}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) => {
                    field.onChange(e);
                    formChangeFromLastSaveRef.current = true;
                  }}
                />
              )}
              rules={{ required: { value: true, message: 'Stil må være valgt for å gå videre' } }}
              name="templateApplicationStyle"
              control={control}
            />
          </div>
          <NavigationButton />
        </form>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default SelectStyleForm;
