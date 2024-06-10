import EmailIcon from '@mui/icons-material/Email';
import { CreateMessageError, NavigationButton } from 'containers/CreateMessagePage/components';
import { LanguageMenu } from 'containers/CreateMessagePage/containers/ContentForm/components';
import { InputSwitch } from 'containers/CreateMessagePage/containers/ContentForm/components/InputSwitch';
import { SaveOptions } from 'containers/CreateMessagePage/util';
import juice from 'juice';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Input, Loader } from '../../../../components';
import styles from '../../../../components/EditorComponent/Styles';
import { PopUpContext, StoreContext } from '../../../../contexts';
import { Bulletin, BulletinContent, GlobalTemplateVariable, OptionType, TemplateApplication } from '../../../../models';
import CreateNewTemplate from '../../../../templates/CreateNewBulletin/CreateNewTemplate';
import {
  errorMessages,
  generateUrlObject,
  getDefaultLanguage,
  getLanguageOptions,
  Inputs,
  sortByPosition,
} from '../util';
import './ContentForm.scss';

interface Props {
  onClickNext: () => void;
  template: TemplateApplication;
}

const ContentForm: React.FC<Props> = ({ onClickNext, template }) => {
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);
  const navigate = useNavigate();
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const defaultLanguage = getDefaultLanguage() || 'nb';
  const currentBulletinId = store.currentBulletinId;
  const languageOptions = getLanguageOptions;

  const {
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    control,
  } = useForm<Inputs>({
    // defaultValues: preloadedValues,
    shouldFocusError: true,
  });

  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'subjectAndPreviewArray', // unique name for your Field Array
  });

  const [chosenLanguages, setChosenLanguages] = useState<OptionType[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>(defaultLanguage);
  const [draftPosted, setDraftPosted] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<boolean>(false);
  const [hasImage, setHasImage] = useState<boolean>(false);

  const getImageFromForm = (): string | null => {
    const currentImage = getValues().subjectAndPreviewArray.find(
      (languageValues: { language?: string }) => languageValues?.language === activeLanguage,
    )?.bilde;
    return currentImage && currentImage !== '0' && currentImage !== 'NO_IMAGE' ? currentImage : null;
  };

  useEffect(() => {
    const image = getImageFromForm();
    setHasImage(image !== null ? true : false);
  });

  const [saveState, setSaveState] = useState<SaveOptions>(SaveOptions.NONE);
  const formChangeFromLastSaveRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    /* modify template vars to accomodate for obligatory/non-obligatory fields */
    template.global_variables.forEach((field) => {
      if (['bilde', 'ingress'].includes(field.variable_name)) {
        if (!field.title.includes('(valgfritt)')) field.title = field.title + ' (valgfritt)';
      } else field.mandatory = true;
    });

    const content = currentBulletin?.content?.contentInLanguage;
    setActiveLanguage(defaultLanguage);
    if (content && content.length > 0 && !watch('subjectAndPreviewArray')) {
      content.forEach((contentInLanguage, index) => {
        const {
          subject,
          previewText,
          language,
          variables: { feedback, ...rest },
        } = contentInLanguage;
        setFeedback((feedback && feedback !== '0') || false);
        const resultingContent = {
          subject,
          previewText,
          language,
          ...rest,
        };
        setTimeout(() => append(resultingContent), 50 * (index + 1));
      });

      const languageOptionsForContent = content.map(
        (contentInLanguage) =>
          languageOptions.find((lang) => lang.value === contentInLanguage.language) || {
            value: contentInLanguage.language,
            label: contentInLanguage.language,
          },
      );

      setChosenLanguages(languageOptionsForContent);
    } else if (!watch('subjectAndPreviewArray')) {
      const defaultLanguageOption = languageOptions.find((lang) => lang.value === defaultLanguage) || {
        value: defaultLanguage,
        label: defaultLanguage,
      };
      setChosenLanguages([defaultLanguageOption]);
      const entries = Object.fromEntries(template.global_variables.map((variable) => [variable.variable_name, '']));
      append({
        subject: '',
        previewText: '',
        language: defaultLanguage,
        ...entries,
      });
    }
  }, []);

  const setControllerRules = (templateVar: GlobalTemplateVariable) => {
    if (templateVar.mandatory) {
      if (templateVar.variable_name === 'bilde_alt' && !hasImage) {
        return {
          required: {
            value: false,
            message: '',
          },
        };
      } else {
        return {
          required: {
            value: true,
            message: errorMessages[templateVar.variable_name]
              ? errorMessages[templateVar.variable_name]
              : `${templateVar.title} er obligatorisk`,
          },
        };
      }
    }
  };

  const postBulletin = (data: Inputs, isDraft = false) => {
    if (currentBulletin) {
      const inputsInsertedInContent = setPreviewTextAndSubject(data);
      const content: BulletinContent = {
        from: {
          email:
            sessionStorage.getItem('organization') !== null &&
            JSON.parse(sessionStorage.getItem('organization') as string).defaultEmailAddress,
          name:
            sessionStorage.getItem('organization') !== null &&
            JSON.parse(sessionStorage.getItem('organization') as string).navn,
        },
        contentInLanguage: inputsInsertedInContent,
        defaultLanguage,
      };

      if (isDraft && currentBulletinId) {
        const bulletin: Bulletin = {
          ...currentBulletin,
          content,
        };
        store.setBulletin(bulletin);
        dbAccess.persistBulletin(bulletin, currentBulletinId).then(() => {
          if (!draftPosted) {
            setDraftPosted(true);
            setTimeout(() => setDraftPosted(false), 2000);
          }
        });
      } else {
        const bulletin: Bulletin = {
          ...currentBulletin,
          content,
        };
        store.setBulletin(bulletin);
        dbAccess.persistBulletin(bulletin, currentBulletinId);
        onClickNext();
      }
    }
  };

  const post = (data: Inputs, isDraft = false) => {
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(data, isDraft))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );
  };

  const setPreviewTextAndSubject = (data: Inputs) => {
    const orgJson =
      sessionStorage.getItem('organization') && JSON.parse(sessionStorage.getItem('organization') as string);

    const emblemWithTextExist =
      orgJson.kommunevaapenWithName && orgJson.kommunevaapenWithName !== '' && orgJson.kommunevaapenWithName !== '0';
    const emblemWithoutTextExist =
      orgJson.kommuneVaapen && orgJson.kommuneVaapen !== '' && orgJson.kommuneVaapen !== '0';

    return data.subjectAndPreviewArray.map((dataSet) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, language, subject, previewText, ...variables } = dataSet;

      const sanitizedVariables = Object.fromEntries(
        Object.entries(variables).map(([key, val]) => [key, val ? juice.inlineContent(val, styles) : val]),
      );

      const contentForLanguage = {
        subject,
        previewText,
        language,
        variables: {
          ...sanitizedVariables,
          previewText,
          feedback: feedback ? '1' : '0',
          org_emblem: emblemWithTextExist
            ? orgJson.kommunevaapenWithName
            : emblemWithoutTextExist
            ? orgJson.kommuneVaapen
            : 'NO_IMAGE',
          emblem_alt_text:
            orgJson.kommunevaapenWithName || orgJson.kommuneVaapen ? 'Emblem for ' + orgJson.navn : 'NO_IMAGE',
          ...generateUrlObject(dataSet.language, currentBulletinId || '', sessionStorage.organizationId, feedback),
        },
      };
      return {
        ...contentForLanguage,
      };
    });
  };

  const deleteLanguage = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent> | React.KeyboardEvent<SVGSVGElement>,
    lang: string,
  ) => {
    e.stopPropagation();

    const indexOfLanguage = fields
      .map((itemValue: unknown) => itemValue as Record<string, string>)
      .findIndex((item) => item.language === lang);
    if (indexOfLanguage !== -1) {
      remove(indexOfLanguage);
    }
    const updatedChosenLanguages = chosenLanguages.filter((langOption) => langOption.value !== lang);
    setChosenLanguages(updatedChosenLanguages);

    if (activeLanguage === lang) {
      setActiveLanguage(updatedChosenLanguages?.[0]?.value || '');
    }
  };

  const onFocusLanguageChange = (fieldLanguage: string) => {
    if (activeLanguage !== fieldLanguage) {
      setActiveLanguage(fieldLanguage);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (formChangeFromLastSaveRef.current) {
        setSaveState(SaveOptions.SAVING);
        formChangeFromLastSaveRef.current = false;
        post({ subjectAndPreviewArray: watch('subjectAndPreviewArray') }, true);
        setTimeout(() => {
          setSaveState(SaveOptions.SAVED);
          setTimeout(() => {
            setSaveState(SaveOptions.NONE);
          }, 5000);
        }, 2000);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [watch('subjectAndPreviewArray')]);

  const isFieldInvalid = (index: number, type: string) =>
    errors?.subjectAndPreviewArray?.[index]?.[type]?.message ? true : false;

  /* if element is associated with an error, show it, else show the intended help text */
  const generateHelpText = (index: number, helpText: string, type: string): string | undefined => {
    return errors?.subjectAndPreviewArray?.[index]?.[type]?.message
      ? errors?.subjectAndPreviewArray?.[index]?.[type]?.message
      : helpText;
  };

  return (
    <>
      {template ? (
        <CreateNewTemplate title={'Innhold'} save={saveState}>
          <form
            onSubmit={handleSubmit((data) => post(data))}
            onChange={() => (formChangeFromLastSaveRef.current = true)}
          >
            <div className="contentFormFields">
              <LanguageMenu
                chosenLanguages={chosenLanguages}
                languageOptions={languageOptions}
                activeLanguage={activeLanguage}
                setActiveLanguage={setActiveLanguage}
                append={append}
                setChosenLanguages={setChosenLanguages}
                deleteLanguage={deleteLanguage}
              />
              {chosenLanguages.length > 0 && (
                <>
                  {fields.map((itemValue: unknown, index: number) => {
                    const { id, language, subject, previewText, ...contentVariables } = itemValue as Record<
                      string,
                      string
                    >;
                    return (
                      <div
                        key={id}
                        className={'contentFormFields__elements ' + (language !== activeLanguage ? 'hide' : '')}
                      >
                        <div className="lightBlueBackground innhold__title">
                          <Controller
                            render={({ field: { ref, ...rest } }) => (
                              <Input
                                aria-label={`Emnefelt ${language}`}
                                type="text"
                                id={`subject-${language}`}
                                title="Emnefelt"
                                info={generateHelpText(
                                  index,
                                  'Vi anbefaler emnefelt på rundt 35 tegn, men du har mulighet til å bruke opp til 150 tegn for å beskrive e-posten din til mottaker. ',
                                  'subject',
                                )}
                                // onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                                key={`subjectAndPreviewArray[${index}].subject${language}`}
                                onFocus={() => onFocusLanguageChange(language)}
                                className={`contentFormFields--blue ${
                                  isFieldInvalid(index, 'subject') ? 'contentFormFields__elements--invalid' : ''
                                }`}
                                inputRef={ref}
                                labelIcon={<EmailIcon className="labelIcon" />}
                                {...rest}
                              />
                            )}
                            defaultValue={subject}
                            control={control}
                            name={`subjectAndPreviewArray.${index}.subject` as 'subjectAndPreviewArray.0.subject'}
                            rules={{ required: { value: true, message: errorMessages.subject } }}
                          />

                          <Controller
                            render={({ field: { ref, ...rest } }) => (
                              <Input
                                type="text"
                                id={`preview-${language}`}
                                title="Forhåndsvisningstekst"
                                aria-label={`Forhåndsvisningstekst ${language}`}
                                info={generateHelpText(
                                  index,
                                  'Denne teksten er en veldig kort oppsummering av innholdet i e-posten. Teksten brukes blant annet til e-postvarsling på mobil.',
                                  subject,
                                )}
                                key={`subjectAndPreviewArray.${index}.previewText${language}`}
                                onFocus={() => onFocusLanguageChange(language)}
                                className={`contentFormFields--blue ${
                                  isFieldInvalid(index, 'subject') ? 'contentFormFields__elements--invalid' : ''
                                }`}
                                inputRef={ref}
                                labelIcon={<EmailIcon className="labelIcon" />}
                                {...rest}
                              />
                            )}
                            defaultValue={previewText}
                            control={control}
                            name={
                              `subjectAndPreviewArray.${index}.previewText` as 'subjectAndPreviewArray.0.previewText'
                            }
                            rules={{ required: { value: true, message: errorMessages.previewText } }}
                          />
                        </div>
                        <Controller
                          render={() => (
                            <Input
                              name={`subjectAndPreviewArray[${index}].language`}
                              key={`subjectAndPreviewArray[${index}].language${language}`}
                              className={'noDisplay'}
                              type={'text'}
                              title={'språk'}
                              placeholder={'språk'}
                            />
                          )}
                          defaultValue={language}
                          control={control}
                          name={`subjectAndPreviewArray[${index}].language` as 'subjectAndPreviewArray.0.previewText'}
                        />

                        {template.global_variables.sort(sortByPosition).map((variable) => (
                          <div
                            className={`${
                              activeLanguage !== language || (!hasImage && variable.variable_name === 'bilde_alt')
                                ? 'noDisplay'
                                : variable.variable_name === 'bilde' ||
                                  variable.variable_name === 'bilde_alt' ||
                                  variable.variable_name === 'feedback' ||
                                  variable.variable_name === 'begrunnelse'
                                ? 'display display--extraspacing'
                                : 'display'
                            }`}
                            key={variable.title + language}
                          >
                            <InputSwitch
                              controllerRules={setControllerRules(variable)}
                              evaluatedVariable={variable}
                              contentVariables={contentVariables}
                              feedback={feedback}
                              setFeedback={setFeedback}
                              itemLanguage={language}
                              control={control}
                              index={index}
                              onFocusLanguageChange={onFocusLanguageChange}
                              errorText={errorMessages[variable.variable_name]}
                              isInvalid={isFieldInvalid(index, variable.variable_name)}
                              onChange={() => (formChangeFromLastSaveRef.current = true)}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </>
              )}

              <div>
                <NavigationButton disabled={!template} />
              </div>
            </div>
          </form>
        </CreateNewTemplate>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default ContentForm;
