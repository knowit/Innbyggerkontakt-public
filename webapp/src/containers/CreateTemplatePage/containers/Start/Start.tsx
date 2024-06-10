import { useMemo } from 'react';
import { useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '../../../../components';
import { StoreContext } from '../../../../contexts';
import { useUser } from '../../../../hooks';
import { Template } from '../../../../models';
import { CreateMessageHeader } from '../../../CreateMessagePage/components';
import { SaveOptions } from '../../../CreateMessagePage/util';
import { useTemplate } from '../../contexts/TemplateContext';
import CategoryTags from './components/CategoryTags/CategoryTags';
import NavigationButtons from './components/NavigationButtons/NavigationButtons';

import './Start.scss';

interface StartProps {
  onClickNext: () => void;
}

export type StartData = {
  name: string;
  description: string;
  recipientDescription: string;
  tags: string[];
};
type StartDataKeys = keyof StartData;

const Start = ({ onClickNext }: StartProps) => {
  const { dbAccess } = useContext(StoreContext);
  const { template, setValues } = useTemplate();
  const { organizationId } = useUser();
  const [saveState, setSaveState] = useState<SaveOptions>(SaveOptions.SAVED);

  const formChangeFromLastSaveRef = useRef<boolean>(false);
  const templateRef = useRef<Template | null>(template);
  templateRef.current = template;

  const intervalRef = useRef<NodeJS.Timer>();

  const {
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<StartData>({
    shouldFocusError: true,
    mode: 'onBlur',
    defaultValues: useMemo(() => {
      return {
        name: template?.name ?? '',
        description: template?.description ?? '',
        recipientDescription: template?.recipientDescription ?? '',
        tags: template?.tags ?? [],
      };
    }, [template]),
  });

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

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (!name) return;
      if (type === 'change') {
        formChangeFromLastSaveRef.current = true;
        setSaveState(SaveOptions.SAVING);
        setValues({ [name]: value[name as StartDataKeys] });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const post = (template: Template) => {
    if (template?.id) dbAccess.updateTemplate(template.id, template);
  };

  const toSubmit = (data: StartData) => {
    let newTemplate = { ...templateRef.current };

    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        newTemplate[key as StartDataKeys] = value as (string & string[]) | undefined;
      }
    });

    if (!templateRef.current?.id) {
      dbAccess.createNewTemplate(organizationId || '').then((newId) => {
        if (newId) {
          newTemplate = { ...newTemplate, id: newId, orgId: organizationId };
          setValues(newTemplate);
          post(newTemplate);
          onClickNext();
        }
      });
    } else {
      setValues(newTemplate);
      post(newTemplate);
      onClickNext();
      dbAccess.updateTemplate(templateRef.current?.id, templateRef.current);
    }
  };

  useEffect(() => {
    if (template?.id) {
      setValue('name', template?.name ?? '');
      setValue('description', template?.description ?? '');
      setValue('recipientDescription', template?.recipientDescription ?? '');
      setValue('tags', template?.tags ?? []);
    }
  }, [template?.id]);

  return (
    <div className="newTemplateContainer">
      <CreateMessageHeader
        title="Ny mal"
        save={saveState}
        description={
          'Her lager du nye maler. Når de er publisert vil kommunene se malene og lage utsendinger basert på den. Feltene under omhandler informasjon som vises til kommunene når de skal ta i bruk malene.'
        }
      />
      <form className="newTemplateForm" onSubmit={handleSubmit(toSubmit)}>
        <div className="startTemplateFieldsContainer">
          <Controller
            render={({ field: { ref, ...rest } }) => (
              <Input
                aria-label={`Navn på mal`}
                type="text"
                id={`template name`}
                title="Navn på mal"
                key={'name'}
                info={
                  errors.name?.message
                    ? errors.name?.message
                    : 'Navnet på malen kommer til å vises for kommunene når de skal velge malen.'
                }
                className={`contentFormFields--blue ${
                  errors.name?.message ? 'contentFormFields__elements--invalid' : ''
                }`}
                inputRef={ref}
                {...rest}
              />
            )}
            defaultValue={template?.name ?? ''}
            control={control}
            name={'name'}
            rules={{ required: 'Må ha et navn!' }}
          />

          <Controller
            render={({ field: { ref, ...rest } }) => (
              <Input
                type="text"
                id={`description-nb`}
                title="Beskrivelse til kommunen"
                aria-label={`Beskrivelse til kommunen nb`}
                info={
                  errors.description?.message
                    ? errors.description?.message
                    : 'Denne teksten vises når kommunene åpner forhåndsvisningen til malen og bør gi et inntrykk av hva malen skal utføre eller oppnå, og gi kommunene inspirasjon til å ta i bruk malen.'
                }
                key={'description'}
                className={`contentFormFields--blue ${
                  errors.description?.message ? 'contentFormFields__elements--invalid' : ''
                }`}
                inputRef={ref}
                {...rest}
              />
            )}
            defaultValue={template?.description ?? ''}
            control={control}
            name={'description'}
            rules={{ required: 'Må ha en beskrivelse!' }}
          />

          <Controller
            render={({ field: { ref, ...rest } }) => (
              <Input
                type="text"
                id={`recipients-nb`}
                title="Hvem er mottaker?"
                aria-label={`Hvem er mottaker?`}
                info={
                  errors.recipientDescription?.message
                    ? errors.recipientDescription?.message
                    : 'Denne teksten er en beskrivelse til kommunene om hvem malen er rettet til. Hva er målgruppene for denne mailen?'
                }
                key={`recipientDescription`}
                className={`contentFormFields--blue ${
                  errors.recipientDescription?.message ? 'contentFormFields__elements--invalid' : ''
                }`}
                inputRef={ref}
                {...rest}
              />
            )}
            defaultValue={template?.recipientDescription ?? ''}
            control={control}
            name={'recipientDescription'}
            rules={{ required: 'Må ha en mottaker beskrivelse!' }}
          />
          <Controller
            render={({ field: { onChange, value, ref, ...rest } }) => {
              return (
                <CategoryTags
                  id="tags-nb"
                  title="Kategorier"
                  info={
                    errors.tags?.message
                      ? errors.tags?.message
                      : 'Angi hvilke kategorier malen faller under. Man kan velge flere kategorier samtidig, men malen bør ikke ha for mange.'
                  }
                  aria-label="Kategorier"
                  key={'tags'}
                  onChange={onChange}
                  defaultValue={value}
                  inputRef={ref}
                  {...rest}
                />
              );
            }}
            defaultValue={template?.tags ?? []}
            control={control}
            name={'tags'}
            rules={{ required: 'Må ha kategorier!' }}
          />
        </div>
        <NavigationButtons onNavigate={onClickNext} submit={true} exitButton={true} />
      </form>
    </div>
  );
};

export default Start;
