import { SideMenu } from '../../components/SideMenu/SideMenu';

import useUser from '../../hooks/useUser';

import './HomeInfo.scss';

export const HomeInfo: React.FC = () => {
  const { role } = useUser();

  const overviewBreadcrumb = [
    {
      name: 'Oversikt',
      url: '/oversikt/hjem',
      icon: 'ViewList',
    },
    {
      name: 'Siste nytt',
      url: '/oversikt/siste-nytt',
      icon: 'exclamation',
    },
    {
      name: 'Inspirasjon',
      url: '/oversikt/inspirasjon',
      icon: 'Lightbulb',
    },
    {
      name: 'Aktive meldinger',
      url: '/oversikt/aktive-utsendelser',
      icon: 'PlayCircleFilledIcon',
    },
    {
      name: 'Planlagte meldinger',
      url: '/oversikt/planlagte-utsendelser',
      icon: 'PlayCircleOutlineIcon',
    },
    {
      name: 'Utkast',
      url: '/oversikt/utkast',
      icon: 'pen',
    },
    {
      name: 'Historikk',
      url: '/oversikt/historikk',
      icon: 'folder',
    },
    /*
    {
      name: 'Innsikt',
      url: '/oversikt/innsikt',
      icon: 'BarChart',
    },
    */
  ];

  return (
    <div className="overviewMeny">
      <SideMenu path={overviewBreadcrumb} currentUserRoles={role ? [role] : []} />
    </div>
  );
};

export default HomeInfo;
