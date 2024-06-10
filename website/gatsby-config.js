// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');
const envPath = '.env.local';

if (fs.existsSync(envPath)) {
  dotenv.config({
    path: envPath,
  });
} else {
  console.log(`File not found, skipping load of [${envPath}]\nAssuming variables is accessible in enviroment.`);
}

const {
  api: { projectId, dataset },
} = requireConfig('../sanity/sanity.json');

const isProd = process.env.GATSBY_DEPLOY_ENVIROMENT === 'production';

module.exports = {
  siteMetadata: {
    title: 'Innbyggerkontakt',
    description: 'Gi relevant informasjon til innbyggere i din kommune når de trenger det.',
    url: 'https://www.innbyggerkontakt.no',
    image: '/images/logo.svg',
  },
  plugins: [
    'gatsby-plugin-sass',
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Innbyggerkontakt`,
        short_name: `Innbyggerkontakt`,
        start_url: `/`,
        display: `standalone`,
        icon: `src/images/logo.svg`,
      },
    },
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        stages: ['develop'],
        extensions: ['js', 'jsx', 'tsx'],
        exclude: ['node_modules', '.cache', 'public'],
        // Any eslint-webpack-plugin options below
        failOnError: false,
      },
    },
    {
      resolve: 'gatsby-source-sanity',
      options: {
        projectId,
        dataset,
        token: process.env.SANITY_TOKEN,
        // watchMode: !isProd,
        // overlayDrafts: !isProd,
        graphqlTag: 'default',
      },
    },
    {
      resolve: 'gatsby-plugin-matomo', //TODO: Fix hardcoded vars
      options: {
        siteId: '17',
        matomoUrl: 'https://matomo.kf.no/',
        siteUrl: 'https://innbyggerkontakt.no/',
        requireConsent: true,
        requireCookieConsent: false,
        disableCookies: false,
        dev: false,
        enableJSErrorTracking: true,
      },
    },
  ],
};

function requireConfig(path) {
  try {
    return require(path);
  } catch (e) {
    console.error('Failed to require sanity.json. Fill in projectId and dataset name manually in gatsby-config.js');
    return {
      api: {
        projectId: process.env.SANITY_PROJECT_ID || '',
        dataset: process.env.SANITY_DATASET || '',
      },
    };
  }
}
