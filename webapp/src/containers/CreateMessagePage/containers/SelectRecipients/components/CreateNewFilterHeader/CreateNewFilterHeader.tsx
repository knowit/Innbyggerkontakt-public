import { RECIPIENT_STAGE } from '../../../../../../models';
import { ChooseBoxOption } from '../../../../components';
import './CreateNewFilterHeader.scss';

interface Props {
  stage: RECIPIENT_STAGE;
}

export const CreateNewFilterHeader: React.FC<Props> = ({ stage }) => (
  <>
    <h2 className="semibold18 createNewFilterSubHeader">Lag ny gruppe av mottakere</h2>
    <div className="chooseBox">
      <ChooseBoxOption
        text={'Velg kilde'}
        active={stage === RECIPIENT_STAGE.CHOOSE_SOURCE}
        seen={true}
        checked={stage === RECIPIENT_STAGE.CHOOSE_CRITERIA}
      ></ChooseBoxOption>
      <ChooseBoxOption
        text={'Velg kriterier'}
        active={stage === RECIPIENT_STAGE.CHOOSE_CRITERIA}
        seen={stage === RECIPIENT_STAGE.CHOOSE_CRITERIA}
        checked={false}
      ></ChooseBoxOption>
    </div>
  </>
);

export default CreateNewFilterHeader;
