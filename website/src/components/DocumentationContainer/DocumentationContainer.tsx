import { graphql, useStaticQuery } from 'gatsby';
import React, { useState } from 'react';
import DocumentationArticle from './DocumentationArticle/DocumentationArticle';
import './DocumentationContainer.scss';
import DocumentationNavigation from './DocumentationNavigation/DocumentationNavigation';
import { ArticlesSortedQuery } from './DocumentationTypes';

const enviroment = process.env.GATSBY_DEPLOY_ENVIROMENT;

const DocumentationContainer: React.FC = () => {
  const data: ArticlesSortedQuery = useStaticQuery(
    graphql`
      query {
        allSanityLandingPage {
          edges {
            node {
              articles {
                id
                title
                slug {
                  current
                }
                isProdReady
                rawBody: _rawBody
              }
            }
          }
        }
      }
    `,
  );

  const articlesBasedOnEnv = () => {
    if (data.allSanityLandingPage.edges[0]) {
      switch (enviroment) {
        case 'production':
          return data.allSanityLandingPage.edges[0].node.articles.filter((article) => article.isProdReady === true);
        case 'development':
          return data.allSanityLandingPage.edges[0].node.articles;
        default:
          break;
      }
    }
    return null;
  };

  const articles = articlesBasedOnEnv();
  const [activeArticleId, setActiveArticleId] = useState<string>(articles[0].id);

  return (
    <div className="documentationContainer">
      <DocumentationNavigation
        setActiveArticleId={setActiveArticleId}
        activeArticleId={activeArticleId}
        articles={articles}
      />
      <DocumentationArticle activeArticleId={activeArticleId} articles={articles} />
    </div>
  );
};

export default DocumentationContainer;
