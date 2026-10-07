import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, Bot, Car, FileClock, Hourglass, Wrench, CreditCard, PhoneOff } from "lucide-react";
import { Shell } from "@/components/app/Shell";
import { Button, Card, Counter, PageHeader, Pulse } from "@/components/app/ui";
import { ItemsTable } from "@/components/app/ItemsTable";
import { ClaimsBoard } from "@/components/app/Claims";
import { useStore } from "@/lib/store";
import { buildItems, byPriority, isDone } from "@/lib/items";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/agent-sinistre")({ head: pageHead("Agent IA Suivi Sinistre", "Relances experts, garages et validations détectées automatiquement."), component: AgentSinistre });

const CASES = [
  { l: "Expert non contacté", re: /expert non/i, icon: PhoneOff }, { l: "Rapport non reçu", re: /rapport/i, icon: FileClock }, { l: "Garage non contacté", re: /garage non/i, icon: Wrench },
  { l: "Devis garage manquant", re: /devis/i, icon: AlertCircle }, { l: "Véhicule en attente", re: /véhicule|pièces/i, icon: Car }, { l: "Accord assurance", re: /accord/i, icon: Hourglass },
  { l: "Règlement en attente", re: /règlement/i, icon: CreditCard }, { l: "Sans mise à jour", re: /sans mise/i, icon: Bot },
];

function AgentSinistre() {
  const { clients, claims } = useStore();
  const items = buildItems([], claims).filter((i) => !isDone(i.status)).sort(byPriority);
  void clients;
  return (
    <Shell>
      <PageHeader title="Agent IA — Suivi Sinistre" subtitle="Remplace le suivi Excel : experts, garages, validations et règlements.">
        <span className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success"><Pulse />Agent actif · 86 sinistres analysés</span>
        <Button variant="primary" size="sm"><Bot className="h-4 w-4" />Relancer l’analyse</Button>
      </PageHeader>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {CASES.map((c, i) => (
          <Card key={c.l} delay={i * 0.03} className="p-3.5"><c.icon className="h-4 w-4 text-cyan" /><p className="mt-2 font-display text-xl font-semibold"><Counter to={claims.filter((x) => c.re.test(x.issue)).length} /></p><p className="text-[11px] leading-tight text-muted-foreground">{c.l}</p></Card>
        ))}
      </div>
      <Card className="mb-6 overflow-hidden"><div className="p-5 pb-2"><h2 className="font-semibold">Relances détectées</h2></div><ItemsTable items={items} pageSize={8} compact /></Card>
      <h2 className="mb-3 font-semibold">Pipeline des sinistres</h2>
      <ClaimsBoard />
    </Shell>
  );
}
