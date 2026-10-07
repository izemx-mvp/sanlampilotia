import { createFileRoute } from "@tanstack/react-router";
import { PartnerPage } from "@/components/app/PartnerPage";

export const Route = createFileRoute("/garages/$id")({
  head: ({ params }) => ({ meta: [{ title: `Garage ${params.id} — PilotIA` }, { name: "description", content: "Fiche garage : coordonnées, sinistres affectés et délais de réparation." }, { property: "og:title", content: `Garage ${params.id} — PilotIA` }, { property: "og:description", content: "Fiche garage." }] }),
  component: GarageRoute,
});

function GarageRoute() {
  const { id } = Route.useParams();
  return <PartnerPage kind="garage" id={id} />;
}
