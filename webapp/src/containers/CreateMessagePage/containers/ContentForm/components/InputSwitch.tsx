import { Checkbox, CheckboxFields, EditorComponent, Input } from 'components';
import { GlobalTemplateVariable } from 'models';
import { Inputs } from 'pages/CreateNew/Content/util';
import { Control, Controller } from 'react-hook-form';
import { FormImageUploader } from '../../../components';

interface InputSwitchProps {
  evaluatedVariable: GlobalTemplateVariable;
  contentVariables: Record<string, string>;
  feedback: boolean;
  setFeedback: (val: boolean) => void;
  itemLanguage: string;
  control: Control<Inputs>;
  index: number;
  onFocusLanguageChange: (fieldLanguage: string) => void;
  errorText?: string;
  isInvalid?: boolean;
}

interface InputSwitchProps {
  evaluatedVariable: GlobalTemplateVariable;
  contentVariables: Record<string, string>;
  feedback: boolean;
  setFeedback: (val: boolean) => void;
  itemLanguage: string;
  control: Control<Inputs>;
  index: number;
  onFocusLanguageChange: (fieldLanguage: string) => void;
  errorText?: string;
  isInvalid?: boolean;
  controllerRules?: Record<string, unknown>;
  onChange: () => void;
}

export const InputSwitch = ({
  evaluatedVariable,
  contentVariables,
  feedback,
  setFeedback,
  itemLanguage,
  control,
  index,
  onFocusLanguageChange,
  errorText,
  isInvalid,
  controllerRules,
}: InputSwitchProps) => {
  const valueForEvaluatedVariable =
    contentVariables && contentVariables[evaluatedVariable.variable_name] !== 'NO_IMAGE'
      ? contentVariables[evaluatedVariable.variable_name]
      : '';

  const bulletinId = sessionStorage.getItem('currentBulletinId') || '';

  const regexOutImgWidth = (imageSource: string) => {
    const reg = new RegExp(/<img.+?>/gm);

    const replacer = (match: string) => {
      const innerReg = new RegExp(/(min-width:.*?%;|max-width: .*?%;|width: .*?%;)/gm);
      return match.replaceAll(innerReg, '');
    };

    if (!imageSource) {
      return imageSource;
    }

    let check = imageSource;
    check = check.replaceAll(reg, replacer);
    return check;
  };

  switch (evaluatedVariable.input_component) {
    case 'image':
      return (
        <Controller
          key={evaluatedVariable.variable_name + itemLanguage}
          render={({ field }) => (
            <FormImageUploader
              key={evaluatedVariable.variable_name + itemLanguage}
              altText={valueForEvaluatedVariable || 'Last opp bilde'}
              info={isInvalid ? errorText : evaluatedVariable.help_text}
              title={evaluatedVariable.title}
              aria-label={`${evaluatedVariable.title} ${itemLanguage}`}
              className={isInvalid ? 'contentFormFields__elements--invalid' : ''}
              location={`bulletin/${bulletinId}/image`}
              {...field}
            />
          )}
          defaultValue={contentVariables?.[evaluatedVariable.variable_name]}
          control={control}
          name={
            `subjectAndPreviewArray.${index}.${evaluatedVariable.variable_name}` as 'subjectAndPreviewArray.0.variable'
          }
          rules={controllerRules}
        />
      );
    case 'box':
      return (
        <Controller
          key={evaluatedVariable.variable_name + itemLanguage}
          render={({ field }) => (
            <EditorComponent
              id={`${evaluatedVariable.variable_name}-${itemLanguage}`}
              title={evaluatedVariable.title}
              info={isInvalid ? errorText : evaluatedVariable.help_text}
              aria-label={`${evaluatedVariable.title} ${itemLanguage}`}
              className={isInvalid ? 'contentFormFields__elements--invalid' : ''}
              {...field}
              onChange={(e) => {
                field.onChange(e);
              }}
              location={`bulletin/${bulletinId}/editor_image`}
            />
          )}
          defaultValue={regexOutImgWidth(contentVariables?.[evaluatedVariable.variable_name])}
          control={control}
          name={
            `subjectAndPreviewArray.${index}.${evaluatedVariable.variable_name}` as 'subjectAndPreviewArray.0.variable'
          }
          rules={controllerRules}
        />
      );
    case 'line':
      return (
        <Controller
          key={evaluatedVariable.variable_name + itemLanguage}
          render={({ field: { ref, ...rest } }) => (
            <Input
              id={`${evaluatedVariable.variable_name}-${itemLanguage}`}
              type="text"
              title={evaluatedVariable.title}
              aria-label={`${evaluatedVariable.title} ${itemLanguage}`}
              info={isInvalid ? errorText : evaluatedVariable.help_text}
              className={isInvalid ? 'contentFormFields__elements--invalid' : ''}
              inputRef={ref}
              onFocus={() => onFocusLanguageChange(itemLanguage)}
              {...rest}
            />
          )}
          defaultValue={contentVariables?.[evaluatedVariable.variable_name]}
          control={control}
          name={
            `subjectAndPreviewArray.${index}.${evaluatedVariable.variable_name}` as 'subjectAndPreviewArray.0.variable'
          }
          rules={controllerRules}
        />
      );
    case 'checkbox':
      return (
        <>
          <CheckboxFields
            id={`${evaluatedVariable.variable_name}-${itemLanguage}`}
            key={evaluatedVariable.variable_name + itemLanguage}
            info={isInvalid ? errorText : evaluatedVariable.help_text}
            className={isInvalid ? 'contentFormFields__elements--invalid' : ''}
            title="Tilbakemelding"
          >
            <Checkbox label={evaluatedVariable.title} checked={feedback} onChange={() => setFeedback(!feedback)} />
          </CheckboxFields>
        </>
      );
    default:
      return <> </>;
  }
};
