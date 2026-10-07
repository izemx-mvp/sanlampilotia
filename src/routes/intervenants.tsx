import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, FileSpreadsheet, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Badge, Btn, Card, PageHeader, Phone, Sel, Table, Tabs, inputCls, rowCls, td } from "@/components/app/ui";
import { Confirm, ImportDialog, PartnerDialog } from "@/components/app/dialogs";
import { useStore, type PartnerKind } from "@/lib/store";
import { CITIES, norm, type Claim, type Expert, type Garage } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intervenants")({ head: pageHead("Experts & Garagistes", "Gérez vos experts et garages partenaires : ajout, modification, import Excel / CSV."), component: Partners });

export const partnerLoad = (claims: Claim[], kind: PartnerKind, id: string) => {
  const mine = claims.filter((c) => (kind === "expert" ? c.expertId : c.garageId) === id);
  const done = mine.filter((c) => (kind === "expert" ? c.expertStatus === "Rapport reçu" : c.garageStatus === "Véhicule prêt") || c.status === "Clôturé");
  return { mine, current: mine.length - done.length, done: done.length };
};

function Partners() {
  const s = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState<PartnerKind>("expert");
  const [q, setQ] = useState(""); const [city, setCity] = useState(""); const [st, setSt] = useState("");
  const [edit, setEdit] = useState<{ item: Expert | Garage | null } | null>(null);
  const [imp, setImp] = useState(false);
  const [del, setDel] = useState<Expert | Garage | null>(null);
  const list = (tab === "expert" ? s.experts : s.garages) as (Expert | Garage)[];
  const rows = list.filter((p) => (!city || p.city === city) && (!st || p.status === st) && (!q || norm(Object.values(p).join(" ")).includes(norm(q))));
  const open = (p: Expert | Garage) => (tab === "expert" ? nav({ to: "/experts/$id", params: { id: p.id } }) : nav({ to: "/garages/$id", params: { id: p.id } }));
  const Actions = ({ p }: { p: Expert | Garage }) => (
    <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
      <Btn size="icon" variant="ghost" title="Consulter la fiche" onClick={() => open(p)}><Eye className="h-4 w-4" /></Btn>
      <Btn size="icon" variant="ghost" title="Modifier" onClick={() => setEdit({ item: p })}><Pencil className="h-4 w-4" /></Btn>
      <Btn size="icon" variant="ghost" title="Supprimer" className="hover:text-destructive" onClick={() => setDel(p)}><Trash2 className="h-4 w-4" /></Btn>
    </div>
  );
  return (
    <Shell>
      <PageHeader eyebrow="Partenaires" title="Experts & Garagistes" subtitle="Toutes les coordonnées de vos partenaires et leur charge de dossiers." actions={<>
        <Btn onClick={() => setImp(true)}><FileSpreadsheet className="h-4 w-4 text-success" />Importer Excel / CSV</Btn>
        <Btn variant="primary" onClick={() => setEdit({ item: null })}><Plus className="h-4 w-4" />{tab === "expert" ? "Ajouter un expert" : "Ajouter un garage"}</Btn>
      </>} />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Tabs id="pt-tabs" value={tab} onChange={(v) => setTab(v as PartnerKind)} tabs={[{ id: "expert", label: "Experts", count: s.experts.length }, { id: "garage", label: "Garagistes", count: s.garages.length }]} />
        <div className="relative min-w-[220px] flex-1 md:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={cn(inputCls, "pl-9")} placeholder="Nom, téléphone, email…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Sel label="Ville" value={city} onChange={setCity} options={CITIES} />
        <Sel label="Statut" value={st} onChange={setSt} options={["Actif", "Inactif"]} />
      </div>
      <Card className="overflow-hidden">
        {tab === "expert" ? (
          <Table head={["Expert", "Cabinet", "Ville", "Téléphone", "Email", "Adresse", "Spécialité", "En cours", "Traités", "Statut", ""]} empty={!rows.length}>
            {(rows as Expert[]).map((e) => { const l = partnerLoad(s.claims, "expert", e.id); return (
              <tr key={e.id} className={rowCls} onClick={() => open(e)}>
                <td className={cn(td, "whitespace-nowrap font-semibold")}>{e.name}</td><td className={cn(td, "min-w-[180px]")}>{e.cabinet}</td><td className={td}>{e.city}</td>
                <td className={td}><Phone n={e.phone} /></td><td className={cn(td, "text-xs text-muted-foreground")}>{e.email}</td><td className={cn(td, "min-w-[180px] text-xs text-muted-foreground")}>{e.address}</td>
                <td className={td}>{e.specialty}</td><td className={cn(td, "text-center font-semibold")}>{l.current}</td><td className={cn(td, "text-center")}>{e.treated + l.done}</td>
                <td className={td}><Badge s={e.status} /></td><td className={td}><Actions p={e} /></td>
              </tr>); })}
          </Table>
        ) : (
          <Table head={["Garage", "Ville", "Adresse", "Téléphone", "Email", "Contact principal", "Véhicules", "En cours", "Traités", "Statut", ""]} empty={!rows.length}>
            {(rows as Garage[]).map((g) => { const l = partnerLoad(s.claims, "garage", g.id); return (
              <tr key={g.id} className={rowCls} onClick={() => open(g)}>
                <td className={cn(td, "min-w-[170px] font-semibold")}>{g.name}</td><td className={td}>{g.city}</td><td className={cn(td, "min-w-[180px] text-xs text-muted-foreground")}>{g.address}</td>
                <td className={td}><Phone n={g.phone} /></td><td className={cn(td, "text-xs text-muted-foreground")}>{g.email}</td><td className={cn(td, "whitespace-nowrap")}>{g.contact}</td>
                <td className={cn(td, "min-w-[140px] text-xs")}>{g.vehicles}</td><td className={cn(td, "text-center font-semibold")}>{l.current}</td><td className={cn(td, "text-center")}>{g.treated + l.done}</td>
                <td className={td}><Badge s={g.status} /></td><td className={td}><Actions p={g} /></td>
              </tr>); })}
          </Table>
        )}
      </Card>
      <PartnerDialog kind={tab} open={!!edit} item={edit?.item} onClose={() => setEdit(null)} />
      <ImportDialog kind={tab} open={imp} onClose={() => setImp(false)} />
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Supprimer ${del && "cabinet" in del ? del.cabinet : del?.name} ?`} onConfirm={() => { if (del) { s.deletePartner(tab, del.id); toast.success("Supprimé"); } }}>
        <p className="text-sm text-muted-foreground">Cette action retire le partenaire de la liste.</p>
      </Confirm>
    </Shell>
  );
}
