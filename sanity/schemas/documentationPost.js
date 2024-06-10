export default {
  name: "documentationPost",
  title: "Dokumentasjon",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Tittel",
      type: "string",
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
    },
    {
      name: "isProdReady",
      title: "Tilgjengelig i produksjon",
      type: "boolean",
      description:
        "Sett denne på om artikkelen er klar til produksjon, hvis ikke vil den vises i dev-versjon.",
    },
    {
      name: "body",
      title: "Innhold",
      type: "blockContent",
    },
  ],
  initialValue: {
    isProdReady: false,
  },
};
