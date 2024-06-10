import { useContext, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { StoreContext } from 'contexts';

import { Bulletin } from 'models';

import { getLinkStatsTotal, postBasedOn, SmileyStats } from 'containers/ListView/MessagePreview/util';
import * as api from 'utils/api';

import { HomePageSMSSummary } from 'pages/Home';

import { MoodBox, PercentBox, StatisticsBox } from 'atoms';
import { Loader } from 'components';

import SummaryBoxEvent from 'pages/CreateNewTemplate/Summary/summaryPages/SummaryBoxEvent';
import SummaryBoxHistory from 'pages/CreateNewTemplate/Summary/summaryPages/SummaryBoxHistory';
import { SummarySearch } from './SummarySearch/SummarySearch';

import './MessageSummary.scss';

export const MessageSummary: React.FC = () => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;

  type ParamTypes = 'id' | 'type';
  const { id, type } = useParams<ParamTypes>();

  const [linkStats, setLinkStats] = useState<SmileyStats>({ positive: 0, neutral: 0, negative: 0 });
  const [data, setData] = useState<{ bulletin: Bulletin }>();

  const [loadingDone, setLoadingDone] = useState<boolean>(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bulletinStatistikk, setBulletinStatistikk] = useState<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bulletinCampaignStatistikk, setBulletinCampaignStatistikk] = useState<any>();

  useLayoutEffect(() => {
    let status = '';
    let typePath: string | undefined = undefined;
    if (id && type) {
      switch (type) {
        case 'planlagte':
          status = 'active';
          typePath = 'search';
          break;
        case 'aktive':
          status = 'active';
          typePath = 'event';
          break;

        case 'utkast':
          status = 'draft';
          break;

        case 'utsendte':
          status = 'finished';
          break;
      }
      dbAccess.getBulletinInvoice(id).then((res) => {
        store.setInvoice(res ? res : null);
      });
      dbAccess
        .getBulletin(sessionStorage.organizationId, id, status, typePath)
        .then((val) => {
          if (val) {
            const bulletin: Bulletin = {
              ...val,
              status: val.status,
              name: val.name,
              type: val.type ? val.type : val.channel.type,
              channel: val.channel
                ? val.channel.name === 'email'
                  ? { name: 'email', type: val.channel.type }
                  : { name: 'sms', type: 'search' }
                : { name: 'email', type: val.type },
            };
            setData({ bulletin: bulletin });
            store.setBulletin(bulletin);
          }

          if (status === 'draft') return;

          api.getStatistics(id).then((details) => {
            setBulletinStatistikk(details);
          });

          api.getCampaignStatisticForBulletin(id).then((details) => {
            setBulletinCampaignStatistikk(details);
          });

          getLinkStatsTotal(id, sessionStorage.getItem('organizationId') || '', ['nb', 'nn', 'sa']).then(
            (res: SmileyStats) => {
              setLinkStats(res);
            },
          );
        })
        .finally(() => setLoadingDone(true));
    }
  }, []);

  const cancelBulletin = () => {
    const currentBulletin = data?.bulletin as Bulletin;
    const currentExecution = currentBulletin.execution ? { ...currentBulletin.execution, active: false } : undefined;
    const currentDate = new Date().toString();
    const newStatus: Bulletin['status'] = 'finished';

    const draftBulletin = {
      ...currentBulletin,
      status: newStatus,
      endDate: currentDate,
      execution: currentExecution,
    };

    if (id) {
      dbAccess.persistBulletin(draftBulletin, id, 'active', newStatus);
    } else {
      // TODO: Catch to a error-message
    }
  };

  const baseOnCurrentBulletin = () => {
    if (id) {
      const currentBulletin = data?.bulletin as Bulletin;
      currentBulletin && postBasedOn(currentBulletin, id, store);
    }
  };

  const setBulletinToDraft = () => {
    const currentBulletin = data?.bulletin as Bulletin;
    const currentExecution = currentBulletin.execution ? { ...currentBulletin.execution, active: false } : undefined;
    const status: Bulletin['status'] = 'draft';

    const draftBulletin = {
      ...currentBulletin,
      status: status,
      execution: currentExecution,
    };
    if (id) {
      dbAccess.persistBulletin(draftBulletin, id, 'active', 'draft').then(() => {
        store.setBulletin(draftBulletin);
        store.setBulletinId(id);
      });
    } else {
      // TODO: Catch to a error-message
    }
  };

  const percentBox = [
    id && bulletinCampaignStatistikk && (
      <PercentBox
        key={id}
        mailSentCount={bulletinCampaignStatistikk?.MessageSentCount || 0}
        mailClickedCount={
          bulletinCampaignStatistikk?.MessageSentCount
            ? (bulletinCampaignStatistikk?.MessageClickedCount / bulletinCampaignStatistikk?.MessageSentCount) * 100
            : 0
        }
        mailOpenedCount={
          bulletinCampaignStatistikk?.MessageSentCount
            ? (bulletinCampaignStatistikk?.MessageOpenedCount / bulletinCampaignStatistikk?.MessageSentCount) * 100
            : 0
        }
        mailBouncedCount={
          bulletinCampaignStatistikk?.MessageSentCount
            ? (bulletinCampaignStatistikk?.MessageHardBouncedCount / bulletinCampaignStatistikk?.MessageSentCount) * 100
            : 0
        }
        className="lightBlueBackground"
      />
    ),
  ];

  return (
    <>
      {loadingDone ? (
        id &&
        type && (
          <>
            {(() => {
              switch (type) {
                case 'planlagte':
                  return data?.bulletin.channel.name === 'sms' ? (
                    <HomePageSMSSummary setBulletinToDraft={setBulletinToDraft} />
                  ) : (
                    <SummarySearch data={data} bulletinId={id} setBulletinToDraft={setBulletinToDraft} />
                  );
                case 'aktive':
                  return (
                    <div className="messageSummary">
                      <SummaryBoxEvent data={data} cancelBulletin={cancelBulletin} />
                      <div className="flexWrapperNoSpace">
                        {bulletinStatistikk && (
                          <div>
                            {data?.bulletin?.content?.contentInLanguage?.[0]?.variables?.feedback === '1' && (
                              <MoodBox rating={linkStats} />
                            )}

                            <StatisticsBox bulletinStatistikk={bulletinStatistikk} sent={true} />
                          </div>
                        )}
                        {percentBox}
                      </div>
                    </div>
                  );

                case 'utkast':
                  return data?.bulletin.channel.name === 'sms' ? (
                    <HomePageSMSSummary editable setBulletinToDraft={() => ''} />
                  ) : (
                    <SummarySearch data={data} bulletinId={id} setBulletinToDraft={() => ''} />
                  );

                case 'utsendte':
                  return data?.bulletin.channel.name === 'sms' ? (
                    <HomePageSMSSummary finished setBulletinToDraft={() => ''} />
                  ) : (
                    <div className="messageSummary">
                      <SummaryBoxHistory data={data} baseOnBulletin={baseOnCurrentBulletin} />

                      <div className="flexWrapperNoSpace">
                        <StatisticsBox bulletinStatistikk={bulletinStatistikk} sent={true} />

                        {percentBox}
                        {data?.bulletin?.content?.contentInLanguage?.[0]?.variables?.feedback === '1' && (
                          <MoodBox rating={linkStats} />
                        )}
                      </div>
                    </div>
                  );
              }
            })()}
          </>
        )
      ) : (
        <Loader />
      )}
    </>
  );
};

export default MessageSummary;
