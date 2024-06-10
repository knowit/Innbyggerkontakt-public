import News from 'organisms/Home/News/News';
import './LatestNewsPage.scss';

const LatestNewsPage = () => {
  return (
    <div className="latestNewsContainer">
      <h1>Siste nytt</h1>
      <News />
    </div>
  );
};

export default LatestNewsPage;
