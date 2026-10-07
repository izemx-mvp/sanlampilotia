import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone, Building2, Wrench } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Avatar, Button, Card, PageHeader, Progress, Tabs } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { experts, garages, fmt } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/intervenants")({ head: pageHead("Intervenants", "Annuaire et performance des experts, garages et partenaires."), component: Intervenants });

const PARTNERS = [{ name: "SANLAM Maroc — Gestion sinistres", kind: "Compagnie", phone: "05 22 43 96 00" }, { name: "Dépannage Atlas Assistance", kind: "Assistance", phone: "05 22 99 11 22" }, { name: "Vitrage Express Maroc", kind: "Bris de glace", phone: "05 22 30 40 50" }];

function Intervenants() {
  const { startCall, clients } = useStore();
  const [t, setT] = useState("experts");
  const list = t === "experts" ? experts.map((e) => ({ id: e.id, name: e.cabinet, sub: e.name, phone: e.phone, email: e.email, active: e.active, delay: e.delay, late: e.late, rate: e.rate, last: e.last, role: "expert" as const }))
    : garages.map((g) => ({ id: g.id, name: g.name, sub: `${g.contact} · ${g.city}`, phone: g.phone, email: `contact@${g.name.toLowerCase().replace(/[^a-z]/g, "")}.ma`, active: g.active, delay: g.delay, late: g.late, rate: g.rate, last: g.last, role: "garage" as const }));
  return (
    <Shell>
      <PageHeader title="Intervenants" subtitle="Experts, garages, clients et partenaires avec indicateurs de performance." />
      <div className="mb-5"><Tabs value={t} onChange={setT} tabs={[{ id: "experts", label: "Experts", count: experts.length }, { id: "garages", label: "Garages", count: garages.length }, { id: "clients", label: "Clients", count: clients.length }, { id: "autres", label: "Autres partenaires", count: PARTNERS.length }]} /></div>
      {(t === "experts" || t === "garages") && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((x, i) => {
            const perf = Math.round(x.rate * 0.7 + (5 - x.delay) * 6 - x.late * 2);
            return (
              <Card key={x.id} delay={i * 0.03} className="p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30">
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", t === "experts" ? "bg-primary/15 text-primary" : "bg-cyan/15 text-cyan")}>{t === "experts" ? <Building2 className="h-5 w-5" /> : <Wrench className="h-5 w-5" />}</span>
                  <div className="flex-1"><p className="font-semibold">{x.name}</p><p className="text-xs text-muted-foreground">{x.sub}</p></div>
                  <span className={cn("rounded-lg px-2 py-1 font-display text-sm font-semibold", perf >= 75 ? "bg-success/15 text-success" : perf >= 60 ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive")}>{perf}</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-surface-2 p-2"><p className="font-display text-lg font-semibold">{x.active}</p><p className="text-[10px] text-muted-foreground">dossiers</p></div>
                  <div className="rounded-xl bg-surface-2 p-2"><p className="font-display text-lg font-semibold">{String(x.delay).replace(".", ",")} j</p><p className="text-[10px] text-muted-foreground">délai moyen</p></div>
                  <div className="rounded-xl bg-surface-2 p-2"><p className={cn("font-display text-lg font-semibold", x.late > 2 && "text-destructive")}>{x.late}</p><p className="text-[10px] text-muted-foreground">en retard</p></div>
                </div>
                <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Taux de réponse</span><span>{x.rate} %</span></div><Progress value={x.rate} tone={x.rate > 85 ? "bg-success" : "bg-warning"} /></div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Dernière interaction {fmt(x.last)}</span>
                  <div className="flex gap-1"><Button size="icon" variant="soft" onClick={() => startCall({ ref: x.id, who: x.name, role: x.role, phone: x.phone })}><Phone className="h-4 w-4" /></Button><Button size="icon" variant="ghost" title={x.email}><Mail className="h-4 w-4" /></Button></div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      {t === "clients" && <Card className="divide-y divide-border">{clients.slice(0, 30).map((c) => <div key={c.id} className="flex items-center gap-3 px-5 py-3"><Avatar name={c.name} /><div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.phone} · {c.email}</p></div><span className="text-xs text-muted-foreground">{c.contracts} contrat(s)</span></div>)}</Card>}
      {t === "autres" && <div className="grid gap-4 md:grid-cols-3">{PARTNERS.map((p) => <Card key={p.name} className="p-5"><p className="font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.kind} · {p.phone}</p></Card>)}</div>}
    </Shell>
  );
}
