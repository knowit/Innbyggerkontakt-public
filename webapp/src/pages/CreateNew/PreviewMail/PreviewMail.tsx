import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import { generateHTMLfromTemplate } from '../../../containers/CreateMessagePage/mjml';
import { PopUpContext, StoreContext } from '../../../contexts';
import * as api from '../../../utils/api';

/*icons*/
import CreateIcon from '@mui/icons-material/Create';
import LaptopIcon from '@mui/icons-material/Laptop';
import MailIcon from '@mui/icons-material/Mail';
import NavigateBeforeOutlinedIcon from '@mui/icons-material/NavigateBeforeOutlined';
import NavigateNextOutlinedIcon from '@mui/icons-material/NavigateNextOutlined';
import SmartphoneIcon from '@mui/icons-material/Smartphone';

import {
  Button,
  Checkbox,
  LanguagePicker,
  Loader,
  PreviewDesktop,
  PreviewMobile,
  StandardPopUp,
  Text,
} from '../../../components';
import { ChooseBoxOption, CreateMessageError } from '../../../containers/CreateMessagePage/components';
import { Bulletin, BulletinContent, ContentInLanguage } from '../../../models';
import TestMailPopup from '../../../molecules/CreateNew/EmailPopup/TestMailPopup';

import './PreviewMail.scss';

interface Props {
  onClickNext: (sendToPath?: string | undefined) => void;
}

