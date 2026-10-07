import { createFileRoute } from "@tanstack/react-router";
import { Building2, Car, CreditCard, Database, FileSpreadsheet, FileText, FolderOpen, Upload, UserRoundCheck, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Badge, Btn, Card, Field, PageHeader, Tabs, inputCls } from "@/components/app/ui";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";
import type { Cabinet, Rule } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/parametres")({ head: pageHead("Paramètres", "Informations du cabinet, données disponibles et configuration des relances."), component: Settings });

function Settings() {
  const [tab, setTab] = useState("cabinet");
  return (
    <Shell>
      <PageHeader eyebrow="Configuration" title="Paramètres" />
      <div className="mb-5"><Tabs id="set-tabs" value={tab} onChange={setTab} tabs={[{ id: "cabinet", label: "Informations du cabinet" }, { id: "data", label: "Données disponibles" }, { id: "rules", label: "Configuration des relances" }]} /></div>
      {tab === "cabinet" && <CabinetForm />}
      {tab === "data" && <DataView />}
      {tab === "rules" && <RulesView />}
    </Shell>
  );
}

function CabinetForm() {
  const { cabinet, setCabinet } = useStore();
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState<Cabinet>(cabinet);
  const F: [keyof Cabinet, string][] = [["name", "Nom du cabinet"], ["manager", "Responsable"], ["address", "Adresse"], ["city", "Ville"], ["phone", "Téléphone"], ["email", "Email"], ["ice", "Numéro d’identification (ICE)"]];
  return (
    <Card className="max-w-3xl p-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-accent">{f.logo ? <img src={f.logo} alt="Logo du cabinet" className="h-full w-full object-cover" /> : <Building2 className="h-7 w-7 text-primary" />}</div>
        <div className="flex-1"><p className="font-display text-lg font-semibold">{f.name}</p><p className="text-sm text-muted-foreground">{f.city}</p></div>
        {edit && <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-sm hover:bg-muted"><Upload className="h-4 w-4" />Logo<input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; const r = new FileReader(); r.onload = () => setF({ ...f, logo: String(r.result) }); r.readAsDataURL(file); }} /></label>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{F.map(([k, l]) => <Field key={k} label={l}><input disabled={!edit} className={inputCls} value={f[k] ?? ""} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}</div>
      <div className="mt-6 flex justify-end gap-2">
        {!edit ? <Btn variant="primary" onClick={() => setEdit(true)}>Modifier</Btn> : <><Btn onClick={() => { setF(cabinet); setEdit(false); }}>Annuler</Btn><Btn variant="primary" onClick={() => { setCabinet(f); setEdit(false); toast.success("Informations du cabinet enregistrées"); }}>Enregistrer</Btn></>}
      </div>
    </Card>
  );
}

function DataView() {
  const cards = [["Clients", 245, Users], ["Devis", 82, FileText], ["Paiements", 196, CreditCard], ["Sinistres", 74, Car], ["Experts", 18, UserRoundCheck], ["Garages", 32, Wrench], ["Documents", 458, FolderOpen]] as const;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        {cards.map(([l, v, I], i) => <Card key={l} delay={i * 0.03} className="p-4"><I className="h-5 w-5 text-primary" /><p className="mt-3 font-display text-3xl font-semibold">{v}</p><p className="text-sm text-muted-foreground">{l}</p></Card>)}
      </div>
      <h2 className="mb-3 mt-6 text-lg font-semibold">Sources de données</h2>
      <div className="grid gap-3 md:grid-cols-3">
        {([["Gestion clients", "Connecté", Database], ["Gestion sinistres", "Connecté", Database], ["Import Excel", "Actif", FileSpreadsheet]] as const).map(([l, st, I]) => (
          <Card key={l} className="flex items-center gap-3 p-4"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/12 text-success"><I className="h-5 w-5" /></span><div className="flex-1"><p className="font-semibold">{l}</p><p className="text-xs text-muted-foreground">Synchronisé aujourd’hui</p></div><Badge s={st} /></Card>
        ))}
      </div>
    </>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const { setRule } = useStore();
  const [r, setR] = useState(rule);
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-semibold">{r.title}</h3><label className="flex items-center gap-2 text-sm">{r.enabled ? "Relances activées" : "Désactivées"}<Switch checked={r.enabled} onCheckedChange={(v) => setR({ ...r, enabled: v })} /></label></div>
      <p className="mb-4 text-xs text-muted-foreground">Condition : {r.condition}</p>
      <div className={r.enabled ? "space-y-3" : "pointer-events-none space-y-3 opacity-50"}>
        {r.steps.map((st, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm">
            <span className="flex-1 font-medium">{st.label}</span>
            <input type="number" min={1} className={`${inputCls} w-20`} value={st.value} onChange={(e) => setR({ ...r, steps: r.steps.map((x, j) => (j === i ? { ...x, value: Number(e.target.value) } : x)) })} />
            <select className={`${inputCls} w-28`} value={st.unit} onChange={(e) => setR({ ...r, steps: r.steps.map((x, j) => (j === i ? { ...x, unit: e.target.value as "Jour" | "Heure" } : x)) })}><option>Jour</option><option>Heure</option></select>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end"><Btn variant="primary" onClick={() => { setRule(r); toast.success(`Règles « ${r.title} » enregistrées`); }}>Enregistrer</Btn></div>
    </Card>
  );
}

function RulesView() {
  const { rules } = useStore();
  return <div className="grid gap-5 lg:grid-cols-2">{rules.map((r) => <RuleCard key={r.key} rule={r} />)}</div>;
}
