import { Text } from '../../components';
import Informasjon from './Information';
import Personvern from './Privacy';

export const Infoside: React.FC = () => {
  return (
    <div>
      <Text className="regular48">info.innbyggerkontakt.no (mer omfattende info)</Text>
      <div>
        <Informasjon />
      </div>
      <div>
        <Personvern />
      </div>
      {'Liten link for CtA for potensielle interesserte kommuner og Footer'}
    </div>
  );
};
export default Infoside;
