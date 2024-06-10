# Innbyggerkontakt webapp

## Table of contents

| Chapter                                                       | Description                                                       |
| ------------------------------------------------------------- | ----------------------------------------------------------------- |
| [Setup](#setup)                                               | How to set up the project                                         |
| [Deployment](#deployment)                                     | How to deploy the frontend                                        |
| [Structure](#structure)                                       | How to structure your code, aka what is in which folder           |
| [What doesn't work and needs refactoring](#what-doesn't-work) | Rundown of which parts of the system needs reworking or rewriting |
| [Testing](#testing)                                           | How to test the frontend                                          |

## Setup

### Required tools:

- Git commandline tools - [Downloads available here](https://git-scm.com/downloads)
- NodeJS v12 - [Find the relevant version here](https://nodejs.org/en/download/releases/)
- yarn - `npm install -g yarn`
- firebase-tools - `npm install -g firebase-tools`
- Google cloud SDK @ latest - [Instructions available here](https://cloud.google.com/sdk/docs/install)

### Recommended Additional tools:

#### Windows

- NVM - [Node version manager for windows](https://github.com/coreybutler/nvm-windows).
  Allows you to install and manage node installations on the fly.

### Development

Make sure you're in the webapp folder when running yarn commands.
_PS_ We're using react-scripts, so check out the [Create React App page](https://create-react-app.dev/docs/getting-started/) for further information.

### Decrypting and encrypting the environment variables

Before you can run the development server or create a build, you need to get the environment variables for the application.
These variables are found in the `.env.production.enc` and the `.env.development.enc`.

You need to log in to the gcloud tool. Running `gcloud auth login`, setting the correct project or creating a config for the project is out of scope of this readme,
but have a look at `gcloud config configurations` command for that.

#### Decrypting

The following commands can be used to decrypt the files.

- production - `gcloud kms decrypt --plaintext-file=.env.production --ciphertext-file=.env.production.enc --key=react-env-vars --keyring=cloud-build --location=global`
- development - `gcloud kms decrypt --plaintext-file=.env.development --ciphertext-file=.env.development.enc --key=react-env-vars --keyring=cloud-build --location=global`

#### Encrypting

The following commands can be used to encrypt the files.

- production - `gcloud kms encrypt --plaintext-file=.env.production --ciphertext-file=.env.production.enc --key=react-env-vars --keyring=cloud-build --location=global`
- development - `gcloud kms encrypt --plaintext-file=.env.development --ciphertext-file=.env.development.enc --key=react-env-vars --keyring=cloud-build --location=global`

### Scripts and related commands

#### Install package dependencies

- `yarn install` - Installs all relevant packages needed for building the webapp.

#### Start development server

- `yarn start` or, if windows: `yarn winStart` - Runs the app in development mode.<br />
  Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### Build the project

- `yarn build` -
  Builds the app for production to the `build` folder.
  It correctly bundles React in production mode and optimizes the build for the best performance.
  </br>
- `yarn build:dev` - Builds the app with development settings for deployment to the dev-site.
  </br>
- `yarn build:ci` - Build the app without hooking into `prebuild` and `build` to skip linting.
  Used by the CI-tool.
  </br>
- `yarn compile:ci` - Runs compilation of the app using the typescript compiler.
  Used by the CI-tool.

#### Linting - webapp only, not styles

Checks that all files follow the rules set in `.eslintrc.js` and `.prettierrc.js` regarding formatting.
Running this is recommended before every push to branch.

It is also possible to run this whenever files are saved, as long as the IDE knows it should run this project's ESLint.

- `yarn lint` - Runs eslint with the provided configuration and attempts to rectify fixable linting errors.
  </br>
- `yarn lint:ci` - Runs eslint with the provided configuration and outputs the results to file.
  Used by the CI-tool.

#### Testing - firebase

- `yarn test:firestore` - Runs the firebase emulators to execute firestore rule tests using mocha
  </br>
- `yarn test:fireestore:no:emulators` - Runs the defined firestore rule tests using mocha, without firing up emulators.
  This is used for writing tests that require you to examine the data in firestore before/after the test run.
  </br>
- `yarn test:firestore:dev` - Runs the firebase emulators to execute watched firestore rules with mocha.
  Useful for developing tests on the fly.
  </br>
- `firebase emulators:start` - Starts up the firebase emulators, useful for watching data change in tests.
  Can be used with the `--only`-flag to specify a single emulator to start e.g `firebase emulators:start --only firestore`

#### Run locally with firebase

- `firebase serve` - Serves up the build folder after running either `yarn build` or `yarn build:dev`.
  [This command is no longer recommended by firebase](https://firebase.google.com/docs/hosting/test-preview-deploy#firebase-serve), instead use `firebase emulators:start`
  </br>
- `firebase emulators:start` - Is currently the recommended way of serving the result of `yarn build` or `yarn build:dev`.
  Use this to verify that the build works as it should.

## Deployment

This will deploy the webapp, functions and firestore setup to the Firebase hosting environment.

### Pre-deployment

- Login to firebase: `firebase login`

### Deploying to dev

The following command will set the correct firebase project, build and deploy the webapp

- Switch firebase project: `firebase use dev`
- Build webapp: `yarn build:dev`
- Deploy webapp: `firebase deploy`

### Deploying to prod

The following command will set the correct firebase project, build and deploy the webapp

- Switch firebase project: `firebase use prod`
- Build webapp: `yarn build`
- Deploy webapp: `firebase deploy`

## Structure

see Wiki

### Folder composition

| Folder name | What lies there                                                                                                                                                                           |
| ----------- |-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| components  | legacy components, updated components were mostly moved to our _storybook_ repo                                                                                                           |
| containers  | no structure, whatever didn't fit in components went to the container folder.                                                                                                             |
| contexts    | all of the context files                                                                                                                                                                  |
| hooks       | custom hooks                                                                                                                                                                              |
| libraries   | for bigger npm packages or libraries. Only CKEditor lies there for now                                                                                                                    |
| models      | some typescript models moved from _containers_                                                                                                                                            |
| molecules   | ATOM part of folders                                                                                                                                                                      |
| organisms   | components that contain multiple molecules and atoms                                                                                                                                      |
| templates   | templates for pages that need same setup and "look". For example all components that appear in "create new" should have title, padding and width in the same place and have the same size |
| pages       | the usual, a page is the component with all functionality that appears for the user                                                                                                       |
| utils       | utils                                                                                                                                                                                     |

## What doesn't work

### Styles

In settings there is "make new style/lag ny stil". This does not work for our customer.

### 2FA

Our customers often do not get messages with the code to log in with 2FA, leaving them stuck and unable to log in.

### Make draft functionality

If you have a bulletin that is active and press the button to "make a draft" it does something... It should take you to the same bulletin but now on the draft page, but instead, it just reloads.

### Content page in create new

When you come to the "innhold" step in the "create new" bulletin you can see that the page is not very user-friendly.

### What to remember

The thing that usually gets left out is functionality given by the side menu. If you go to a bulletin through there you can get summary of the bulletin, regardless if it's a draft or not.

The 2FA is often forgotten, and it seems that it isn't working properly, so it needs to be checked out.

## Testing

This project uses cypress for testing. There is only one test so far. If "create new" needs testing, it is recommended to use component testing, since end-to-end tests tend to crash. This seems like memory issue, so if you want to make end-to-end tests in this project use firefox or something that is not Chrome.
