import client from "part:@sanity/base/client";

export default {
  type: "document",
  name: "loggedInPage",
  title: "Innloggetside",
  fields: [
    {
      type: "array",
      name: "articles",
      title: "Dokumentasjon bak innlogging",
      description:
        "Her er artiklene som vil dukke opp under dokumentasjon bak innlogging. Tittel på hver artikkel vil bli navnet på menypunktet i sidemenyen. Du kan dra i artiklene for å bytte rekkefølge.",
      of: [
        {
          type: "reference",
          to: [{ type: "documentationPost" }],
          options: {
            weak: true,
          },
        },
      ],
      validation: (Rule) =>
        Rule.unique().error("Du kan bare ha en av samme artikkel"),
    },
  ],
  preview: {
    select: {},
    prepare() {
      return {
        title: "Hjelp for innloggede",
      };
    },
  },
};
