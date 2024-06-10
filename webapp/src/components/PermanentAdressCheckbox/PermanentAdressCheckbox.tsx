import { Checkbox } from 'innbyggerkontakt-design-system';
import { FC } from 'react';

import './PermanentAdressCheckbox.scss';

interface Props {
  inkludererOppholdsadresse: boolean;
  setInkludererOppholdsadresse: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PermanentAdressCheckbox: FC<Props> = ({ setInkludererOppholdsadresse, inkludererOppholdsadresse }) => {
  return (
    <>
      <div className="adresseCheckbox">
        <p className="adresseCheckbox--header">Ikke permanente innbyggere</p>
        <p className="adresseCheckbox--description regular14 gray">
          Personer som har oppholdsadresse men ikke permanent bostedsadresse. Typisk for studenter eller
          sesongarbeidere.
        </p>
        <Checkbox
          label={'Ja, send til disse også'}
          checked={inkludererOppholdsadresse}
          onChange={() => setInkludererOppholdsadresse((inkludererOppholdsadresse) => !inkludererOppholdsadresse)}
        />
      </div>
    </>
  );
};

export default PermanentAdressCheckbox;
