export type ArticleData = {
  articleID: string;
  articleName: string;
  articleSections: ArticleSection[];
};

type ArticleSection = {
  subheading: string;
  paragraph: string;
};

export type DocumentationPostQuery = {
  allSanityDocumentationPost: AllSanityDocumentationPost;
};

export type ArticlesSortedQuery = {
  allSanityLandingPage: AllSanityLandingPage;
};

export type AllSanityLandingPage = {
  edges: Edge[];
};

export type AllSanityDocumentationPost = {
  edges: Edge[];
};

export type Edge = {
  node: Node;
};

type Node = {
  articles: Article[];
};

export type Article = {
  id: string;
  title: string;
  slug: Slug;
  rawBody: [];
  isProdReady: boolean;
};

type Slug = {
  current: string;
};
