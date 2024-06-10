//import './SummaryPage.scss';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './TestSmsPopup.scss';

interface Props {
  phoneNumberRef: React.MutableRefObject<string>;
}

const TestSmsPopup: React.FC<Props> = ({ phoneNumberRef }) => {
  return (
    <div className="testSmsPopupContainer">
      <p>Send en test sms</p>
      <p>Skriv inn telefonnummeret du vil sende til.</p>
      <PhoneInput
        defaultCountry="NO"
        className="testSmsPopup_phoneInput"
        onChange={(v) => {
          phoneNumberRef.current = v as string;
        }}
      />
    </div>
  );
};

export default TestSmsPopup;
