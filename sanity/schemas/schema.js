import createSchema from "part:@sanity/base/schema-creator";

import schemaTypes from "all:part:@sanity/base/schema-type";

import blockContent from "./blockContent";
import documentationPost from "./documentationPost";
import loggedInPage from "./loggedInPage";
import landingPage from "./landingPage";

export default createSchema({
  name: "default",
  types: schemaTypes.concat([
    // The following are document types which will appear
    // in the studio.
    documentationPost,
    landingPage,
    loggedInPage,
    blockContent,
  ]),
});
