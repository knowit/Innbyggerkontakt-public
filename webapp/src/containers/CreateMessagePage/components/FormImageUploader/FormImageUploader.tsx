import { useState } from 'react';
import { FormWrapper, ImageUploader } from '../../../../components';
import './FormImageUploader.scss';
import { ValidationRules } from './ImageUploaderValidationRules';

interface Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  className?: string;
  altText: string;
  onChange: (file: string | undefined) => void;
  value: string | undefined;
  style?: React.CSSProperties | undefined;
  disabled?: boolean;
  info?: string | undefined;
  mandatory?: boolean;
  title?: string;
  showTitle?: boolean;
  location: string;
}

export const FormImageUploader: React.FC<Props> = ({
  className,
  altText,
  value,
  onChange,
  style,
  disabled = false,
  info,
  mandatory = false,
  showTitle = true,
  title,
  location,
}) => {
  const [warningMessage, setWarningMessage] = useState<string>('');

  return (
    <div className={`imageUploaderItems ${className}`}>
      <FormWrapper info={info} showTitle={showTitle} mandatory={mandatory} title={title}>
        {warningMessage !== '' && <p className="regular11 error">{warningMessage}</p>}
        <div className="imageUploaderInForm">
          <ImageUploader
            className={className}
            altText={altText !== 'NO_IMAGE' ? altText : ''}
            onChange={onChange}
            setWarningMessage={(message: string) => setWarningMessage(message)}
            imageUrl={value !== 'NO_IMAGE' ? value : ''}
            style={style}
            disabled={disabled}
            validation={ValidationRules}
            location={location}
          />
        </div>
      </FormWrapper>
    </div>
  );
};

export default FormImageUploader;
