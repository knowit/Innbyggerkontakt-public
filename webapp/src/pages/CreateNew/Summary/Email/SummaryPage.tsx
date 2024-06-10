import { useContext, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router';

import { CreateMessageError } from 'containers/CreateMessagePage/components';
import { determinIfBulletinDateIsInvalid } from 'containers/CreateMessagePage/util';
import { PopUpContext, StoreContext } from 'contexts';

import { ButtonLineContainer, StandardPopUp } from 'components';

import CreateNewTemplate from 'templates/CreateNewBulletin/CreateNewTemplate';

import { Bulletin, BulletinContent, ContentInLanguage } from 'models';

import * as api from 'utils/api';
import { setBulletinForSummaryPage } from 'utils/util';

import { Button } from 'innbyggerkontakt-design-system';
import { ContentSummary, RecipientsSummary, ScheduleSummary } from 'organisms';
import TestMailPopup from '../../../../molecules/CreateNew/EmailPopup/TestMailPopup';
import './SummaryPage.scss';

interface Props {
  onClickNext: (sendToPath?: string | undefined) => void;
}

const SummaryPage: React.FC<Props> = ({ onClickNext }) => {
  const store = useContext(StoreContext);
  const { setPopUp } = useContext(PopUpContext);

  const dbAccess = store.dbAccess;
  const navigate = useNavigate();
  const currentBulletinId = store.currentBulletinId;

  const currentBulletin = store.currentBulletin;

  const [testMail, setTestMail] = useState<boolean>(false);
  const [testEmails, setTestEmails] = useState<string[]>([]);
  const testEmailsRef = useRef(testEmails);

  const [isRecipientsFinished, setIsRecipientsFinished] = useState(false);
  const [isContentFinished, setIsContentFinished] = useState(false);
  const [isScheduleFinished, setIsScheduleFinished] = useState(false);
  const [finished, setAsFinished] = useState(false);

  useEffect(() => {
    setAsFinished(isRecipientsFinished && isContentFinished && isScheduleFinished);
  }, [isRecipientsFinished, isContentFinished, isScheduleFinished]);

  useEffect(() => {
    testEmailsRef.current = testEmails;
  }, [testEmails]);

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
        navigate('/oversikt/hjem');
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
      .checkForPotentialOverwrite(currentBulletinId)
      .then(() => postBulletin(active))
      .catch((reason: string) =>
        setPopUp(<CreateMessageError popUpMessage={reason} onPopUpAccept={() => navigate('/oversikt')} />),
      );

  const sendTest = () => {
    if (currentBulletin?.content?.contentInLanguage) {
      const emblem =
        sessionStorage.getItem('organization') &&
        JSON.parse(sessionStorage.getItem('organization') as string).kommuneVaapen;
      const name =
        sessionStorage.getItem('organization') && JSON.parse(sessionStorage.getItem('organization') as string).navn;

      const content: BulletinContent = currentBulletin.content;
      const contentInLangChanges = currentBulletin.content?.contentInLanguage || [];

      contentInLangChanges.map((inLang) => {
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
    <CreateNewTemplate title={'Oppsummering'} subtitle={currentBulletin?.name}>
      <RecipientsSummary
        changeSummaryStep={() =>
          onClickNext(currentBulletin?.channel.type === 'event' ? 'mottakere-auto' : 'mottakere')
        }
        setSummaryStepIsFinished={setIsRecipientsFinished}
      />
      <ContentSummary changeContent={() => onClickNext('innhold')} setContentAsFinished={setIsContentFinished} />
      <ScheduleSummary
        changeSummaryStep={() => onClickNext('tidspunkt')}
        setSummaryStepIsFinished={setIsScheduleFinished}
      />

      <ButtonLineContainer className="summary-page__buttons">
        <Button
          type="button"
          color="tertiary"
          onClick={() => {
            setPopUp(testPopUp);
          }}
        >
          Send test-epost
        </Button>

        <div className="summary-page__buttons--gap">
          <Button color="secondary" type="button" onClick={() => post(false)}>
            Lagre kladd
          </Button>
          <Button
            disabled={!finished || determinIfBulletinDateIsInvalid(currentBulletin as Bulletin)}
            onClick={() => {
              if (
                determinIfBulletinDateIsInvalid(currentBulletin as Bulletin) &&
                currentBulletin?.execution?.type !== 'instant'
              ) {
                setIsScheduleFinished(false);
              } else {
                post(true);
              }
            }}
          >
            Start utsending
          </Button>
        </div>
        {testMail && <p>Testutsending har nå blitt sendt!</p>}
      </ButtonLineContainer>
    </CreateNewTemplate>
  );
};

export default SummaryPage;
