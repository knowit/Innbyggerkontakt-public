import { isEmail, ReactMultiEmail } from 'react-multi-email';
import 'react-multi-email/style.css';

import CloseIcon from '@mui/icons-material/Close';

interface Props {
  emails: string[];
  setEmails: (e: string[]) => void;
}

const TestMailPopup: React.FC<Props> = ({ emails, setEmails }) => {
  return (
    <div className="testEmail">
      <p className="testEmail_title">Send en test-epost til</p>
      <p className="testEmail_explanation">Skriv inn e-postene du vil sende til, separer med mellomrom.</p>
      <ReactMultiEmail
        className="emailInput"
        placeholder=""
        emails={emails}
        onChange={(_emails: string[]) => {
          setEmails(_emails);
        }}
        validateEmail={(email) => {
          return isEmail(email); // return boolean
        }}
        getLabel={(email: string, index: number, removeEmail: (index: number) => void) => {
          return (
            <div className="acceptedMails" data-tag key={index}>
              {email}
              <CloseIcon className="removeTestEmailIcon" onClick={() => removeEmail(index)} />
            </div>
          );
        }}
      />
    </div>
  );
};

export default TestMailPopup;
