import Add from '@mui/icons-material/Add';
import AddCircle from '@mui/icons-material/AddCircle';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import Create from '@mui/icons-material/Create';
import * as DOMPurify from 'dompurify';
import { useContext, useEffect, useState } from 'react';
import { CirclePicker } from 'react-color';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, EditorComponent, Input, Text } from '../../../components';
import { StoreContext } from '../../../contexts';
import { OptionType, Style } from '../../../models';
import ColorPickerModal from '../../../molecules/Settings/ColorPickerModal/ColorPickerModal';
import { FontDropdown } from '../../../molecules/Settings/FontDropdown';

import '../../../routes/Settings/Settings';
import './Styles.scss';

export const CreateStyle: React.FC = () => {
  type ParamTypes = 'id';

  const { id } = useParams<ParamTypes>();
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const navigate = useNavigate();
  const [name, setname] = useState<string>('');
  const [nameExists, setNameExists] = useState<boolean>(false);
  const [footer, setFooter] = useState<string>('');
  const [editFooter, setEditFooter] = useState<boolean>(id ? false : true);
  const [fontValue, setFontValue] = useState<OptionType>({ label: '', value: '' });
  const [hidden, setHidden] = useState<boolean>(true);

  const [colors, setColors] = useState<string[]>([]);

  const [primaryColorHexCode, setPrimaryColorHexCode] = useState('');
  const [secondaryColorHexCode, setSecondaryColorHexCode] = useState('');

  const [showPrimaryColorPicker, setshowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setshowSecondaryColorPicker] = useState(false);

  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  const [saveShouldBeDisabled, setSaveShouldBeDisabled] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      dbAccess.getDocument(sessionStorage.organizationId, 'styles', id).then((style) => {
        setname(style?.name || '');
        setNameExists(style?.name);
        setEditFooter(false);
        const properFooter = style?.footer ? style.footer.replaceAll(/<p.+?>/g, '<p>') : '';
        setFooter(properFooter);
        setFontValue(
          {
            value: style?.font,
            label: style?.font,
          } || '',
        );
        setPrimaryColorHexCode(style?.primaryColor || '');
        setSecondaryColorHexCode(style?.secondaryColor || '');
      });
    }

    dbAccess.getColors(sessionStorage.organizationId).then((colors) => {
      setColors(colors?.colors || []);
    });
  }, [dbAccess, id]);

  useEffect(() => {
    const disable: boolean = [name, primaryColorHexCode, secondaryColorHexCode, fontValue, footer].some(
      (entry) => !entry,
    );
    setSaveShouldBeDisabled(disable);
  }, [name, primaryColorHexCode, secondaryColorHexCode, fontValue, footer]);

  const submit = () => {
    const switchedFooter = footer.replaceAll(/<p/g, '<p style="text-align:center;"');
    if (id) {
      dbAccess.getDocument(sessionStorage.organizationId, 'styles', id).then((style) => {
        if (style?.status === 'done') {
          const newStyle: Style = {
            name: name,
            primaryColor: primaryColorHexCode,
            secondaryColor: secondaryColorHexCode,
            font: (fontValue as OptionType) ? (fontValue as OptionType).value : '',
            footer: switchedFooter,
            status: 'processing',
            lastChangedBy: 'client',
          };

          setSaveError('');

          dbAccess.addColors(sessionStorage.organizationId, colors);

          dbAccess.saveStyle(newStyle, sessionStorage.organizationId, id).then(() => {
            navigate('/innstillinger/stiler');
          });
        } else {
          setSaveError('Forrige oppdatering er ikke ferdig prosessert, prøv igjen om en liten stund.');
        }
      });
    } else {
      dbAccess.getAllDocumentsInCollection(sessionStorage.organizationId, 'styles').then((styles) => {
        const tempNames: Array<string> = [];
        styles.forEach((style) => {
          if (style.data().name !== undefined) {
            tempNames.push(style.data().name);
          }
        });
        if (tempNames.includes(name)) {
          setSaveError('Navnet er allerede i bruk');
        } else {
          const newStyle: Style = {
            name: name,
            primaryColor: primaryColorHexCode,
            secondaryColor: secondaryColorHexCode,
            font: (fontValue as OptionType) ? (fontValue as OptionType).value : '',
            footer: switchedFooter,
            status: 'processing',
            lastChangedBy: 'client',
          };
          setSaveError('');

          dbAccess.addColors(sessionStorage.organizationId, colors);

          // The following is weird, as this will only run if id is undefined. However, the function will make a new style if styleId is undefined.
          dbAccess.saveStyle(newStyle, sessionStorage.organizationId, id).then(() => {
            navigate('/innstillinger/stiler');
          });
        }
      });
    }
  };

  const savePrimaryColor = () => {
    if (!colors.includes(primaryColorHexCode)) {
      setColors((color) => [...color, primaryColorHexCode]);
      setshowPrimaryColorPicker(false);
      setError('');
    } else {
      setError('Fargen er allerede lagt til.');
    }
  };

  const saveSecondaryColor = () => {
    if (!colors.includes(secondaryColorHexCode)) {
      setColors((color) => [...color, secondaryColorHexCode]);
      setshowSecondaryColorPicker(false);
      setError('');
    } else {
      setError('Fargen er allerede lagt til.');
    }
  };

  const cancel = () => {
    setshowSecondaryColorPicker(false);
    setshowPrimaryColorPicker(false);
    setError('');
  };

  return (
    <div className="item ">
      <div className="settings__header">
        <Add className="itemIcon_title" />
        {!id ? (
          <h1>Stiler</h1>
        ) : (
          <div className="createStyle__title">
            <h1>Endre stil&nbsp;</h1>
          </div>
        )}
      </div>
      <form onSubmit={submit} className="createStyle__form">
        <div className="genereltItem">
          <div className="regular18">Name</div>
          <Input
            onFocus={() => setHidden(false)}
            onBlur={() => setHidden(true)}
            className={`userInput ${nameExists ? 'settings__input--transparent' : 'settings__input--white'}`}
            type="text"
            placeholder="Lag et navn på stilen din"
            onChange={(e) => setname(e.target.value)}
            value={name}
            disabled={nameExists}
          >
            <Create className={`${hidden ? 'createStyle__icon--hidden' : 'createStyle__icon--visible'} inputicon`} />
          </Input>
        </div>

        <div className="genereltItem">
          <h3 className="genereltItem__h3 regular18">Hovedfarge </h3>
          <p className="regular14 gray">
            Denne brukes på tekst som skal fremheves, som for eksempel titler og linker. Den bør være ganske mørk og
            kunne leses over sekundærfargen
          </p>
          <div className="colorPickerRow">
            <CirclePicker
              circleSpacing={5}
              colors={colors}
              width="100%"
              color={primaryColorHexCode}
              onChange={(e) => setPrimaryColorHexCode(e.hex)}
            />
            <div
              className="createStyle__icon--margin clickableIcon"
              onClick={() => setshowPrimaryColorPicker(!showPrimaryColorPicker)}
            >
              <AddCircle fontSize="small" className="controlPointIcon" />
            </div>
            <div className="absolute">
              <ColorPickerModal
                error={error}
                open={showPrimaryColorPicker}
                onSave={savePrimaryColor}
                cancel={cancel}
                setColorHexCode={setPrimaryColorHexCode}
                colorHexCode={primaryColorHexCode}
              />
            </div>
          </div>

          <h3 className="enereltItem__h3 regular18">Sekundærfarge</h3>
          <p className="regular14 gray">
            Denne brukes som bakgrunnsfarge på e-posten og bør være ganske lys eller gjennomsiktig. Tekst i hovedfargen
            skal kunne leses når den er skrevet over denne fargen
          </p>
          <div className="colorPickerRow">
            <CirclePicker
              circleSpacing={5}
              colors={colors}
              width="100%"
              color={secondaryColorHexCode}
              onChange={(e) => setSecondaryColorHexCode(e.hex)}
            />
            <div
              className="createStyle__icon--margin clickableIcon"
              onClick={() => setshowSecondaryColorPicker(!showSecondaryColorPicker)}
            >
              <AddCircle fontSize="small" className="controlPointIcon" />
            </div>

            <div className="absolute">
              <ColorPickerModal
                error={error}
                open={showSecondaryColorPicker}
                onSave={saveSecondaryColor}
                cancel={cancel}
                setColorHexCode={setSecondaryColorHexCode}
                colorHexCode={secondaryColorHexCode}
              />
            </div>
          </div>
        </div>

        <div className="genereltItem">
          <FontDropdown value={fontValue} onChange={setFontValue} />
        </div>

        <div className="genereltItem">
          {
            <>
              <EditorComponent
                title="Bunntekst"
                info="Teksten som står nederst i e-posten. Kan inneholde linker og kan gjerne linke til kontakt-siden for kommunen din eller andre nyttige steder man kan finne mer generell informasjon."
                onChange={setFooter}
                placeholder="Skriv inn tekst for footer på eposten"
                value={footer}
                location="styles"
                className={editFooter ? '' : 'noDisplay'}
              />
              {!editFooter && (
                <>
                  <label className="fieldTitle darkestGreenTitle">Bunntekst</label>
                  <div className="displayFooterBox">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(footer) }} />
                    <div onClick={() => setEditFooter(true)}>
                      <Create className="editIcon" />
                    </div>
                  </div>
                </>
              )}
            </>
          }
        </div>

        <Button
          className="createStyle__button--save primary"
          type="button"
          disabled={saveShouldBeDisabled}
          onClick={() => submit()}
        >
          <Text className="textButton">{id ? 'Oppdater stil' : 'Lagre stil'}</Text>
        </Button>
        {/*<Button
          className="secondary"
          type="button"
          disabled={true}
          onClick={() => submit()}
          style={{ float: 'right', marginLeft: '1%', marginTop: '1%' }}
        >
          <Text className="textButton">Send eksempel e-post</Text>
        </Button>*/}
        <Button
          className="createStyle__button--back secondary"
          type="button"
          onClick={() => navigate('/innstillinger/stiler')}
        >
          <Text className="textButton">
            <ChevronLeft fontSize="small" />
            <p>Tilbake</p>
          </Text>
        </Button>
        {saveError ? <Text className="textError">{saveError}</Text> : ''}
      </form>
    </div>
  );
};
export default CreateStyle;
