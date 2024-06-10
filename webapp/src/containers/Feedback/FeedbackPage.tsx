import Logo from '../../assets/logo.svg';
import { FeedbackNavbar } from './components';
import './FeedbackPage.scss';

interface Props {
  hidePublicNavbar?: boolean;
}

export const FeedbackPage: React.FC<Props> = ({ hidePublicNavbar }) => (
  <>
    {!hidePublicNavbar && <FeedbackNavbar />}
    <div className="content">
      <div className="feedbackPage">
        <img className="logo" src={Logo} alt="Innbyggerkontakt Logo" />
        <p>Takk for tilbakemeldingen!</p>
      </div>
    </div>
  </>
);

export default FeedbackPage;
