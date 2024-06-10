# Sanity
Used to edit pages in https://innbyggerkontakt.no/dokumentasjon.

### Links
- [Managing Sanity](https://www.sanity.io/manage)
- [Studio](https://innbyggerkontakt.sanity.studio/desk)


### Install CLI tooling
```
yarn global add @sanity/cli
```

### Running the studio locally:
To start the development server for Sanity Studio, run this command within the studio folder:

```
sanity start
```

### Deploying the studio:
```
sanity deploy
```

### Hooks
Sanity is connected to the landing-page (innbyggerkontakt.no) via sanity hooks. When a document is edited in the sanity studio, the webhook triggers a cloud build trigger in GCP and rebuilds the landing-page.


Read more in the official Sanity documentation: https://www.sanity.io/docs/overview-introduction?utm_source=readme.


## Schema structure
### documentationPost
Title: The title of the post.
Slug: Slug of the post. Can automaticly generated.
IsProdReady: Used to separate dev and prod documents.
Body: The content of the post.

### landingPage and loggedInPage
Collections of documentation-posts.
Landingpage contains the posts for the landing-page.
LoggedInPage containt the posts supposed to show in the documentation page in the webapp. Not implemented.
