import ChevronRight from '@mui/icons-material/ChevronRight';
import { Button, Loading } from 'innbyggerkontakt-design-system';
import { useEffect, useState } from 'react';
import { Text } from '../../../components';
import * as api from '../../../utils/api';

import './StatisticsComponent.scss';

const StatisticsComponent = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [organizationStatistics, setOrganizationStatistics] = useState<any>();
  const [finishedLoading, setFinishedLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    api
      .GetCampaignStatisticsForOrganization(controller.signal)
      .then((details) => {
        if (details !== undefined) {
          if (!details[0]) {
            setOrganizationStatistics(details);
          } else {
            setOrganizationStatistics(details[0]);
          }
        }
        setFinishedLoading(true);
      })
      .catch((error) => {
        console.error(`Error in home: ${error}`);
      });
    return () => {
      controller.abort();
    };
  }, []);

  const getNumberInProsent = (number: number) => {
    if (organizationStatistics?.MessageSentCount) {
      return Math.round((number / organizationStatistics?.MessageSentCount) * 100);
    } else return 0;
  };

  return (
    <div className="statisticsComponentContainer">
      {finishedLoading ? (
        <>
          <Text className="regular14 darkBrightBlue ">Statistikk for mailutsendelser de siste tre månedene </Text>
          <div className="statisticsSeparator" />
          <div>
            <div>
              <Text>Eposter sendt:</Text>
              <Text>{organizationStatistics?.MessageSentCount ?? 0}</Text>
            </div>
            <div>
              <Text>Andel som åpner:</Text>
              <Text>{`${getNumberInProsent(organizationStatistics?.MessageOpenedCount ?? 0)}%`}</Text>
            </div>
            <div>
              <Text>Antall for enkeltutsendinger:</Text>
              <Text>Ukjent</Text>
            </div>
            <div>
              <Text>Antall fra automatiske utsendelser:</Text>
              <Text>Ukjent</Text>
            </div>
          </div>
          <Button svg={[15, 25]} color="tertiary">
            Mer innsikt <ChevronRight />
          </Button>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default StatisticsComponent;
