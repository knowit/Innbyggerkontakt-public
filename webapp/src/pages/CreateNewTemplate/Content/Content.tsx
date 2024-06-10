import Email from '@mui/icons-material/Email';
import { getDefaultLanguage, getLanguageOptions } from 'pages/CreateNew/Content/util';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { EditorComponent, Input, Loader } from '../../../components';
import { CreateMessageHeader, FormImageUploader } from '../../../containers/CreateMessagePage/components';
import { LanguageMenu } from '../../../containers/CreateMessagePage/containers/ContentForm/components';
import { SaveOptions } from '../../../containers/CreateMessagePage/util';
import NavigationButtons from '../../../containers/CreateTemplatePage/containers/Start/components/NavigationButtons/NavigationButtons';
import { useTemplate } from '../../../containers/CreateTemplatePage/contexts/TemplateContext';
import { StoreContext } from '../../../contexts';
import { OptionType, Template, TemplateContent } from '../../../models';
import { regexOutImgWidth } from './utils';

interface Props {
  onClickNext: () => void;
}
type ContentArray = { contentArray: TemplateContent[] };

const defaultContent: TemplateContent = {
  language: '',
  content: '',
  image: '',
  image_alt: '',
  ingress: '',
  heading: '',
  previewText: '',
  reason: '',
  subject: '',
};

