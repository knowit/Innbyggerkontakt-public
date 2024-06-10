import SentimentSatisfied from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAlt from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfied from '@mui/icons-material/SentimentVeryDissatisfied';

import './MoodBox.scss';

interface Props {
  rating: { positive: number; neutral: number; negative: number };
}
//TODO: Forskjellige størrelse på iconer utifra hvilke som har høyest og lavest prosent
//størrelse : 3, 5, 7

export const MoodBox: React.FC<Props> = ({ rating }) => {
  return (
    <div className="lightBlueBackground">
      <div className="horizontalDivAlign">
        <div className="moodItem">
          <span className="semibold24 lightBlue">{rating.positive.toString()}%</span>
          <SentimentSatisfiedAlt fontSize="large" className="moodBoxIcon" />
        </div>

        <div className="moodItem">
          <span className="semibold24 lightBlue">{rating.neutral.toString()}%</span>
          <SentimentSatisfied fontSize="large" className="moodBoxIcon" />
        </div>

        <div className="moodItem">
          <span className="semibold24 lightBlue">{rating.negative.toString()}%</span>
          <SentimentVeryDissatisfied fontSize="large" className="moodBoxIcon" />
        </div>
      </div>
    </div>
  );
};

export default MoodBox;
