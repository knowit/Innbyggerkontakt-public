import store from 'contexts/store';
import SummaryItem from 'molecules/CreateNew/SummaryItem/SummaryItem';
import { useEffect, useState } from 'react';

import './ContentSummary.scss';

interface Props {
  changeContent?: () => void;
  setContentAsFinished: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContentSummary: React.FC<Props> = ({ changeContent, setContentAsFinished }) => {
  const currentBulletin = store.currentBulletin;
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    setFinished(
      currentBulletin?.content?.contentInLanguage[0].subject !== undefined &&
        currentBulletin?.content?.contentInLanguage[0].previewText !== undefined,
    );
    setContentAsFinished(
      currentBulletin?.content?.contentInLanguage[0].subject !== undefined &&
        currentBulletin?.content?.contentInLanguage[0].previewText !== undefined,
    );

    return () => {
      setFinished(false);
    };
  }, []);

  return (
    <SummaryItem overskrift="Utseende og innhold" buttonProps={{ onClick: changeContent }} finished={finished}>
      <div className="summaryItemContent content-summary">
        {finished ? (
          currentBulletin?.content?.contentInLanguage[0].variables.bilde !== 'NO_IMAGE' &&
          currentBulletin?.content?.contentInLanguage[0].variables.bilde !== undefined ? (
            <img
              alt={currentBulletin.content?.contentInLanguage[0].variables.bilde_alt}
              src={currentBulletin.content?.contentInLanguage[0].variables.bilde}
              className="content-summary__image"
            />
          ) : (
            <svg className="imagePlaceholder">
              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fillText">
                E-posten er uten bilde
              </text>
            </svg>
          )
        ) : (
          ''
        )}

        <div className="content-summary__textContent">
          {finished ? (
            <>
              <div>
                <p className="content-summary__heading"> Emnefelt</p>
                <p>{currentBulletin?.content?.contentInLanguage[0].subject}</p>
              </div>
              <div>
                <p className="content-summary__heading"> Forhåndsvisningstekst</p>
                <p>{currentBulletin?.content?.contentInLanguage[0].previewText}</p>
              </div>
            </>
          ) : (
            <div className="noContent">
              <p className="content-summary__heading--light-blue">Utseende og innhold mangler </p>
            </div>
          )}
        </div>
      </div>
    </SummaryItem>
  );
};

export default ContentSummary;
