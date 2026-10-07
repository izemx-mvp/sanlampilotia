import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Car, CreditCard, FileText, UserRoundCheck, Users, Wrench } from "lucide-react";
import { useMemo, useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Btn, Card, PageHeader, RecoPanel, Stat, Tabs } from "@/components/app/ui";
import { ActionsTable } from "@/components/app/ActionsTable";
import { useStore } from "@/lib/store";
import { buildActions, kpis } from "@/lib/actions";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/")({ head: pageHead("Dashboard", "Les dossiers qui nécessitent votre attention aujourd’hui : relances clients, paiements, sinistres, experts et garages."), component: Dashboard });

function Dashboard() {
  const s = useStore();
  const nav = useNavigate();
  const items = useMemo(() => buildActions(s), [s.clients, s.quotes, s.payments, s.missing, s.claims, s.experts, s.garages]); // eslint-disable-line react-hooks/exhaustive-deps
  const k = kpis(s, items);
  const [type, setType] = useState("all");
  const [all, setAll] = useState(false);
  const rows = items.filter((i) => type === "all" || i.kind === type);
  const recos = items.filter((i) => i.priority === "Haute").slice(0, 4).map((i) => ({ key: i.key, text: i.reco, urgent: true, onClick: () => (i.claimId ? nav({ to: "/sinistres/$id", params: { id: i.claimId } }) : nav({ to: "/clients/$id", params: { id: i.clientId } })) }));
  const KP = [
    { l: "Clients à relancer", v: k.clients, i: Users, t: "primary" as const, to: "/agent-client" as const, tab: "tous" },
    { l: "Devis en attente", v: k.quotes, i: FileText, t: "warning" as const, to: "/agent-client" as const, tab: "devis" },
    { l: "Paiements non réglés", v: k.unpaid, i: CreditCard, t: "destructive" as const, to: "/agent-client" as const, tab: "paiements" },
    { l: "Sinistres à relancer", v: k.claims, i: Car, t: "navy" as const, to: "/agent-sinistre" as const },
    { l: "Experts à relancer", v: k.experts, i: UserRoundCheck, t: "cyan" as const, to: "/agent-sinistre" as const },
    { l: "Garages à relancer", v: k.garages, i: Wrench, t: "success" as const, to: "/agent-sinistre" as const },
  ];
  return (
    <Shell>
      <PageHeader eyebrow="Dashboard" title="Bonjour, voici les dossiers qui nécessitent votre attention." subtitle={`${items.length} actions identifiées par vos Agents IA · ${items.filter((i) => i.priority === "Haute").length} prioritaires`} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {KP.map((x, i) => (
          <Link key={x.l} to={x.to} search={"tab" in x ? { tab: x.tab } : undefined}><Stat label={x.l} value={x.v} icon={x.i} tone={x.t} delay={i * 0.04} /></Link>
        ))}
      </div>
      <div className="mt-5"><RecoPanel title="À faire en priorité" recos={recos} /></div>
      <Card delay={0.15} className="mt-5 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <div><h2 className="flex items-center gap-2 text-xl font-semibold"><AlertTriangle className="h-5 w-5 text-warning" />Actions prioritaires</h2><p className="text-sm text-muted-foreground">Cliquez sur une ligne pour ouvrir le dossier. Le numéro à appeler est affiché sous chaque nom.</p></div>
          <Tabs id="dash-tabs" value={type} onChange={setType} tabs={[{ id: "all", label: "Tout", count: items.length }, { id: "Devis", label: "Devis" }, { id: "Paiement", label: "Paiements" }, { id: "Info manquante", label: "Infos" }, { id: "Sinistre", label: "Sinistres" }]} />
        </div>
        <ActionsTable items={all ? rows : rows.slice(0, 10)} />
        {rows.length > 10 && <div className="border-t border-border p-3 text-center"><Btn variant="ghost" onClick={() => setAll(!all)}>{all ? "Réduire" : `Voir les ${rows.length} actions`}</Btn></div>}
      </Card>
    </Shell>
  );
}