const Content: React.FC<Props> = ({ onClickNext }) => {
  const defaultLanguage = getDefaultLanguage() || 'nb';

  const { dbAccess } = useContext(StoreContext);
  const { template, setValues } = useTemplate();

  const [saveState, setSaveState] = useState<SaveOptions>(SaveOptions.SAVED);

  const templateRef = useRef<Template | null>(template);
  templateRef.current = template;

  const formChangeFromLastSaveRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timer>();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<ContentArray>({
    shouldFocusError: true,
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control, // control props comes from useForm (optional: if you are using FormContext)
    name: 'contentArray', // unique name for your Field Array
  });

  const [chosenLanguages, setChosenLanguages] = useState<OptionType[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>(defaultLanguage);

  // Create content structure for each language
  useLayoutEffect(() => {
    setActiveLanguage(defaultLanguage);
    if (templateRef.current) {
      const contents = templateRef.current.contentArray;

      if (contents && contents.length > 0) {
        append(contents);
        const languageOptionsForContent = contents?.map(
          (content) =>
            getLanguageOptions.find((language) => language.value === content.language) || {
              value: content.language || '',
              label: content.language || '',
            },
        );
        setChosenLanguages(languageOptionsForContent || []);
      } else {
        const defaultLanguageOption = getLanguageOptions.find((language) => language.value === defaultLanguage) || {
          value: defaultLanguage,
          label: defaultLanguage,
        };
        setChosenLanguages([defaultLanguageOption]);
        append({ ...defaultContent, language: defaultLanguage });
      }
    }
  }, []);

  // Autosave effect
  useEffect(() => {
    let toClear = false;
    intervalRef.current = setInterval(() => {
      if (formChangeFromLastSaveRef.current) {
        templateRef.current ? post(templateRef.current) : null;
        formChangeFromLastSaveRef.current = false;
        setSaveState(SaveOptions.SAVED);
        if (toClear) {
          clearInterval(intervalRef.current);
        }
      }
    }, 5000);
    return () => {
      toClear = true;
    };
  }, []);

  const post = (template: Template) => {
    if (template?.id) dbAccess.updateTemplate(template.id, template);
  };

  // Load content for default language
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name) return;
      if (type === 'change') {
        formChangeFromLastSaveRef.current = true;
        setSaveState(SaveOptions.SAVING);
        setValues({ ...value } as Template);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // New fields added/removed
  useEffect(() => {
    formChangeFromLastSaveRef.current = true;
    setSaveState(SaveOptions.SAVING);
    setValues({ contentArray: fields });
  }, [fields]);

  const toSubmit = (data: ContentArray) => {
    if (templateRef.current?.id) {
      const newTemplate = { id: templateRef.current?.id, contentArray: data.contentArray };
      post(newTemplate);
      onClickNext();
    }
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

  return (
    <>
      {template?.id ? (
        <div className="newTemplateContainer">
          <CreateMessageHeader title="Innhold" save={saveState} />
          <form className="newTemplateForm" onSubmit={handleSubmit(toSubmit)}>
            <div className="contentFormFields">
              <LanguageMenu
                chosenLanguages={chosenLanguages}
                languageOptions={getLanguageOptions}
                activeLanguage={activeLanguage}
                setActiveLanguage={setActiveLanguage}
                append={append}
                appendObject={defaultContent}
                setChosenLanguages={setChosenLanguages}
                deleteLanguage={deleteLanguage}
              />
              {chosenLanguages.length > 0 && (
                <>
                  {fields.map((itemValue: unknown, index: number) => {
                    const { id, language } = itemValue as Record<string, string>;
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
                                info={
                                  errors.contentArray?.[index]?.subject?.message
                                    ? errors.contentArray?.[index]?.subject?.message
                                    : 'Vi anbefaler emnefelt på rundt 35 tegn, men du har mulighet til å bruke opp til 150 tegn for å beskrive e-posten din til mottaker. '
                                }
                                // onChange={(e: ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                                key={`contentArray.${index}.subject-${language}`}
                                onFocus={() => onFocusLanguageChange(language)}
                                className={`contentFormFields--blue ${
                                  errors.contentArray?.[index]?.subject?.message
                                    ? 'contentFormFields__elements--invalid'
                                    : ''
                                }`}
                                labelIcon={<Email className="labelIcon" />}
                                inputRef={ref}
                                {...rest}
                              />
                            )}
                            defaultValue={template.contentArray?.[index]?.subject ?? ''}
                            control={control}
                            name={`contentArray.${index}.subject`}
                            rules={{ required: 'Emnefeltet trenger tittel' }}
                          />

                          <Controller
                            render={({ field: { ref, ...rest } }) => (
                              <Input
                                type="text"
                                id={`preview-${language}`}
                                title="Forhåndsvisningstekst"
                                aria-label={`Forhåndsvisningstekst ${language}`}
                                info={
                                  errors.contentArray?.[index]?.previewText?.message
                                    ? errors.contentArray?.[index]?.previewText?.message
                                    : 'Denne teksten er en veldig kort oppsummering av innholdet i e-posten. Teksten brukes blant annet til e-postvarsling på mobil.'
                                }
                                key={`contentArray.${index}.previewText-${language}`}
                                onFocus={() => onFocusLanguageChange(language)}
                                className={`contentFormFields--blue ${
                                  errors.contentArray?.[index]?.previewText?.message
                                    ? 'contentFormFields__elements--invalid'
                                    : ''
                                }`}
                                labelIcon={<Email className="labelIcon" />}
                                inputRef={ref}
                                {...rest}
                              />
                            )}
                            defaultValue={template.contentArray?.[index]?.previewText ?? ''}
                            control={control}
                            name={`contentArray.${index}.previewText`}
                            rules={{ required: 'Meldingen trenger en forhåndsvisningstekst' }}
                          />
                        </div>
                        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <Controller
                            // eslint-disable-next-line
                            render={({ field: { ref, ...rest } }) => (
                              <FormImageUploader
                                title="Bilde (valgfritt)"
                                info="Hovedbildet står øverst i e-posten og kan oppsummere innholdet i e-posten. Vi anbefaler en bredde på bildene fra 600px til 650px for å få best mulig innhold til brukerene både på mobil og desktop. Bildet kan være så langt du vil, men bør ikke overstige en filstørrelse på 1MB. Formatene som er støttet  er jpeg, jpg, png og gif."
                                key={`image-${language}`}
                                altText={'Last opp bilde'}
                                aria-label={'Nytt bilde'}
                                className={''}
                                location={`templates/${template?.id}/image`}
                                {...rest}
                              />
                            )}
                            defaultValue={template?.contentArray?.[index]?.image ?? ''}
                            control={control}
                            name={`contentArray.${index}.image`}
                            rules={{}}
                          />
                          {template.contentArray?.[index]?.image ? (
                            <Controller
                              render={({ field: { ref, ...rest } }) => (
                                <Input
                                  type="text"
                                  id={`image_alt-${language}`}
                                  title="Alternativ bildetekst"
                                  aria-label={`Alternativ bildetekst ${language}`}
                                  info={
                                    errors.contentArray?.[index]?.image_alt?.message
                                      ? errors.contentArray?.[index]?.image_alt?.message
                                      : 'Alternativ bildetekst brukes for at blinde og svaksynte skal kunne lese om og forstå bildet.'
                                  }
                                  key={`contentArray.${index}.image_alt-${language}`}
                                  onFocus={() => onFocusLanguageChange(language)}
                                  className={`contentFormFields--blue ${
                                    errors.contentArray?.[index]?.image_alt?.message
                                      ? 'contentFormFields__elements--invalid'
                                      : ''
                                  }`}
                                  inputRef={ref}
                                  {...rest}
                                />
                              )}
                              defaultValue={template?.contentArray?.[index]?.heading ?? ''}
                              control={control}
                              name={`contentArray.${index}.image_alt`}
                              rules={{
                                required: {
                                  value: template.contentArray?.[index]?.image ? true : false,
                                  message: 'Alternativ bildetekst er påkrevd når bilde er lagt til',
                                },
                              }}
                            />
                          ) : null}
                          <Controller
                            render={({ field: { ref, ...rest } }) => (
                              <Input
                                type="text"
                                id={`heading-${language}`}
                                title="Overskrift"
                                aria-label={`Overskrift ${language}`}
                                info={
                                  errors.contentArray?.[index]?.heading?.message
                                    ? errors.contentArray?.[index]?.heading?.message
                                    : 'Overskrift er forskjellig fra e-postens emnefelt og kan godt være litt mer beskrivende.'
                                }
                                key={`contentArray.${index}.heading-${language}`}
                                onFocus={() => onFocusLanguageChange(language)}
                                className={`contentFormFields--blue ${
                                  errors.contentArray?.[index]?.heading?.message
                                    ? 'contentFormFields__elements--invalid'
                                    : ''
                                }`}
                                inputRef={ref}
                                {...rest}
                              />
                            )}
                            defaultValue={template?.contentArray?.[index]?.heading ?? ''}
                            control={control}
                            name={`contentArray.${index}.heading`}
                            rules={{ required: 'E-posten din må ha en overskrift' }}
                          />
                          <Controller
                            render={({ field }) => (
                              <EditorComponent
                                id={`ingress-${language}`}
                                title="Ingress (valgfritt)"
                                aria-label={`Ingress ${language}`}
                                className={`contentFormFields--blue ${
                                  errors.contentArray?.[index]?.ingress?.message
                                    ? 'contentFormFields__elements--invalid'
                                    : ''
                                }`}
                                allowImage={false}
                                {...field}
                                location={`templates/${template?.id}/editor_image`}
                              />
                            )}
                            defaultValue={regexOutImgWidth(template.contentArray?.[index]?.ingress ?? '')}
                            control={control}
                            name={`contentArray.${index}.ingress`}
                            rules={{}}
                          />
                          <Controller
                            render={({ field }) => (
                              <EditorComponent
                                id={`content-${language}`}
                                title={'Innhold'}
                                aria-label={`Innhold ${language}`}
                                info={
                                  errors.contentArray?.[index]?.content?.message
                                    ? errors.contentArray?.[index]?.content?.message
                                    : undefined
                                }
                                className={
                                  errors.contentArray?.[index]?.content ? 'contentFormFields__elements--invalid' : ''
                                }
                                {...field}
                                location={`templates/${template?.id}/editor_image`}
                              />
                            )}
                            defaultValue={regexOutImgWidth(template.contentArray?.[index]?.content ?? '')}
                            control={control}
                            name={`contentArray.${index}.content`}
                            rules={{ required: 'E-posten din må ha et innhold' }}
                          />
                          <Controller
                            render={({ field }) => (
                              <EditorComponent
                                id={`reason-${language}`}
                                title="Begrunnelse for utsending til mottakere"
                                info={
                                  errors.contentArray?.[index]?.reason?.message
                                    ? errors.contentArray?.[index]?.reason?.message
                                    : 'Denne teksten forklarer formålet for hvorfor denne eposten sendes ut og vil vises på bunnen av eposten som sendes ut.'
                                }
                                aria-label={`Begrunnelse for utsending til mottakere ${language}`}
                                className={`contentFormFields--blue ${
                                  errors.contentArray?.[index]?.reason?.message
                                    ? 'contentFormFields__elements--invalid'
                                    : ''
                                }`}
                                allowImage={false}
                                {...field}
                                location={`templates/${template?.id}/editor_image`}
                              />
                            )}
                            defaultValue={regexOutImgWidth(template.contentArray?.[index]?.reason ?? '')}
                            control={control}
                            name={`contentArray.${index}.reason`}
                            rules={{
                              required:
                                'E-posten din må ha en begrunnelse for å forklare innbyggerne hvordan kommunen har tilgang til kontaktinformasjonen deres',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            <NavigationButtons onNavigate={onClickNext} submit={true} />
          </form>
        </div>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default Content;
