import { Bulletin, SEARCH_FILTER_OPTIONS } from '../../models';

/* used for filtering in Search component */
export function filterBulletin(
  bulletin: Bulletin,
  searchTerm: string,
  toggledFilters: string[],
  fromDate?: Date,
  toDate?: Date,
) {
  /* search term */

  if (!bulletin.channel && bulletin.type) {
    bulletin = {
      ...bulletin,
      channel: { name: 'email', type: bulletin.type },
    };
  }

  if (!bulletin.name.toLowerCase().includes(searchTerm.toLowerCase())) {
    return false;
  }
  /* toggled filters */
  const { SMS, EMAIL, AUTO, SINGLE, DRAFT, ACTIVE, PLANNED, FINISHED } = SEARCH_FILTER_OPTIONS;
  if (toggledFilters.includes(SMS) && bulletin.channel.name !== 'sms') {
    return false;
  }

  if (toggledFilters.includes(EMAIL) && bulletin.channel.name !== 'email') {
    return false;
  }

  if (toggledFilters.includes(AUTO) && bulletin.channel.type !== 'event') {
    return false;
  }

  if (toggledFilters.includes(SINGLE) && bulletin.channel.type !== 'search') {
    return false;
  }

  if (toggledFilters.includes(DRAFT) && bulletin.status !== 'draft') {
    return false;
  }

  if (toggledFilters.includes(ACTIVE) && !(bulletin.channel.type == 'event' && bulletin.status === 'active')) {
    return false;
  }

  if (toggledFilters.includes(PLANNED)) {
    if (!(bulletin.execution?.datetime && new Date(bulletin.execution.datetime) > new Date())) {
      return false;
    }
  }

  if (toggledFilters.includes(FINISHED) && bulletin.status !== 'finished') {
    return false;
  }

  /* date interval */
  if (bulletin.lastChanged) {
    const lastChanged: Date = new Date(bulletin.lastChanged);
    const from = fromDate ? fromDate : new Date(0);
    const to = toDate ? toDate : new Date();

    /* set dates to start/end of day */
    lastChanged.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    if (!(lastChanged >= from && lastChanged <= to)) {
      return false;
    }
  }

  return true;
}

export function sortBulletins(a: Bulletin, b: Bulletin) {
  if (!a.lastChanged || Number.isNaN(Date.parse(a.lastChanged))) {
    return -1;
  } else if (!b.lastChanged || Number.isNaN(Date.parse(b.lastChanged))) {
    return 1;
  }

  return new Date(b.lastChanged).getTime() - new Date(a.lastChanged).getTime();
}
