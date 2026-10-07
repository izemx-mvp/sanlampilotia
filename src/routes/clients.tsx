import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/app/Shell";
import { PageHeader, Tabs } from "@/components/app/ui";
import { ClientFollowTable } from "./agent-client";
import { pageHead } from "@/lib/head";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/clients")({ head: pageHead("Clients & Prospects", "Portefeuille clients et prospects avec leur état de suivi."), component: Clients });

function Clients() {
  const { clients } = useStore();
  const [t, setT] = useState("Client");
  return (
    <Shell>
      <PageHeader title="Clients & Prospects" subtitle="Synchronisé depuis votre outil de gestion clients." />
      <div className="mb-4"><Tabs value={t} onChange={setT} tabs={[{ id: "Client", label: "Clients", count: clients.filter((c) => c.type === "Client").length }, { id: "Prospect", label: "Prospects", count: clients.filter((c) => c.type === "Prospect").length }]} /></div>
      <ClientFollowTable key={t} only={t as "Client" | "Prospect"} />
    </Shell>
  );
}
