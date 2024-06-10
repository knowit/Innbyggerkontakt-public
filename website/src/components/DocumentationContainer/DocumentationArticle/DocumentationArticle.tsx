import React from 'react';
import './DocumentationArticle.scss';
import { Article } from '../DocumentationTypes';
import BlockContent from '@sanity/block-content-to-react';

interface Props {
  activeArticleId: string;
  articles?: Article[];
}

const DocumentationArticle: React.FC<Props> = ({ activeArticleId, articles }: Props) => {
  const activeArticle = articles?.filter((a) => a.id === activeArticleId)[0];

  return (
    <div className="documentationArticle">
      <h2 className="articleHeading">{activeArticle?.title}</h2>
      <BlockContent
        className="articleContent"
        blocks={activeArticle?.rawBody || []}
        projectId={'ss3wtm5r'}
        dataset={'documentation-prod'}
      />
    </div>
  );
};

export default DocumentationArticle;
