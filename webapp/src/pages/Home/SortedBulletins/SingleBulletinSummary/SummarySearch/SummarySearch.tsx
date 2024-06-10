import firebase from 'firebase/compat/app';
import { useContext, useEffect, useRef, useState } from 'react';

import { PopUpContext } from 'contexts';
import { useNavigate } from 'react-router';

import { Button, ButtonLineContainer, StandardPopUp } from 'components';
import { SummaryHeader } from 'components/SummaryHeader/SummaryHeader';
import { CreateMessageError } from 'containers/CreateMessagePage/components';
import { Bulletin, BulletinContent, ContentInLanguage } from 'models';
import { TestMailPopup } from 'molecules';
import { ContentSummary, RecipientsSummary, ScheduleSummary } from 'organisms';
import * as api from 'utils/api';
import { setBulletinForSummaryPage } from 'utils/util';

import store from 'contexts/store';
import './SummarySearch.scss';

interface Props {
  data: firebase.firestore.DocumentData | undefined;
  bulletinId: string;
  setBulletinToDraft: () => void;
}

/* comp for showing a summary of drafts and planned bulletins */
export const SummarySearch: React.FC<Props> = ({ data, setBulletinToDraft, bulletinId }) => {
  const { setPopUp } = useContext(PopUpContext);
  const bulletin = data?.bulletin;
  const status = bulletin?.status;
  const navigate = useNavigate();
  const dbAccess = store.dbAccess;

  const [testMail, setTestMail] = useState<boolean>(false);
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const testEmailsRef = useRef(testEmails);
  const [finished, setAsFinished] = useState(false);

  const [isRecipientsFinished, setIsRecipientsFinished] = useState(false);
  const [isContentFinished, setIsContentFinished] = useState(false);
  const [isScheduleFinished, setIsScheduleFinished] = useState(false);

  useEffect(() => {
    setAsFinished(isRecipientsFinished && isContentFinished && isScheduleFinished);
  }, [isRecipientsFinished, isContentFinished, isScheduleFinished]);

  /* generates user friendly text describing what the bulletin is missing */
  const generateRemainingSectionsString = () => {
    if (finished) {
      return '';
    }

    const s = [];

    if (!isRecipientsFinished) {
      s.push('mottakere');
    }
    if (!isContentFinished) {
      s.push('innhold');
    }
    if (!isScheduleFinished) {
      s.push('tidspunkt');
    }

    let ret = 'Mangler ';
    for (let i = 0; i < s.length; i++) {
      if (i == s.length - 1 && s.length > 1) {
        ret += 'og ';
        ret += s[i];
        continue;
      }
      ret += s[i];
      if (s.length != 1 && i !== s.length - 2) {
        ret += ', ';
      } else {
        ret += ' ';
      }
    }

    return ret;
  };

  /* following functions are copied from SummaryPage (TODO: refactor?) */
  const applyImages = (currentContent: BulletinContent) => {
    const orgJson =
      sessionStorage.getItem('organization') && JSON.parse(sessionStorage.getItem('organization') as string);

    const contentInLangChanges: ContentInLanguage[] = currentContent.contentInLanguage;
    return contentInLangChanges.map((inLang) => {
      return {
        ...inLang,
        variables: {
          ...inLang.variables,
          org_emblem: orgJson.kommunevaapenWithName
            ? orgJson.kommunevaapenWithName
            : orgJson.kommuneVaapen
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

  const postBulletin = (active: boolean) => {
    const currentBulletin = store.currentBulletin;
    const bulletinId = store.currentBulletinId;
    if (currentBulletin?.content?.contentInLanguage && bulletinId) {
      const currentContent = currentBulletin.content;
      const content: BulletinContent = {
        ...currentContent,
        from: {
          email:
            sessionStorage.getItem('organization') !== null &&
            JSON.parse(sessionStorage.getItem('organization') as string).defaultEmailAddress,
          name:
            sessionStorage.getItem('organization') !== null &&
            JSON.parse(sessionStorage.getItem('organization') as string).navn,
        },
        contentInLanguage: applyImages(currentContent),
      };

      const bulletin = setBulletinForSummaryPage(active, currentBulletin, content);

      const summaryCleanup = () => {
        store.setBulletinId(null);
        store.setBulletin(null);
        window.location.href = '/';
        navigate('/oversikt');
      };
      if (active && bulletin) {
        dbAccess.persistBulletin(bulletin, bulletinId, 'draft', 'active').then(() => summaryCleanup());
      } else {
        dbAccess.persistBulletin(bulletin || currentBulletin, bulletinId).then(() => summaryCleanup());
      }
    }
  };

  const post = (active: boolean) =>
    dbAccess
      .checkForPotentialOverwrite(bulletinId)
      .then(() => postBulletin(active))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  const sendTest = () => {
    if (bulletin?.content?.contentInLanguage) {
      const emblem =
        sessionStorage.getItem('organization') &&
        JSON.parse(sessionStorage.getItem('organization') as string).kommuneVaapen;
      const name =
        sessionStorage.getItem('organization') && JSON.parse(sessionStorage.getItem('organization') as string).navn;

      const content: BulletinContent = bulletin.content;
      const contentInLangChanges = bulletin.content?.contentInLanguage || [];

      contentInLangChanges.map((inLang: ContentInLanguage) => {
        return {
          ...inLang,
          variables: {
            ...inLang.variables,
            org_emblem: emblem !== '' ? emblem : 'NO_IMAGE',
            emblem_alt_text: emblem !== '' ? 'Emblem for ' + name : 'NO_IMAGE',
          },
        };
      });
      const contentChanges: BulletinContent = { ...content, contentInLanguage: applyImages(content) };

      const testBulletin: Bulletin = { ...bulletin, content: contentChanges };
      dbAccess.persistBulletin(testBulletin, bulletinId).then((id) => {
        setTestMail(true);
        api.sendTestEmailsToUsers(testEmailsRef.current, id);
        setTimeout(() => {
          setTestMail(false);
        }, 5000);
      });
    }
  };

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

  const editPopUp = (path: string) => {
    if (status === 'active') {
      setPopUp(
        <StandardPopUp
          popUpHeading="Du er i ferd å legge en planlagt sending inn i utkast"
          popUpMessage="Når du skal endre på denne e-posten vil den bli til en kladd og du vil derfor måtte sette
                tidspunktet for utsending på nytt"
          onPopUpAccept={() => {
            setBulletinToDraft();
            navigate(`/opprett/start`);
          }}
          acceptButtonText="Endre likevel"
          cancelButton="Avbryt"
        />,
      );
    } else {
      navigate(`/opprett/${path}`);
    }
  };

  const changeContent = () => {
    editPopUp('innhold');
  };

  const changeRecipients = () => {
    const currentBulletin = store.currentBulletin;

    editPopUp(currentBulletin?.channel.type === 'event' ? 'mottakere-auto' : 'mottakere');
  };

  const changeSchedule = () => {
    editPopUp('tidspunkt');
  };

  const isDraft = status === 'draft' ? true : false;

  return (
    <div className="summarySearch">
      {data !== undefined ? <SummaryHeader bulletin={bulletin} /> : ''}

      <RecipientsSummary changeSummaryStep={changeRecipients} setSummaryStepIsFinished={setIsRecipientsFinished} />
      <ContentSummary changeContent={changeContent} setContentAsFinished={setIsContentFinished} />
      <ScheduleSummary changeSummaryStep={changeSchedule} setSummaryStepIsFinished={setIsScheduleFinished} />

      <ButtonLineContainer>
        {!isDraft ? (
          <>
            <Button
              className="tertiary iconButton"
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpHeading={'Du er i ferd med å slette utkastet til en melding!'}
                    popUpMessage="Alt av tekst og bilder tilhørende meldingen vil bli slettet og det vil ikke bli mulig å gjenopprette."
                    onPopUpAccept={() => {
                      dbAccess.deleteBulletin(sessionStorage.organizationId, bulletinId);
                      navigate(-1);
                    }}
                    acceptButtonText={'Slett melding'}
                    cancelButton="Avbryt"
                    danger={true}
                  />,
                );
              }}
            >
              <span className="textButton">{'Slett utkast'}</span>
            </Button>
            <Button
              style={{ marginLeft: '2%' }}
              className="tertiary"
              onClick={() => {
                setPopUp(
                  <StandardPopUp
                    popUpMessage="Dette valget vil stoppe denne utsendingen og legge den i kladd listen og du vil derfor måtte
                        sette tidspunktet for utsending på nytt."
                    onPopUpAccept={() => {
                      setBulletinToDraft();
                      navigate('/oversikt/hjem');
                    }}
                    acceptButtonText="Stopp utsending"
                    cancelButton="Avbryt"
                  />,
                );
              }}
            >
              <span className="textButton">Stopp utsending</span>
            </Button>
          </>
        ) : null}

        <div key="send">
          <Button
            type="button"
            className="secondary"
            onClick={() => {
              setPopUp(testPopUp);
            }}
          >
            <span className="textButton" style={{ display: 'inline-block' }}>
              Send test-epost
            </span>
          </Button>

          {testMail && (
            <span key={'test-feedback'} className="textSucess" style={{ textAlign: 'center' }}>
              Testutsending har nå blitt sendt!
            </span>
          )}
        </div>

        {isDraft ? (
          <Button
            disabled={!finished}
            className="primary"
            onClick={() => {
              post(true);
            }}
          >
            <span className="textButton" style={{ display: 'inline-block' }}>
              Legg klar til utsending
            </span>
          </Button>
        ) : null}
        {!finished ? <p className="darkBrightBlue regular18">{generateRemainingSectionsString()}</p> : ''}
      </ButtonLineContainer>
    </div>
  );
};