const PreviewMail: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const dbAccess = store.dbAccess;
  const currentBulletin = store.currentBulletin;
  const currentBulletinId = store.currentBulletinId;
  const { setPopUp } = useContext(PopUpContext);
  const navigate = useNavigate();

  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [mobilePreview, setMobilePreview] = useState(true);

  const [checkedPhone, setCheckedPhone] = useState<boolean>(false);
  const [checkedDesktop, setCheckedDesktop] = useState<boolean>(false);
  const [checkedTestEmail, setCheckedTestEmail] = useState<boolean>(false);

  const [language, setLanguage] = useState('');
  const [languageIndex, setLanguageIndex] = useState(0);

  const [testMail, setTestMail] = useState<boolean>(false);
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const [onMobile, setOnMobile] = useState<boolean>(false);

  const [previewStage, setPreviewStage] = useState<boolean>(true);

  const testEmailsRef = useRef(testEmails);

  useEffect(() => {
    const handleResize = () => {
      setOnMobile(window.innerWidth < 760);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useLayoutEffect(() => {
    if (currentBulletin && currentBulletin.content) {
      const content: BulletinContent = currentBulletin.content;
      const contentChanges: BulletinContent = { ...content, contentInLanguage: applyImages(content) };

      const updatedBulletin: Bulletin = { ...currentBulletin, content: contentChanges };
      dbAccess.persistBulletin(updatedBulletin, currentBulletinId);
    }
  }, []);

  useEffect(() => {
    if (!currentBulletin) return;

    const { templateApplicationId, templateApplicationStyleId } = currentBulletin;
    if (!(templateApplicationId && templateApplicationStyleId)) return;
    dbAccess
      .getStyledTemplateId(sessionStorage.organizationId, templateApplicationId, templateApplicationStyleId)
      .then((styledTemplateId) => api.getTemplateContent(styledTemplateId))
      .then((res) => {
        setLanguage(currentBulletin?.content?.contentInLanguage[languageIndex].language as string);
        if (currentBulletin?.content?.contentInLanguage[languageIndex].variables) {
          const mjml = generateHTMLfromTemplate(
            res.data.content.mjml,
            currentBulletin?.content?.contentInLanguage[languageIndex].variables,
          );
          setHtml(mjml);
        }
        setIsLoading(false);
      });
  }, [languageIndex]);

  useEffect(() => {
    testEmailsRef.current = testEmails;
  }, [testEmails]);

  const applyImages = (currentContent: BulletinContent) => {
    const orgJson =
      sessionStorage.getItem('organization') && JSON.parse(sessionStorage.getItem('organization') as string);

    const emblemWithTextExist =
      orgJson.kommunevaapenWithName && orgJson.kommunevaapenWithName !== '' && orgJson.kommunevaapenWithName !== '0';
    const emblemWithoutTextExist =
      orgJson.kommuneVaapen && orgJson.kommuneVaapen !== '' && orgJson.kommuneVaapen !== '0';

    const contentInLangChanges: ContentInLanguage[] = currentContent.contentInLanguage;
    return contentInLangChanges.map((inLang) => {
      return {
        ...inLang,
        variables: {
          ...inLang.variables,
          org_emblem: emblemWithTextExist
            ? orgJson.kommunevaapenWithName
            : emblemWithoutTextExist
            ? orgJson.kommuneVaapen
            : 'NO_IMAGE',
          emblem_alt_text:
            orgJson.kommunevaapenWithName || orgJson.kommuneVaapen ? 'Emblem for ' + orgJson.navn : 'NO_IMAGE',
          bilde: inLang.variables.bilde ? inLang.variables.bilde : 'NO_IMAGE',
          bilde_alt: inLang.variables.bilde_alt ? inLang.variables.bilde_alt : 'NO_IMAGE',
        },
      };
    });
  };

  const sendTest = () => {
    if (currentBulletin?.content?.contentInLanguage) {
      const content: BulletinContent = currentBulletin.content;
      const contentChanges: BulletinContent = { ...content, contentInLanguage: applyImages(content) };

      const testBulletin: Bulletin = { ...currentBulletin, content: contentChanges };
      dbAccess.persistBulletin(testBulletin, currentBulletinId).then((id) => {
        setTestMail(true);
        api.sendTestEmailsToUsers(testEmailsRef.current, id);
        setTimeout(() => {
          setTestMail(false);
        }, 5000);
      });
    }
  };

  const setBulletinTemplate = (currentBulletin: Bulletin) => {
    const bulletin: Bulletin = {
      ...currentBulletin,
    };
    store.setBulletin(bulletin);
    if (currentBulletinId) {
      dbAccess.persistBulletin(bulletin, currentBulletinId).then(() => onClickNext());
    }
  };

  const postBulletin = () => {
    if (currentBulletin) {
      setBulletinTemplate(currentBulletin);
    }
  };

  const post = () =>
    dbAccess
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin())
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  const testPopUp = (
    <StandardPopUp
      className="noStandardIcon"
      onPopUpAccept={sendTest}
      acceptButtonText="Send test"
      cancelButton="Avbryt"
    >
      <TestMailPopup emails={testEmails} setEmails={setTestEmails} />
    </StandardPopUp>
  );

  return (
    <div className="previewPage">
      <h1 className="previewPage__title">Forhåndsvisning</h1>
      <div className="blueBox">
        <div className="chooseBox">
          <ChooseBoxOption
            text={'Forhåndsvisning'}
            active={previewStage}
            seen={true}
            checked={!previewStage}
          ></ChooseBoxOption>
          <ChooseBoxOption
            text={'Test e-post'}
            active={!previewStage}
            seen={!previewStage}
            checked={false}
          ></ChooseBoxOption>
        </div>
        {previewStage ? (
          <div>
            {!onMobile && (
              <div className="previewPage__deviceIcons">
                <button
                  onClick={() => setMobilePreview(true)}
                  className={
                    mobilePreview
                      ? 'previewPage__deviceButton previewPage__deviceButton--active'
                      : 'previewPage__deviceButton'
                  }
                  type="button"
                >
                  <SmartphoneIcon className="previewPage__deviceItem" />
                </button>
                <button
                  onClick={() => setMobilePreview(false)}
                  className={
                    !mobilePreview
                      ? 'previewPage__deviceButton previewPage__deviceButton--active'
                      : 'previewPage__deviceButton'
                  }
                  type="button"
                >
                  <LaptopIcon className="previewPage__deviceItem" />
                </button>
              </div>
            )}
            {currentBulletin?.content?.contentInLanguage?.length &&
              currentBulletin?.content?.contentInLanguage?.length > 1 && (
                <LanguagePicker
                  language={language}
                  contentInLanguage={currentBulletin?.content?.contentInLanguage}
                  setLanguage={setLanguage}
                  setLanguageIndex={setLanguageIndex}
                />
              )}
            {!isLoading ? (
              <>
                <PreviewMobile className={!mobilePreview || onMobile ? 'devicePreview--hidden' : ''} html={html} />
                <PreviewDesktop className={mobilePreview && !onMobile ? 'devicePreview--hidden' : ''} html={html} />
              </>
            ) : (
              <Loader />
            )}

            <div className="previewPage__checkboxContainer">
              <div className="previewPage__checkboxWithText">
                <Checkbox onChange={() => setCheckedPhone(!checkedPhone)} checked={checkedPhone} />
                <p className="regular14">Jeg er fornøyd med hvordan e-posten ser ut på mobil</p>
              </div>
              {!onMobile && (
                <div className="previewPage__checkboxWithText">
                  <Checkbox onChange={() => setCheckedDesktop(!checkedDesktop)} checked={checkedDesktop} />
                  <p className="regular14">Jeg er fornøyd med hvordan e-posten ser ut på desktop</p>
                </div>
              )}
            </div>

            <div className="previewPage__buttonRow">
              <div className="navigateButton">
                <Button className="tertiary previewButtonTertiary" onClick={() => onClickNext('utseende')}>
                  <CreateIcon className="editIcon" fontSize="small" />
                  <Text className="textButton">Endre utseende</Text>
                </Button>
              </div>

              <div className="navigateButton">
                <Button className="tertiary previewButtonTertiary" onClick={() => onClickNext('innhold')}>
                  <CreateIcon className="editIcon" fontSize="small" />
                  <Text className="textButton">Endre innhold</Text>
                </Button>
              </div>

              <div className="navigateButton">
                <Button
                  className="secondary previewButtonSecondary"
                  type="submit"
                  onClick={() => {
                    setPreviewStage(false);
                  }}
                  disabled={onMobile ? !checkedPhone : !checkedDesktop || !checkedPhone}
                >
                  <Text className="textButton">Videre til test e-post</Text>
                  <NavigateNextOutlinedIcon fontSize="small" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="previewPage__testEmailStage">
              <div className="previewPage__testButton">
                <div>
                  <Button
                    type="button"
                    className="primary"
                    onClick={() => {
                      setPopUp(testPopUp);
                    }}
                  >
                    <div className="previewPage__mailButton">
                      <MailIcon className="previewPage__mailIcon" />
                      <Text className="textButton">Send test-epost</Text>
                    </div>
                  </Button>
                </div>

                {testMail && (
                  <Text key={'test-feedback'} className="textSucess">
                    Testutsending har nå blitt sendt!
                  </Text>
                )}
              </div>

              <div className="previewPage__checkboxContainer">
                <div className="previewPage__checkboxWithText">
                  <Checkbox onChange={() => setCheckedTestEmail(!checkedTestEmail)} checked={checkedTestEmail} />
                  <p className="regular14">
                    Jeg er fornøyd med hvordan e-posten blir seende ut på min egen mobil og pc
                  </p>
                </div>
              </div>
            </div>

            <div className="previewPage__buttonRowTestEmail">
              <Button
                className="tertiary previewButtonTertiary"
                type="submit"
                onClick={() => {
                  setPreviewStage(true);
                }}
              >
                <NavigateBeforeOutlinedIcon fontSize="small" />
                <Text className="textButton">Tilbake til Forhåndsvisning</Text>
              </Button>

              <div className="previewPage__editButtons">
                <div className="previewPage__navigateButton">
                  <Button className="tertiary previewButtonTertiary" onClick={() => onClickNext('utseende')}>
                    <CreateIcon className="editIcon" fontSize="small" />
                    <Text className="textButton">Endre utseende</Text>
                  </Button>
                </div>

                <div className="previewPage__navigateButton">
                  <Button className="tertiary previewButtonTertiary" onClick={() => onClickNext('innhold')}>
                    <CreateIcon className="editIcon" fontSize="small" />
                    <Text className="textButton">Endre innhold</Text>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!previewStage && (
        <div>
          <div className="previewPage__nextButton">
            <Button className="primary" type="submit" onClick={post} disabled={!checkedTestEmail}>
              <Text className="textButton">Videre</Text>
              <NavigateNextOutlinedIcon fontSize="small" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewMail;
