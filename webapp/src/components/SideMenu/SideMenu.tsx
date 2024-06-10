import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import ArrowBack from '@mui/icons-material/ArrowBack';
import BarChart from '@mui/icons-material/BarChart';
import Brush from '@mui/icons-material/Brush';
import Create from '@mui/icons-material/Create';
import FolderOpen from '@mui/icons-material/FolderOpen';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import List from '@mui/icons-material/List';
import Person from '@mui/icons-material/Person';
import PlayCircleFilled from '@mui/icons-material/PlayCircleFilled';
import PlayCircleOutline from '@mui/icons-material/PlayCircleOutline';
import PriorityHigh from '@mui/icons-material/PriorityHigh';
import Settings from '@mui/icons-material/Settings';
import ViewList from '@mui/icons-material/ViewList';

import Add from '@mui/icons-material/Add';
import Search from '@mui/icons-material/Search';
import './SideMenu.scss';

interface SideMenu {
  icon?: string;
  path: Array<BreadCrumb | RolebasedBreadCrumb | SubPathBreadcrumb>;
  currentUserRoles: string[];
}

interface BreadCrumb {
  name: string;
  url: string;
  icon: string;
  className?: string;
  onClick?: () => void;
}

interface RolebasedBreadCrumb extends BreadCrumb {
  roles: string[];
}

interface SubPathBreadcrumb extends BreadCrumb {
  subPaths: Array<BreadCrumb | RolebasedBreadCrumb>;
}

type SettingsBreadCrumb = BreadCrumb | SubPathBreadcrumb | RolebasedBreadCrumb;

const rolebasedBreadcrumbFilter = (userRoles: string[]) => (breadCrumb: SettingsBreadCrumb) => {
  if ('roles' in breadCrumb) {
    return breadCrumb.roles.some((value) => userRoles.includes(value));
  }
  return true;
};

const Item: React.FC<(BreadCrumb | SubPathBreadcrumb) & { currentUserRoles: string[] }> = (breadcrumb) => {
  const { icon, name, url, currentUserRoles } = breadcrumb;
  const location = useLocation();
  const activeItem = location.pathname.includes(url);
  const activeSubItem =
    'subPaths' in breadcrumb ? breadcrumb.subPaths.some((sub) => sub.url === location.pathname) : false;

  const iconClassName = `navButtonIcon ${breadcrumb.className}`;

  return (
    <>
      <Link
        className={`${activeItem ? 'activeBreadcrumb activeBreadcrumb--disabled' : 'activeBreadcrumb'} ${
          activeSubItem ? 'activeSubItem' : ''
        } ${breadcrumb.className}`}
        to={url}
        onClick={breadcrumb.onClick}
      >
        {(() => {
          switch (icon) {
            case 'ViewList':
              return <ViewList className={iconClassName} />;
            case 'BarChart':
              return <BarChart className={iconClassName} />;
            case 'list':
              return <List className={iconClassName} />;
            case 'PlayCircleFilledIcon':
              return <PlayCircleFilled className={iconClassName} />;
            case 'PlayCircleOutlineIcon':
              return <PlayCircleOutline className={iconClassName} />;
            case 'pen':
              return <Create className={iconClassName} />;
            case 'folder':
              return <FolderOpen className={iconClassName} />;
            case 'exclamation':
              return <PriorityHigh className={iconClassName} />;
            case 'settings':
              return <Settings className={iconClassName} />;
            case 'brush':
              return <Brush className={iconClassName} />;
            case 'person':
              return <Person className={iconClassName} />;
            case 'Add':
              return <Add className={iconClassName} />;
            case 'Search':
              return <Search className={iconClassName} />;
            case 'Lightbulb':
              return <LightbulbOutlined className={iconClassName} />;
          }
        })()}
        <span className={`${activeItem ? 'active' : ''}`}>{name}</span>
      </Link>
      {'subPaths' in breadcrumb && (activeItem || activeSubItem)
        ? breadcrumb.subPaths.filter(rolebasedBreadcrumbFilter(currentUserRoles)).map((item, i) => (
            <Link
              key={i}
              className={`breadcrumb__subPath ${
                !activeItem && item.url === location.pathname
                  ? 'activeBreadcrumb activeBreadcrumb--disabled'
                  : 'inactiveBreadcrumb'
              } ${breadcrumb.className}`}
              to={item.url}
              onClick={breadcrumb.onClick}
            >
              <span>{item.name}</span>
            </Link>
          ))
        : null}
    </>
  );
};

export const SideMenu: React.FC<SideMenu> = ({ path, currentUserRoles }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`sidemenu-style ${isOpen ? '' : 'closedSideMenu'}`}>
      <button
        className={`sidemenuOpenButton activeBreadcrumb ${isOpen ? '' : 'closedSideMenu'}`}
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        aria-label={isOpen ? 'Close side menu' : 'Open side menu'}
      >
        <ArrowBack className={`navButtonIcon arrowButton ${isOpen ? '' : 'closedSideMenu'}`} />
        Lukk
      </button>
      {path.filter(rolebasedBreadcrumbFilter(currentUserRoles)).map((item) => (
        <div key={item.url} className="sidemenuItemParent">
          <Item
            {...item}
            currentUserRoles={currentUserRoles}
            className={isOpen ? '' : 'closedSideMenu'}
            onClick={() => setIsOpen(false)}
          />
        </div>
      ))}
    </div>
  );
};

export default SideMenu;
