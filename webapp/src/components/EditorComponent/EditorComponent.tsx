import { FormWrapper } from '../';
import { FieldWrapperProps } from '../../models';
import Editor from './Editor';
import './EditorComponent.scss';

export interface EditorProps extends FieldWrapperProps, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  className?: string;
  onChange: (text: string) => void;
  placeholder?: string;
  value: string;
  style?: React.CSSProperties | undefined;
  id?: string;
  location: string;
  info?: string;
  mandatory?: boolean;
  disabled?: boolean;
  showTitle?: boolean;
  errorMessage?: string;
  allowImage?: boolean;
}

const EditorComponent: React.FC<EditorProps> = ({
  className,
  onChange,
  placeholder,
  value,
  style,
  info,
  location,
  mandatory = false,
  showTitle = true,
  title,
  id,
  errorMessage,
  disabled = false,
  allowImage = true,
  ...rest
}) => {
  return (
    <div className={`inputEditorComponent ${className}`}>
      <FormWrapper
        labelForId={id}
        errorMessage={errorMessage}
        title={title}
        mandatory={mandatory}
        info={info}
        showTitle={showTitle}
        disabled={disabled}
      >
        <div className="editorComponent">
          <Editor
            onChange={onChange}
            placeholder={placeholder}
            value={value}
            style={style}
            id={id}
            disabled={disabled}
            location={location}
            allowImage={allowImage}
            {...rest}
          />
        </div>
      </FormWrapper>
    </div>
  );
};

export default EditorComponent;
