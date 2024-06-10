import { FormWrapper } from '../index';
import './CheckboxFields.scss';

interface Props {
  children?: React.ReactNode;
  info?: string;
  title?: string;
  className?: string;
  id?: string;
}

export const CheckboxFields: React.FC<Props> = ({ children, info, title, className, id }) => (
  <div className={`checkboxFields ${className || ''}`} id={id}>
    <FormWrapper title={title} info={info}>
      <div className="checkboxes">{children}</div>
    </FormWrapper>
  </div>
);

export default CheckboxFields;
