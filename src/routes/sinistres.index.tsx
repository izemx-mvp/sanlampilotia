import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/app/Shell";
import { PageHeader } from "@/components/app/ui";
import { ClaimsViews } from "@/components/app/Claims";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/sinistres/")({ head: pageHead("Sinistres", "Pipeline et tableau de tous les sinistres en cours."), component: () => (
  <Shell>
    <PageHeader title="Sinistres" subtitle="Glissez les cartes entre les étapes pour mettre à jour un dossier." />
    <ClaimsViews />
  </Shell>
) });
