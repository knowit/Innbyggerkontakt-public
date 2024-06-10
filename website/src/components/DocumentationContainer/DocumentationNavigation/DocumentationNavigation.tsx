import React from 'react';
import './DocumentationNavigation.scss';
import { Article } from '../DocumentationTypes';

interface Props {
  setActiveArticleId: (activeArticle: string) => void;
  activeArticleId: string;
  articles?: Article[];
}

const DocumentationNavigation: React.FC<Props> = ({ setActiveArticleId, activeArticleId, articles }: Props) => {
  const handleClick = (a: string) => setActiveArticleId(a);

  return (
    <nav className="documentationNavigation">
      {articles?.map((a) => (
        <button
          className={a.id === activeArticleId ? 'activeButton' : undefined}
          key={a.id}
          onClick={() => handleClick(a.id)}
        >
          {a.title}
        </button>
      ))}
    </nav>
  );
};

export default DocumentationNavigation;
