
### Website
This module contains the code for https://innbyggerkontakt.no/. This is the landing page for the project.

### Required tools:
- yarn - `npm install -g yarn`
- firebase-tools - `npm install -g firebase-tools`


### Scripts and related commands
#### Install package dependencies
- `yarn install` - Installs all relevant packages needed for building the webapp.

#### Start development server
- `yarn start` - Runs the app in development mode.<br />
Open [http://localhost:8000](http://localhost:8000) to view it in the browser.

#### Build the project
- `yarn build` -
  Builds the app for production to the `build` folder.
  It correctly bundles React in production mode and optimizes the build for the best performance.
  </br>


### Sanity
The "Dokumentasjon"-section is connected to Sanity-CMS. It's connected with a Sanity webhook connected to cloud build. The website builds on changes in Sanity-documents.

## Gatsby links

- [Documentation](https://www.gatsbyjs.com/docs/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)

- [Tutorials](https://www.gatsbyjs.com/tutorial/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)

- [Guides](https://www.gatsbyjs.com/tutorial/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)

- [API Reference](https://www.gatsbyjs.com/docs/api-reference/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)

- [Plugin Library](https://www.gatsbyjs.com/plugins?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)

- [Cheat Sheet](https://www.gatsbyjs.com/docs/cheat-sheet/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter)



## Local deployment
Website is deployed to dev on push to master.
This will deploy the website to the Firebase hosting environment.
### Pre-deployment

- Login to firebase: `firebase login`
- `yarn install` - Installs all relevant packages needed for building the webapp.


### Deploying to dev
The following command will set the correct firebase project, build and deploy the webapp
- Switch firebase project: `firebase use dev`
- Build webapp: `yarn build`
- Deploy webapp: `firebase deploy`

### Deploying to prod
The following command will set the correct firebase project, build and deploy the webapp

- Switch firebase project: `firebase use prod`
- Build webapp: `yarn build`
- Deploy webapp: `firebase deploy`
