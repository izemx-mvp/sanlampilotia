import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Badge, Btn, Card, NextDate, PageHeader, Prio, RecoPanel, Sel, Stat, Table, inputCls, rowCls, td } from "@/components/app/ui";
import { ClaimDialog } from "@/components/app/dialogs";
import { useStore } from "@/lib/store";
import { buildActions, claimLast, claimNext, claimPriority } from "@/lib/actions";
import { CITIES, CLAIM_STATUSES, CLAIM_TYPES, diffDays, fmt, norm } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";
import { Car, ClipboardCheck, UserRoundCheck, Wrench } from "lucide-react";

export const Route = createFileRoute("/agent-sinistre")({ head: pageHead("Agent IA — Suivi Sinistre", "Créer, suivre et relancer les sinistres, experts et garagistes."), component: AgentSinistre });

function AgentSinistre() {
  const s = useStore();
  const nav = useNavigate();
  const [add, setAdd] = useState(false);
  const [q, setQ] = useState(""); const [city, setCity] = useState(""); const [st, setSt] = useState(""); const [pr, setPr] = useState(""); const [due, setDue] = useState(""); const [type, setType] = useState("");
  const items = useMemo(() => buildActions(s).filter((i) => i.agent === "sinistre"), [s.claims, s.experts, s.garages, s.clients]); // eslint-disable-line react-hooks/exhaustive-deps
  const name = (id?: string, k: "c" | "e" | "g" = "c") => (k === "c" ? s.clients.find((x) => x.id === id)?.name : k === "e" ? s.experts.find((x) => x.id === id)?.cabinet : s.garages.find((x) => x.id === id)?.name) ?? "";
  const rows = s.claims.filter((c) => {
    const n = claimNext(c);
    return (!city || c.city === city) && (!st || c.status === st) && (!type || c.type === type) && (!pr || claimPriority(c) === pr)
      && (!due || (!!n && (due === "Aujourd’hui" ? diffDays(n) === 0 : due === "En retard" ? diffDays(n) < 0 : diffDays(n) >= 0 && diffDays(n) <= 7)))
      && (!q || norm([c.id, c.plate, c.vehicle, name(c.clientId), name(c.expertId, "e"), name(c.garageId, "g"), s.clients.find((x) => x.id === c.clientId)?.phone ?? ""].join(" ")).includes(norm(q)));
  });
  const open = s.claims.filter((c) => c.status !== "Clôturé");
  return (
    <Shell>
      <PageHeader eyebrow="Agent IA" title="Agent IA — Suivi Sinistre" subtitle="L’agent analyse dates, expert, garage, rapport, devis et relances pour vous indiquer quoi faire." actions={<Btn size="lg" variant="primary" onClick={() => setAdd(true)}><Plus className="h-5 w-5" />Ajouter un sinistre</Btn>} />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Sinistres ouverts" value={open.length} icon={Car} tone="navy" />
        <Stat label="Experts à relancer" value={items.filter((i) => i.target === "Expert").length} icon={UserRoundCheck} tone="cyan" delay={0.04} />
        <Stat label="Garages à relancer" value={items.filter((i) => i.target === "Garage").length} icon={Wrench} tone="success" delay={0.08} />
        <Stat label="À affecter" value={items.filter((i) => /affecter/.test(i.motif)).length} icon={ClipboardCheck} tone="warning" delay={0.12} />
      </div>
      <RecoPanel title="Relances nécessaires — Agent Sinistre" recos={items.slice(0, 6).map((i) => ({ key: i.key, text: i.reco, urgent: i.priority === "Haute", onClick: () => nav({ to: "/sinistres/$id", params: { id: i.claimId! } }) }))} />
      <div className="mt-5 mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[240px] flex-1 md:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={cn(inputCls, "pl-9")} placeholder="N° sinistre, client, immatriculation, expert…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Sel label="Ville" value={city} onChange={setCity} options={CITIES} />
        <Sel label="Statut" value={st} onChange={setSt} options={CLAIM_STATUSES} />
        <Sel label="Priorité" value={pr} onChange={setPr} options={["Haute", "Moyenne", "Basse"]} />
        <Sel label="Relance" value={due} onChange={setDue} options={["Aujourd’hui", "En retard", "7 prochains jours"]} />
        <Sel label="Type" value={type} onChange={setType} options={CLAIM_TYPES} />
      </div>
      <Card className="overflow-hidden">
        <Table head={["N° sinistre", "Client", "Ville", "Véhicule", "Date", "Expert", "Garage", "Statut", "Dernière relance", "Prochaine relance", "Priorité"]} empty={!rows.length}>
          {rows.map((c) => (
            <tr key={c.id} className={rowCls} onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })}>
              <td className={cn(td, "whitespace-nowrap font-mono text-xs font-semibold")}>{c.id}</td>
              <td className={cn(td, "font-semibold")}>{name(c.clientId)}</td>
              <td className={td}>{c.city}</td>
              <td className={cn(td, "whitespace-nowrap")}>{c.vehicle}<span className="block font-mono text-xs text-muted-foreground">{c.plate}</span></td>
              <td className={td}>{fmt(c.date)}</td>
              <td className={cn(td, "min-w-[140px]")}>{name(c.expertId, "e") || <span className="text-warning">À affecter</span>}</td>
              <td className={cn(td, "min-w-[140px]")}>{name(c.garageId, "g") || <span className="text-muted-foreground">—</span>}</td>
              <td className={td}><Badge s={c.status} /></td>
              <td className={td}>{fmt(claimLast(c))}</td>
              <td className={td}><NextDate d={claimNext(c)} /></td>
              <td className={td}><Prio p={claimPriority(c)} /></td>
            </tr>
          ))}
        </Table>
      </Card>
      <ClaimDialog open={add} onClose={() => setAdd(false)} />
    </Shell>
  );
}
