import { Text } from '../../../../components';

import './TemplateStatistics.scss';

const TemplateStatistics = () => {
  return (
    <div className="templateStatisticsContainer">
      <h3 className="semibold18">Statistikk</h3>
      <Text className="regular14 darkBrightBlue">Antall eposter sendt med denne malen: 12524</Text>
      <Text className="regular14 darkBrightBlue">Antall utsendinger laget med denne malen: 13</Text>
    </div>
  );
};

export default TemplateStatistics;
