import { FormWrapper } from '../../../../components/';
import './SelectBetween.scss';

interface Props {
  className?: string;
  title: string;
  fromTitle?: string;
  children: JSX.Element[];
}
const SelectBetween: React.FC<Props> = ({ className = '', children, title }) => {
  return (
    <div className={`selectBetween`}>
      <FormWrapper title={title}>
        <div className={`selectBetweenFields--${className}`}>{children}</div>
      </FormWrapper>
    </div>
  );
};

export default SelectBetween;
