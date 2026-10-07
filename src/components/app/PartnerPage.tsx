import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Clock, Pencil, Timer } from "lucide-react";
import { useState } from "react";
import { Shell } from "./Shell";
import { Badge, Btn, Card, NextDate, Phone, Stat, Table, rowCls, td } from "./ui";
import { PartnerDialog } from "./dialogs";
import { useNavigate } from "@tanstack/react-router";
import { useStore, type PartnerKind } from "@/lib/store";
import { partnerLoad } from "@/lib/actions";
import { fmt, type Expert, type Garage } from "@/lib/data";

export function PartnerPage({ kind, id }: { kind: PartnerKind; id: string }) {
  const s = useStore();
  const nav = useNavigate();
  const [edit, setEdit] = useState(false);
  const p = (kind === "expert" ? s.experts : s.garages).find((x) => x.id === id) as Expert | Garage | undefined;
  if (!p) return <Shell><p className="text-muted-foreground">Introuvable. <Link to="/intervenants" className="text-primary">Retour</Link></p></Shell>;
  const l = partnerLoad(s.claims, kind, id);
  const isE = kind === "expert";
  const e = p as Expert, g = p as Garage;
  const info: [string, string][] = isE
    ? [["Nom", e.name], ["Cabinet", e.cabinet], ["Email", e.email], ["Adresse", e.address], ["Ville", e.city], ["Spécialité", e.specialty]]
    : [["Nom du garage", g.name], ["Email", g.email], ["Adresse", g.address], ["Ville", g.city], ["Contact principal", g.contact], ["Types de véhicules", g.vehicles]];
  return (
    <Shell>
      <Link to="/intervenants" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Experts & Garagistes</Link>
      <Card className="mb-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{isE ? "Fiche expert" : "Fiche garage"}</p><h1 className="text-3xl font-semibold">{isE ? e.cabinet : g.name}</h1><div className="mt-2 flex items-center gap-3"><Phone n={p.phone} className="text-base" /><Badge s={p.status} /></div></div>
          <Btn onClick={() => setEdit(true)}><Pencil className="h-4 w-4" />Modifier</Btn>
        </div>
        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">{info.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
      </Card>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Dossiers en cours" value={l.current} icon={Clock} tone="warning" />
        <Stat label="Dossiers terminés" value={p.treated + l.done} icon={CheckCircle2} tone="success" delay={0.05} />
        <Card delay={0.1} className="p-4"><div className="flex items-start justify-between"><p className="text-sm font-medium text-muted-foreground">{isE ? "Délai moyen de traitement" : "Délai moyen de réparation"}</p><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Timer className="h-4 w-4" /></span></div><p className="mt-1 font-display text-3xl font-semibold">{String(p.avgDelay).replace(".", ",")} j</p></Card>
      </div>
      <Card className="overflow-hidden">
        <h2 className="p-5 text-lg font-semibold">{isE ? "Dossiers affectés" : "Sinistres affectés"}</h2>
        <Table head={isE ? ["N° sinistre", "Client", "Date d’affectation", "Statut", "Dernière relance", "Prochaine relance"] : ["N° sinistre", "Client", "Véhicule", "Date d’affectation", "Statut réparation", "Dernière relance", "Prochaine relance"]} empty={!l.mine.length}>
          {l.mine.map((c) => (
            <tr key={c.id} className={rowCls} onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })}>
              <td className={`${td} font-mono text-xs font-semibold`}>{c.id}</td>
              <td className={`${td} font-semibold`}>{s.clients.find((x) => x.id === c.clientId)?.name}</td>
              {!isE && <td className={td}>{c.vehicle} <span className="font-mono text-xs text-muted-foreground">{c.plate}</span></td>}
              <td className={td}>{fmt(isE ? c.expertAssigned : c.garageAssigned)}</td>
              <td className={td}><Badge s={isE ? c.expertStatus : c.garageStatus} /></td>
              <td className={td}>{fmt(isE ? c.expertLast : c.garageLast)}</td>
              <td className={td}><NextDate d={isE ? c.expertNext : c.garageNext} /></td>
            </tr>
          ))}
        </Table>
      </Card>
      <PartnerDialog kind={kind} item={p} open={edit} onClose={() => setEdit(false)} />
    </Shell>
  );
}
