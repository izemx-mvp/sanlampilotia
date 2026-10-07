import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, Car, Mail, MessageCircle, Phone, Wrench, UserCheck, Check, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Shell, Timeline } from "@/components/app/Shell";
import { Button, Card, PriorityBadge, StatusBadge } from "@/components/app/ui";
import { PostponeButton } from "@/components/app/actions";
import { useStore } from "@/lib/store";
import { GARAGE_STATUSES, daysSince, expertById, fmt, fmtLong, garageById } from "@/lib/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sinistres/$id")({
  head: ({ params }) => ({ meta: [{ title: `${params.id} — Fiche sinistre — PilotIA` }, { name: "description", content: `Suivi détaillé du sinistre ${params.id}.` }, { property: "og:title", content: `Sinistre ${params.id}` }, { property: "og:description", content: "Timeline, expert, garage et recommandations IA." }] }),
  component: ClaimPage,
});

function Info({ l, v }: { l: string; v: string }) { return <div><p className="text-[11px] text-muted-foreground">{l}</p><p className="text-sm font-medium">{v}</p></div>; }

function ClaimPage() {
  const { id } = Route.useParams();
  const { claims, startCall, message, addNote, resolve, setGarageStatus } = useStore();
  const c = claims.find((x) => x.id === id);
  const [note, setNote] = useState("");
  if (!c) return <Shell><p className="text-muted-foreground">Sinistre introuvable. <Link to="/sinistres" className="text-primary">Retour</Link></p></Shell>;
  const ex = expertById(c.expertId), ga = garageById(c.garageId);
  const stale = daysSince(c.lastUpdate);
  return (
    <Shell>
      <Link to="/sinistres" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Sinistres</Link>
      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan/15 text-cyan"><Car className="h-7 w-7" /></span>
            <div><p className="font-mono text-sm text-muted-foreground">{c.id}</p><h1 className="text-2xl font-semibold">{c.type}</h1></div>
          </div>
          <div className="flex gap-2"><StatusBadge s={c.stage} /><PriorityBadge p={c.priority} /></div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Info l="Client" v={c.client} /><Info l="Véhicule" v={c.vehicle} /><Info l="Immatriculation" v={c.plate} /><Info l="Date déclaration" v={fmtLong(c.declared)} /><Info l="Statut" v={c.status} /><Info l="Responsable" v={c.operator} />
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <Card className="border-warning/30 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/15 text-warning"><AlertTriangle className="h-5 w-5" /></span>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-warning">Alerte IA</p>
                <p className="mt-0.5 font-medium">{stale > 0 ? `Ce dossier n’a pas été mis à jour depuis ${stale} jour${stale > 1 ? "s" : ""}.` : c.issue}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-primary"><Bot className="h-4 w-4" />Recommandation : {c.nextAction} aujourd’hui.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => startCall({ ref: c.id, who: ex.cabinet, role: "expert", phone: ex.phone })}><Phone className="h-3.5 w-3.5" />Appeler expert</Button>
              <Button size="sm" onClick={() => message(c.id, "email", ex.cabinet)}><Mail className="h-3.5 w-3.5" />Envoyer message</Button>
              <PostponeButton refId={c.id} />
              <Button size="sm" variant="success" onClick={() => resolve(c.id)}><Check className="h-3.5 w-3.5" />Marquer comme réalisé</Button>
            </div>
            <div className="mt-3 flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…" className="h-9 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none" />
              <Button size="sm" variant="soft" disabled={!note} onClick={() => { addNote(c.id, note); setNote(""); }}>Ajouter note</Button>
            </div>
          </Card>
          <Card className="p-5"><Timeline events={c.timeline} /></Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><UserCheck className="h-4 w-4 text-primary" /><h3 className="font-semibold">Expert</h3></div>
            <p className="font-medium">{ex.name}</p><p className="text-sm text-muted-foreground">{ex.cabinet}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Info l="Téléphone" v={ex.phone} /><Info l="Email" v={ex.email} /><Info l="Affectation" v={fmt(c.declared)} /><Info l="Dernier contact" v={fmt(c.expertCalls[0]?.date ?? c.lastUpdate)} /><Info l="Prochaine relance" v={fmt(c.nextFollow)} />
            </div>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Historique des appels</p>
            <ul className="space-y-1.5 text-sm">{c.expertCalls.map((x, i) => <li key={i} className="flex gap-2"><span className="tabular-nums text-muted-foreground">{fmt(x.date)}</span>— {x.label}</li>)}</ul>
            <Button variant="primary" size="sm" className="mt-4 w-full" onClick={() => startCall({ ref: c.id, who: ex.cabinet, role: "expert", phone: ex.phone })}><Phone className="h-3.5 w-3.5" />Appeler l’expert</Button>
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><Wrench className="h-4 w-4 text-cyan" /><h3 className="font-semibold">Garage</h3></div>
            <p className="font-medium">{ga.name}</p><p className="text-sm text-muted-foreground">{ga.contact} · {ga.city}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><Info l="Téléphone" v={ga.phone} /><Info l="Dernière relance" v={fmt(c.garageCalls[0]?.date ?? ga.last)} /><Info l="Prochaine relance" v={fmt(c.nextFollow)} /></div>
            <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut garage</p>
            <div className="flex flex-wrap gap-1.5">
              {GARAGE_STATUSES.map((s) => <button key={s} onClick={() => setGarageStatus(c.id, s)} className={cn("rounded-lg border px-2.5 py-1 text-xs transition-colors", c.garageStatus === s ? "border-cyan/50 bg-cyan/15 text-cyan" : "border-border text-muted-foreground hover:text-foreground")}>{s}</button>)}
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">{c.garageCalls.map((x, i) => <li key={i} className="flex gap-2"><span className="tabular-nums text-muted-foreground">{fmt(x.date)}</span>— {x.label}</li>)}</ul>
            <div className="mt-4 flex gap-2">
              <Button variant="soft" size="sm" className="flex-1" onClick={() => startCall({ ref: c.id, who: ga.name, role: "garage", phone: ga.phone })}><Phone className="h-3.5 w-3.5" />Appeler le garage</Button>
              <Button size="icon" variant="ghost" onClick={() => message(c.id, "whatsapp", ga.name)}><MessageCircle className="h-4 w-4" /></Button>
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
