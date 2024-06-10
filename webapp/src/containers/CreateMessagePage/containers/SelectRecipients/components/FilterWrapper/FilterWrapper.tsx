import { ReactNode } from 'react';
import { FilterValues } from '../../../../../../models';
import { getAppropriateIcon } from '../../searchUtil';
import './FilterWrapper.scss';

interface User {
  overskrift?: string;
  infotekst?: string;
  ekstraInfotekst?: string;
  filterType?: FilterValues['recipientFilter'];
  children?: ReactNode;
}

export const FilterWrapper: React.FC<User> = ({ overskrift, infotekst, ekstraInfotekst, filterType, children }) => (
  <div className="recipientsTypeItemWrapperExpand">
    <div className="recipientsContentWithIcon">
      <div className="iconsWrapper">{getAppropriateIcon(filterType || '', 'recipientsContentIcon')}</div>
      <div>
        <h3 className="regular18 recipientsContentHeader">{overskrift}</h3>
        <p className="noMargin infotekst regular14 darkBlue">{ekstraInfotekst ? ekstraInfotekst : infotekst}</p>
      </div>
    </div>
    {children}
  </div>
);

export default FilterWrapper;
