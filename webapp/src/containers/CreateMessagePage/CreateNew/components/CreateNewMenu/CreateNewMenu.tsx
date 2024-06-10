import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { RoutesType } from '../../../../../routes/CreateNew/Bulletin/utils';

import CheckCircle from '@mui/icons-material/CheckCircle';
import Lens from '@mui/icons-material/Lens';
import ArrowBack from '@mui/icons-material/ArrowBack';

import './CreateNewMenu.scss';
import { findIndexFromPath } from '../../utils';

interface CreateNewMenuProps {
  routes: RoutesType[];
  currentPath: string;
}

interface CustomLinkProps {
  to: string;
  title: string;
  isOpen: boolean;
  formStatus: 'current' | 'done' | 'toDo' | 'disabled' | 'doneDisabled';
  onClick: () => void;
}
const CustomLink = ({ to, title, formStatus, onClick, isOpen }: CustomLinkProps) => {
  const svgSwitch = (formStatus: string) => {
    switch (formStatus) {
      case 'current':
        return <Lens className="createNewMenu--svg createNewMenu--svg__active" />;
      case 'done':
        return <CheckCircle className="createNewMenu--svg createNewMenu--svg__active" />;
      case 'toDo':
        return <Lens className="createNewMenu--svg createNewMenu--svg__active" />;
      case 'disabled':
        return <Lens className="createNewMenu--svg createNewMenu--svg__inactive" />;
      case 'doneDisabled':
        return <CheckCircle className="createNewMenu--svg createNewMenu--svg__inactive" />;
    }
  };

  return (
    <li
      onClick={formStatus === 'done' || formStatus === 'toDo' ? onClick : undefined}
      className={`createNewMenu--li ${formStatus} ${isOpen ? 'createNewMenuIsOpen' : ''}`}
    >
      {formStatus === 'disabled' || 'doneDisabled' ? (
        <a role="link" aria-disabled="true" className="createNewMenu--link">
          {svgSwitch(formStatus)} <span className={`createNewMenu--span__${formStatus}`}>{title}</span>
        </a>
      ) : (
        <Link to={to} className="createNewMenu--link" aria-label={`${title}`}>
          {svgSwitch(formStatus)} <span className={`createNewMenu--span__${formStatus}`}>{title}</span>
        </Link>
      )}
    </li>
  );
};

const CreateNewMenu = ({ routes, currentPath }: CreateNewMenuProps) => {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const findFormerPathIsFilled = (path: string) => {
    const step = findIndexFromPath(routes, path);
    if (step) {
      return routes[step - 1].filled;
    } else return false;
  };

  const checkForDisabledRoutes = (path: string): boolean => {
    const currentStep: number = findIndexFromPath(routes, path);
    if (currentStep - 1 >= 0) {
      if (findFormerPathIsFilled(path)) {
        const findFormerPath = routes[currentStep - 1].path;
        return checkForDisabledRoutes(findFormerPath);
      } else {
        return true;
      }
    }
    return false;
  };

  const stepStatus = (route: RoutesType, index: number) => {
    const currentStep: number = findIndexFromPath(routes, currentPath);
    if (currentStep < index && route.filled && checkForDisabledRoutes(route.path)) {
      return 'doneDisabled';
    } else if (currentStep < index && checkForDisabledRoutes(route.path)) {
      return 'disabled';
    } else if (currentStep === index) {
      return 'current';
    } else if (currentStep > index || (currentStep < index && route.filled)) {
      return 'done';
    } else if (findFormerPathIsFilled(route.path)) {
      return 'toDo';
    } else {
      return 'disabled';
    }
  };

  return (
    <ul className={`createNewMenu ${isOpen ? 'createNewMenuIsOpen' : ''}`}>
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
      {routes.map((route, index) => (
        <CustomLink
          to={`${route.path}`}
          title={route.title}
          onClick={() => navigate(route.path)}
          key={`${route.path}-${route.title}`}
          formStatus={stepStatus(route, index)}
          isOpen={isOpen}
        />
      ))}
    </ul>
  );
};

export default CreateNewMenu;
