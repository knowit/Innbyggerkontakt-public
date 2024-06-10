import HomeButtons from 'containers/HomePage/components/HomeButtons/HomeButtons';
import InspirationRow from 'containers/HomePage/components/InspirationRow/InspirationRow';
import useUser from 'hooks/useUser';
import StatisticsComponent from 'molecules/Home/StatisticsComponent/StatisticsComponent';
import News from 'organisms/Home/News/News';

import { Link } from 'react-router-dom';
import './Home.scss';

export const Home: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { organization } = useUser();

  return (
    <div className="wrapperHome">
      <div>
        <h1 className="regular24 darkBlue">{organization?.navn}</h1>
        <HomeButtons />
      </div>
      <div>
        <InspirationRow />
        <div>
          <div>
            <h2 className="regular18">Nylige utsendinger og nyheter</h2>
            <Link to={'/oversikt/siste-nytt'}>Se alt som har skjedd i det siste</Link>
          </div>
          <News listmax={5} />
          <StatisticsComponent />
        </div>
      </div>
    </div>
  );
};

export default Home;
