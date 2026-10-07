import { useNavigate } from "@tanstack/react-router";
import { Clock, Wrench, UserCheck } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { STAGES, OPERATORS, daysSince, expertById, fmt, garageById, TODAY } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { Card, PriorityBadge, Select, StatusBadge, Tabs } from "./ui";

export function ClaimsBoard() {
  const { claims, moveClaim } = useStore();
  const nav = useNavigate();
  const [over, setOver] = useState<string | null>(null);
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STAGES.map((s, si) => {
        const list = claims.filter((c) => c.stage === s);
        return (
          <div key={s} onDragOver={(e) => { e.preventDefault(); setOver(s); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); moveClaim(e.dataTransfer.getData("id"), s); setOver(null); }}
            className={cn("glass flex w-72 shrink-0 flex-col rounded-2xl p-3 transition-colors", over === s && "border-primary/60 bg-primary/10")}>
            <div className="mb-3 flex items-center justify-between px-1"><p className="text-sm font-semibold"><span className="mr-1.5 text-muted-foreground">{si + 1}.</span>{s}</p><span className="rounded-md bg-muted px-1.5 text-xs">{list.length}</span></div>
            <div className="min-h-24 space-y-2">
              {list.map((c) => {
                const ex = expertById(c.expertId), ga = garageById(c.garageId);
                return (
                  <div key={c.id} draggable onDragStart={(e) => e.dataTransfer.setData("id", c.id)}
                    onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })}
                    className={cn("cursor-grab rounded-xl border border-border bg-card p-3 text-xs shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 active:cursor-grabbing", c.priority === "critique" && "border-l-2 border-l-destructive")}>
                    <div className="flex items-center justify-between"><span className="font-mono text-[11px] text-muted-foreground">{c.id}</span><PriorityBadge p={c.priority} /></div>
                    <p className="mt-1.5 text-sm font-semibold">{c.client}</p>
                    <p className="text-muted-foreground">{c.vehicle} · {c.plate}</p>
                    <div className="mt-2 space-y-0.5 text-muted-foreground">
                      <p className="flex items-center gap-1.5"><UserCheck className="h-3 w-3" />{ex.cabinet}</p>
                      <p className="flex items-center gap-1.5"><Wrench className="h-3 w-3" />{ga.name}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{daysSince(c.declared)} j · {c.lastAction}</p>
                    </div>
                    <p className="mt-2 rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary">→ {c.nextAction}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ClaimsTable() {
  const { claims } = useStore();
  const nav = useNavigate();
  const [stage, setStage] = useState(""); const [op, setOp] = useState(""); const [prio, setPrio] = useState(""); const [q, setQ] = useState("");
  const rows = claims.filter((c) => (!stage || c.stage === stage) && (!op || c.operator === op) && (!prio || c.priority === prio) && (!q || (c.id + c.client + c.plate).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, assuré, immatriculation…" className="h-9 rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none" />
        <Select label="Étape" value={stage} onChange={setStage} options={STAGES} />
        <Select label="Responsable" value={op} onChange={setOp} options={OPERATORS} />
        <Select label="Priorité" value={prio} onChange={setPrio} options={["critique", "haute", "moyenne", "basse"]} />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[1300px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr>{["N° sinistre", "Assuré", "Déclaration", "Véhicule", "Expert", "Garage", "Étape", "Mise à jour", "Prochaine relance", "Responsable", "Ancienneté", "Priorité", "Statut"].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })} className="cursor-pointer border-t border-border hover:bg-accent/30">
                <td className="px-3 py-3 font-mono text-xs">{c.id}</td><td className="px-3 py-3 font-medium">{c.client}</td><td className="px-3 py-3 tabular-nums text-muted-foreground">{fmt(c.declared)}</td>
                <td className="px-3 py-3">{c.vehicle}<p className="text-xs text-muted-foreground">{c.plate}</p></td><td className="px-3 py-3 text-muted-foreground">{expertById(c.expertId).cabinet}</td>
                <td className="px-3 py-3 text-muted-foreground">{garageById(c.garageId).name}</td><td className="px-3 py-3"><StatusBadge s={c.stage} /></td>
                <td className="px-3 py-3 tabular-nums text-muted-foreground">{fmt(c.lastUpdate)}</td><td className={cn("px-3 py-3 tabular-nums", c.nextFollow < TODAY && "text-destructive")}>{fmt(c.nextFollow)}</td>
                <td className="px-3 py-3 text-muted-foreground">{c.operator}</td><td className="px-3 py-3 tabular-nums">{daysSince(c.declared)} j</td>
                <td className="px-3 py-3"><PriorityBadge p={c.priority} /></td><td className="px-3 py-3"><StatusBadge s={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

export function ClaimsViews() {
  const [v, setV] = useState("kanban");
  return (
    <>
      <div className="mb-4"><Tabs value={v} onChange={setV} tabs={[{ id: "kanban", label: "Pipeline" }, { id: "table", label: "Tableau" }]} /></div>
      {v === "kanban" ? <ClaimsBoard /> : <ClaimsTable />}
    </>
  );
}
