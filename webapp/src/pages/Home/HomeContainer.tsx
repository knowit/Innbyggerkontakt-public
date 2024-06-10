import { useLocation } from 'react-router';
import HomeInfo from '../../containers/HomePage/HomeInfo';
import StatisticsComponentMinimal from '../../molecules/Home/StatisticsComponent/StatisticsComponentMinimal';
import { HomeRoutes } from '../../routes/Home/HomeRoutes';

const HomeContainer = () => {
  const location = useLocation();

  return (
    <>
      {location.pathname.includes('oversikt') ? (
        <div className="homePage">
          <div className="homePageSideMenu">
            <HomeInfo />
            <StatisticsComponentMinimal />
          </div>
          <div className="homepageContent">
            <HomeRoutes />
          </div>
        </div>
      ) : null}
    </>
  );
};

export default HomeContainer;
