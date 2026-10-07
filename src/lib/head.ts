export const pageHead = (title: string, description: string) => () => ({
  meta: [
    { title: `${title} — PilotIA Assurance` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — PilotIA Assurance` },
    { property: "og:description", content: description },
  ],
});
