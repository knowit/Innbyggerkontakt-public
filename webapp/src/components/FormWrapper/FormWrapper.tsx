import { FieldWrapperProps } from '../../models';
import './FormWrapper.scss';

export const FormWrapper: React.FC<FieldWrapperProps> = ({
  disabled = false,
  info,
  title,
  showTitle = true,
  titleComponent,
  additionalTitleClassName,
  labelForId,
  errorMessage,
  icon,
  children,
}) => {
  return (
    <>
      {showTitle && (
        <label
          className={`fieldTitle ${title || titleComponent ? '' : 'hidden'} ${disabled ? 'disabledText' : ''} ${
            additionalTitleClassName || ''
          } `}
          htmlFor={labelForId}
        >
          {icon ? icon : <></>}
          {titleComponent ? titleComponent : title || 'placeholder'}
        </label>
      )}
      {info && <p className="regular14 gray">{info}</p>}
      <div className={`componentInForm ${errorMessage ? 'formError' : ''}`}>
        {children}
        {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      </div>
    </>
  );
};

export default FormWrapper;
