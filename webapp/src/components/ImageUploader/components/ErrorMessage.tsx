import { Text } from '../..';
import './../ImageUploader.scss';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  shortMessage: string;
  longMessage: string;
}

export const ErrorMessage: React.FC<Props> = ({ shortMessage, longMessage }) => {
  return (
    <>
      <div className="messageBoxError">
        <Text className="textLabel errorTitle">Oi! {shortMessage}</Text>
        <Text className="textObligatory">{longMessage}</Text>
      </div>
    </>
  );
};

export default ErrorMessage;
