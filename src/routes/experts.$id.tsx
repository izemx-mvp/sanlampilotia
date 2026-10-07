import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/app/PartnerPage";

export const Route = createFileRoute("/experts/$id")({
  head: ({ params }) => ({ meta: [{ title: `Expert ${params.id} — PilotIA` }, { name: "description", content: "Fiche expert : coordonnées, dossiers affectés et délais." }, { property: "og:title", content: `Expert ${params.id} — PilotIA` }, { property: "og:description", content: "Fiche expert." }] }),
  component: ExpertRoute,
});

function ExpertRoute() {
  const { id } = Route.useParams();
  return <PartnerPage kind="expert" id={id} />;
}
