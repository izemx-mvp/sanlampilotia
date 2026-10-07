import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Card, PageHeader, Select, Tabs } from "@/components/app/ui";
import { ItemsTable } from "@/components/app/ItemsTable";
import { useStore } from "@/lib/store";
import { buildItems, byPriority, isDone } from "@/lib/items";
import { OPERATORS, TODAY, addDays } from "@/lib/mock";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/suivi")({ head: pageHead("Centre de suivi", "Toutes les actions remontées par les Agents IA Client et Sinistre."), component: Suivi });

function Suivi() {
  const { clients, claims } = useStore();
  const all = useMemo(() => buildItems(clients, claims).sort(byPriority), [clients, claims]);
  const [tab, setTab] = useState("tous");
  const [f, setF] = useState({ priority: "", agent: "", operator: "", status: "", type: "", due: "" });
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });
  const tabbed = all.filter((i) => tab === "tous" ? !isDone(i.status) : tab === "clients" ? i.kind === "Client" && !isDone(i.status) : tab === "sinistres" ? i.kind === "Sinistre" && !isDone(i.status) : tab === "urgents" ? i.priority === "critique" || i.priority === "haute" : tab === "retard" ? i.due < TODAY && !isDone(i.status) : isDone(i.status));
  const items = tabbed.filter((i) => (!f.priority || i.priority === f.priority) && (!f.agent || i.agent === f.agent) && (!f.operator || i.operator === f.operator) && (!f.status || i.status === f.status) && (!f.type || i.kind === f.type)
    && (!f.due || (f.due === "Aujourd’hui" ? i.due.toDateString() === TODAY.toDateString() : f.due === "En retard" ? i.due < TODAY : i.due <= addDays(TODAY, 7))));
  const count = (fn: (i: (typeof all)[0]) => boolean) => all.filter(fn).length;
  return (
    <Shell>
      <PageHeader title="Centre de suivi" subtitle="Toutes les actions détectées par vos deux Agents IA, au même endroit." />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs value={tab} onChange={setTab} tabs={[
          { id: "tous", label: "Tous", count: count((i) => !isDone(i.status)) }, { id: "clients", label: "Clients" }, { id: "sinistres", label: "Sinistres" },
          { id: "urgents", label: "Urgents", count: count((i) => i.priority === "critique" || i.priority === "haute") }, { id: "retard", label: "En retard", count: count((i) => i.due < TODAY && !isDone(i.status)) }, { id: "termines", label: "Terminés" },
        ]} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Select label="Priorité" value={f.priority} onChange={set("priority")} options={["critique", "haute", "moyenne", "basse"]} />
        <Select label="Agent IA" value={f.agent} onChange={set("agent")} options={["Agent Client", "Agent Sinistre"]} />
        <Select label="Opérateur" value={f.operator} onChange={set("operator")} options={OPERATORS} />
        <Select label="Statut" value={f.status} onChange={set("status")} options={[...new Set(all.map((i) => i.status))]} />
        <Select label="Type" value={f.type} onChange={set("type")} options={["Client", "Sinistre"]} />
        <Select label="Échéance" value={f.due} onChange={set("due")} options={["Aujourd’hui", "En retard", "7 prochains jours"]} />
      </div>
      <Card className="overflow-hidden"><ItemsTable key={tab + JSON.stringify(f)} items={items} /></Card>
    </Shell>
  );
}
