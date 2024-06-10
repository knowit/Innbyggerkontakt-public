import { Store } from '../../../contexts/store';
import { Bulletin, LinkStatisticsData } from '../../../models';
import { getLinkStatistics } from '../../../utils/api';
import { generateUrl } from '../../../utils/util';

export type SmileyStats = {
  positive: number;
  neutral: number;
  negative: number;
};

export const getLinkStatsTotal = (bulletinId: string, orgId: string, languages: string[]) => {
  return getLinkStatistics(bulletinId).then((linkStats: LinkStatisticsData[]) => {
    const positiveLinkFeedback = languages.map((lang) => generateUrl('positive', lang, bulletinId, orgId));
    const neutralLinkFeedback = languages.map((lang) => generateUrl('neutral', lang, bulletinId, orgId));
    const negativeLinkFeedback = languages.map((lang) => generateUrl('negative', lang, bulletinId, orgId));
    const getClicksPerMessageStatsForLinks = (evaluatedLinks: string[]) =>
      linkStats
        .filter((stats) => evaluatedLinks.includes(stats.URL))
        .reduce((accum, linkStats) => accum + linkStats.ClickedMessagesCount, 0);
    const positiveClicks = getClicksPerMessageStatsForLinks(positiveLinkFeedback);
    const neutralClicks = getClicksPerMessageStatsForLinks(neutralLinkFeedback);
    const negativeClicks = getClicksPerMessageStatsForLinks(negativeLinkFeedback);

    const calculatePercentage = (clicks: number) => {
      const totalClicks = positiveClicks + neutralClicks + negativeClicks;
      return totalClicks ? Math.floor((clicks / totalClicks) * 100) : 0;
    };

    const smileyStats: SmileyStats = {
      positive: calculatePercentage(positiveClicks),
      neutral: calculatePercentage(neutralClicks),
      negative: calculatePercentage(negativeClicks),
    };
    return smileyStats;
  });
};

export const postBasedOn = (basedOnBulletin: Bulletin, currentBulletinId: string, store: Store) => {
  const basedOnExecution = basedOnBulletin.execution;
  const bulletin: Bulletin = {
    basedOn: { id: currentBulletinId, type: 'bulletin' },
    ...basedOnBulletin,
    execution: {
      ...basedOnExecution,
      datetime: undefined,
      active: false,
      type: basedOnExecution?.type || 'schedule',
    },
    name: '',
    templateApplicationStyleId: '',
    lastChangedBy: 'client',
  };
  store.setBulletin(bulletin);
};
