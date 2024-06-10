import { RoutesType } from '../../../routes/CreateNew/Bulletin/utils';

// return paths for search bulletin
export const makeSearchRoute = (routes: RoutesType[]): RoutesType[] =>
  routes.reduce((filtered: RoutesType[], route: RoutesType) => {
    if (route.channel.email === 'search' || route.channel.email === 'felles') {
      filtered.push(route);
    }
    return filtered;
  }, []);

// return paths for event bulletin
export const makeEventRoute = (routes: RoutesType[]): RoutesType[] =>
  routes.reduce((filtered: RoutesType[], route: RoutesType) => {
    if (route.channel.email === 'event' || route.channel.email === 'felles') {
      filtered.push(route);
    }
    return filtered;
  }, []);

// return paths for SMS bulletin
export const makeSMSEventRoute = (routes: RoutesType[]): RoutesType[] =>
  routes.reduce((filtered: RoutesType[], route: RoutesType) => {
    if (route.channel.sms) {
      filtered.push(route);
    }
    return filtered;
  }, []);

// returns last string from location.pathname
export const findPathFromLocation = (pathname: string): string => {
  const path = pathname.split('/').pop();
  if (path) {
    return path;
  } else {
    return '404';
  }
};

// returns index of path, takes in typeroute and path from history.location
export const findIndexFromPath = (typeRoute: RoutesType[], path: string): number => {
  const pathName: number = typeRoute.findIndex((route) => route.path === findPathFromLocation(path));
  return pathName;
};
