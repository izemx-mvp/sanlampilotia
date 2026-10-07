import { useNavigate } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText, Upload } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge, Btn, Field, Modal, Table, downloadMock, inputCls, td } from "./ui";
import { useStore, type PartnerKind } from "@/lib/store";
import { CITIES, CLAIM_TYPES, PRODUCTS, QUOTE_STATUSES, TODAY, addDays, fromInput, toInput, type Expert, type Follow, type Garage, type QuoteStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ---------- Ajouter une relance ---------- */
type FollowCfg = { title: string; subtitle?: string; results: string[]; onSave: (f: Follow) => void } | null;
export function useFollowDialog() {
  const [cfg, setCfg] = useState<FollowCfg>(null);
  const [f, setF] = useState({ date: "", result: "", comment: "", next: "" });
  useEffect(() => { if (cfg) setF({ date: toInput(TODAY), result: cfg.results[0], comment: "", next: toInput(addDays(TODAY, 2)) }); }, [cfg]);
  const el = (
    <Modal open={!!cfg} onClose={() => setCfg(null)} title={cfg?.title ?? ""} description={cfg?.subtitle}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Résultat"><select className={inputCls} value={f.result} onChange={(e) => setF({ ...f, result: e.target.value })}>{cfg?.results.map((r) => <option key={r}>{r}</option>)}</select></Field>
        <Field label="Commentaire" className="sm:col-span-2"><textarea className={cn(inputCls, "h-20 py-2")} value={f.comment} onChange={(e) => setF({ ...f, comment: e.target.value })} placeholder="Ex : rappeler après 15h" /></Field>
        <Field label="Prochaine date de relance"><input type="date" className={inputCls} value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></Field>
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <Btn onClick={() => setCfg(null)}>Annuler</Btn>
        <Btn variant="primary" onClick={() => { cfg?.onSave({ date: fromInput(f.date) ?? TODAY, result: f.result, comment: f.comment, next: fromInput(f.next) }); toast.success("Relance enregistrée"); setCfg(null); }}>Enregistrer la relance</Btn>
      </div>
    </Modal>
  );
  return [setCfg, el] as const;
}

/* ---------- Visionneuse de document (mock) ---------- */
type DocCfg = { name: string; lines: string[] } | null;
export function useDocViewer() {
  const [doc, setDoc] = useState<DocCfg>(null);
  const el = (
    <Modal open={!!doc} onClose={() => setDoc(null)} title={doc?.name ?? ""} description="Aperçu du document (simulation)">
      <div className="rounded-xl border border-border bg-surface-2 p-6">
        <div className="mx-auto max-w-sm rounded-lg bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3"><FileText className="h-5 w-5 text-primary" /><p className="font-display font-semibold">{doc?.lines[0]}</p></div>
          <div className="space-y-1.5 text-sm">{doc?.lines.slice(1).map((l, i) => <p key={i} className="text-muted-foreground">{l}</p>)}</div>
        </div>
      </div>
      <div className="flex justify-end"><Btn variant="primary" onClick={() => doc && downloadMock(doc.name, doc.lines)}><Download className="h-4 w-4" />Télécharger</Btn></div>
    </Modal>
  );
  return [setDoc, el] as const;
}

/* ---------- Ajouter un devis client ---------- */
export function QuoteDialog({ open, onClose, clientId }: { open: boolean; onClose: () => void; clientId?: string }) {
  const { clients, addQuote } = useStore();
  const blank = () => ({ clientId: clientId ?? "", product: PRODUCTS[0], amount: "", date: toInput(TODAY), status: "Envoyé" as QuoteStatus, file: "" });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = () => {
    if (!f.clientId || !Number(f.amount)) return toast.error("Client et montant sont obligatoires");
    const id = addQuote({ clientId: f.clientId, product: f.product, amount: Number(f.amount), date: fromInput(f.date) ?? TODAY, status: f.status, doc: f.file });
    toast.success(`Devis ${id} ajouté`); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title="Ajouter un devis" description="Le devis est ajouté à la fiche client et suivi par l’Agent IA.">
      <div className="grid gap-3 sm:grid-cols-2">
        {!clientId && <Field label="Client" className="sm:col-span-2"><select className={inputCls} value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })}><option value="">Choisir un client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.id}</option>)}</select></Field>}
        <Field label="Produit"><select className={inputCls} value={f.product} onChange={(e) => setF({ ...f, product: e.target.value })}>{PRODUCTS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Montant (DH)"><input type="number" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="4500" /></Field>
        <Field label="Date du devis"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
        <Field label="Statut"><select className={inputCls} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as QuoteStatus })}>{QUOTE_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field label="Document (PDF)" className="sm:col-span-2"><FilePick accept=".pdf" value={f.file} onPick={(n) => setF({ ...f, file: n[0] ?? "" })} /></Field>
      </div>
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Annuler</Btn><Btn variant="primary" onClick={save}>Ajouter le devis</Btn></div>
    </Modal>
  );
}

export function FilePick({ accept, value, onPick, multiple, label = "Choisir un fichier" }: { accept?: string; value?: string; onPick: (names: string[]) => void; multiple?: boolean; label?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-surface-2 px-3 py-3 text-sm transition hover:border-primary hover:bg-accent">
      <Upload className="h-4 w-4 text-primary" /><span className="flex-1 truncate text-muted-foreground">{value || label}</span>
      <input type="file" className="hidden" accept={accept} multiple={multiple} onChange={(e) => onPick(Array.from(e.target.files ?? []).map((x) => x.name))} />
    </label>
  );
}

/* ---------- Recommandations experts / garages ---------- */
export function PartnerRecos({ kind, city, selected, onPick, cta = "Affecter" }: { kind: PartnerKind; city: string; selected?: string; onPick: (id: string) => void; cta?: string }) {
  const { experts, garages } = useStore();
  const list = (kind === "expert" ? experts : garages).filter((p) => p.city === city && p.status === "Actif").sort((a, b) => b.treated - a.treated);
  if (!list.length) return <p className="text-sm text-muted-foreground">Aucun {kind === "expert" ? "expert" : "garage"} actif à {city}.</p>;
  return (
    <div className="space-y-2">
      {list.map((p) => (
        <div key={p.id} className={cn("flex items-center gap-3 rounded-xl border p-3 transition", selected === p.id ? "border-primary bg-accent" : "border-border bg-surface-2")}>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{"cabinet" in p ? p.cabinet : p.name}</p>
            <p className="text-xs text-muted-foreground">{p.city} · {p.treated} dossiers traités · Délai moyen : {String(p.avgDelay).replace(".", ",")} jour{p.avgDelay > 1 ? "s" : ""}</p>
          </div>
          <Btn size="sm" variant={selected === p.id ? "success" : "soft"} onClick={() => onPick(p.id)}>{selected === p.id ? "Affecté ✓" : cta}</Btn>
        </div>
      ))}
    </div>
  );
}

/* ---------- Ajouter un sinistre ---------- */
export function ClaimDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { clients, addClaim } = useStore();
  const nav = useNavigate();
  const blank = () => ({ clientId: "", contract: "", type: CLAIM_TYPES[0], date: toInput(TODAY), city: "Casablanca", vehicle: "", plate: "", description: "", docs: [] as string[], photos: [] as string[], expertId: "", garageId: "" });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open]);
  const set = (k: keyof ReturnType<typeof blank>) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    if (!f.clientId || !f.vehicle) return toast.error("Client et véhicule sont obligatoires");
    const id = addClaim({ ...f, date: fromInput(f.date) ?? TODAY, expertId: f.expertId || undefined, garageId: f.garageId || undefined });
    toast.success(`Sinistre ${id} créé`, { description: "Statut initial et prochaine action générés automatiquement." });
    onClose(); nav({ to: "/sinistres/$id", params: { id } });
  };
  return (
    <Modal open={open} onClose={onClose} wide title="Ajouter un sinistre" description="Le numéro de sinistre, le statut initial et la date de prochaine action sont générés automatiquement.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Client" className="sm:col-span-2"><select className={inputCls} value={f.clientId} onChange={(e) => { const c = clients.find((x) => x.id === e.target.value); setF({ ...f, clientId: e.target.value, city: c?.city ?? f.city, expertId: "", garageId: "" }); }}><option value="">Choisir un client…</option>{clients.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}</select></Field>
        <Field label="Numéro contrat"><input className={inputCls} value={f.contract} onChange={set("contract")} placeholder="AUTO-12345" /></Field>
        <Field label="Type de sinistre"><select className={inputCls} value={f.type} onChange={set("type")}>{CLAIM_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Date du sinistre"><input type="date" className={inputCls} value={f.date} onChange={set("date")} /></Field>
        <Field label="Ville"><select className={inputCls} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value, expertId: "", garageId: "" })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Véhicule"><input className={inputCls} value={f.vehicle} onChange={set("vehicle")} placeholder="Dacia Logan" /></Field>
        <Field label="Immatriculation"><input className={inputCls} value={f.plate} onChange={set("plate")} placeholder="12345-A-6" /></Field>
        <div />
        <Field label="Description" className="sm:col-span-3"><textarea className={cn(inputCls, "h-20 py-2")} value={f.description} onChange={set("description")} placeholder="Circonstances du sinistre…" /></Field>
        <Field label="Documents (constat, CIN, carte grise…)" className="sm:col-span-3 md:col-span-1"><FilePick multiple accept=".pdf,.jpg,.png" value={f.docs.join(", ")} onPick={(n) => setF({ ...f, docs: n })} /></Field>
        <Field label="Photos" className="sm:col-span-3 md:col-span-2"><FilePick multiple accept="image/*" value={f.photos.join(", ")} onPick={(n) => setF({ ...f, photos: n })} label="Ajouter des photos" /></Field>
      </div>
      <div className="rounded-2xl border border-border bg-surface-2/50 p-4">
        <p className="mb-3 font-display font-semibold">Recommandations pour {f.city}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Experts recommandés</p><PartnerRecos kind="expert" city={f.city} selected={f.expertId} onPick={(id) => setF({ ...f, expertId: f.expertId === id ? "" : id })} /></div>
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Garages recommandés</p><PartnerRecos kind="garage" city={f.city} selected={f.garageId} onPick={(id) => setF({ ...f, garageId: f.garageId === id ? "" : id })} /></div>
        </div>
      </div>
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Annuler</Btn><Btn variant="primary" onClick={save}>Créer le sinistre</Btn></div>
    </Modal>
  );
}

/* ---------- Expert / Garage : ajout & modification ---------- */
const emptyExpert = (): Expert => ({ id: "", name: "", cabinet: "", city: "Casablanca", phone: "", email: "", address: "", specialty: "Automobile", status: "Actif", treated: 0, avgDelay: 2 });
const emptyGarage = (): Garage => ({ id: "", name: "", city: "Casablanca", address: "", phone: "", email: "", contact: "", vehicles: "Tourisme", status: "Actif", treated: 0, avgDelay: 7 });
export function PartnerDialog({ kind, item, open, onClose }: { kind: PartnerKind; item?: Expert | Garage | null; open: boolean; onClose: () => void }) {
  const { savePartner } = useStore();
  const [f, setF] = useState<Record<string, string | number>>({});
  useEffect(() => { if (open) setF({ ...(item ?? (kind === "expert" ? emptyExpert() : emptyGarage())) }); }, [open, item, kind]);
  const fields: [string, string][] = kind === "expert"
    ? [["name", "Nom de l’expert"], ["cabinet", "Cabinet"], ["phone", "Téléphone"], ["email", "Email"], ["address", "Adresse"], ["specialty", "Spécialité"]]
    : [["name", "Nom du garage"], ["contact", "Contact principal"], ["phone", "Téléphone"], ["email", "Email"], ["address", "Adresse"], ["vehicles", "Types de véhicules"]];
  const save = () => {
    if (!f.name || !f.phone) return toast.error("Nom et téléphone sont obligatoires");
    savePartner(kind, f as unknown as Expert | Garage);
    toast.success(item ? "Modifications enregistrées" : kind === "expert" ? "Expert ajouté" : "Garage ajouté"); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`${item ? "Modifier" : "Ajouter"} ${kind === "expert" ? "un expert" : "un garage"}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(([k, l]) => <Field key={k} label={l}><input className={inputCls} value={String(f[k] ?? "")} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></Field>)}
        <Field label="Ville"><select className={inputCls} value={String(f.city ?? "")} onChange={(e) => setF({ ...f, city: e.target.value })}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Statut"><select className={inputCls} value={String(f.status ?? "Actif")} onChange={(e) => setF({ ...f, status: e.target.value })}><option>Actif</option><option>Inactif</option></select></Field>
      </div>
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Annuler</Btn><Btn variant="primary" onClick={save}>Enregistrer</Btn></div>
    </Modal>
  );
}

/* ---------- Import Excel / CSV (simulé, avec prévisualisation) ---------- */
const COLS = { expert: ["name", "cabinet", "city", "phone", "email", "address", "specialty"], garage: ["name", "city", "address", "phone", "email", "contact", "vehicles"] } as const;
const LABELS: Record<string, string> = { name: "Nom", cabinet: "Cabinet", city: "Ville", phone: "Téléphone", email: "Email", address: "Adresse", specialty: "Spécialité", contact: "Contact", vehicles: "Véhicules" };
const SAMPLE = {
  expert: [["Khalid Amzil", "Cabinet Expertise Bouskoura", "Casablanca", "06 61 45 78 12", "k.amzil@expertise-bouskoura.ma", "12 Rue Al Massira, Casablanca", "Automobile"], ["Sanae Ghazi", "Cabinet Hay Riad Expertise", "Rabat", "06 70 33 21 90", "contact@hayriad-expertise.ma", "8 Av. Annakhil, Rabat", "Bris de glace"], ["Mourad Lahbabi", "Expertise Saïss", "Fès", "06 62 18 54 07", "m.lahbabi@saiss-expertise.ma", "3 Bd Allal El Fassi, Fès", "Automobile"]],
  garage: [["Garage Ain Sebaa Auto", "Casablanca", "24 Route de Rabat, Casablanca", "05 22 35 66 10", "atelier@ainsebaa-auto.ma", "Hicham Naji", "Tourisme, Utilitaires"], ["Garage Guéliz Service", "Marrakech", "17 Rue de la Liberté, Marrakech", "05 24 43 12 88", "contact@gueliz-service.ma", "Said Amrani", "Tourisme, SUV"], ["Garage Malabata", "Tanger", "5 Av. Malabata, Tanger", "05 39 94 20 71", "atelier@malabata.ma", "Rachid Bakkali", "Tourisme"]],
};
export function ImportDialog({ kind, open, onClose }: { kind: PartnerKind; open: boolean; onClose: () => void }) {
  const { importPartners } = useStore();
  const [rows, setRows] = useState<string[][] | null>(null);
  const [file, setFile] = useState("");
  useEffect(() => { if (open) { setRows(null); setFile(""); } }, [open]);
  const cols = COLS[kind];
  const onFile = async (fl?: File) => {
    if (!fl) return;
    setFile(fl.name);
    if (/\.csv$/i.test(fl.name)) {
      const lines = (await fl.text()).split(/\r?\n/).filter((l) => l.trim());
      const parsed = lines.slice(1).map((l) => l.split(/[;,]/).map((x) => x.trim()));
      setRows(parsed.length ? parsed : SAMPLE[kind]);
    } else setRows(SAMPLE[kind]); // Excel : lecture simulée dans le MVP
  };
  const template = () => {
    const csv = [cols.map((c) => LABELS[c]).join(";"), ...SAMPLE[kind].map((r) => r.join(";"))].join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `modele-${kind === "expert" ? "experts" : "garages"}.csv`; a.click();
  };
  const validate = () => {
    if (!rows) return;
    const items = rows.map((r) => {
      const o: Record<string, string | number> = { status: "Actif", treated: 0, avgDelay: kind === "expert" ? 2 : 7 };
      cols.forEach((c, i) => (o[c] = r[i] ?? ""));
      return o as unknown as Expert | Garage;
    });
    importPartners(kind, items);
    toast.success(`${items.length} ${kind === "expert" ? "experts" : "garages"} importés`); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} wide title={`Importer des ${kind === "expert" ? "experts" : "garages"}`} description="Fichier Excel (.xlsx) ou CSV. Vérifiez la prévisualisation avant validation.">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-input bg-surface-2 px-4 py-4 text-sm hover:border-primary hover:bg-accent">
          <FileSpreadsheet className="h-5 w-5 text-success" /><span className="flex-1 text-muted-foreground">{file || "Déposer ou choisir un fichier .xlsx / .csv"}</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
        <Btn variant="ghost" onClick={template}><Download className="h-4 w-4" />Modèle CSV</Btn>
        {!rows && <Btn variant="soft" onClick={() => { setFile("exemple-import.xlsx"); setRows(SAMPLE[kind]); }}>Utiliser un fichier exemple</Btn>}
      </div>
      {rows && (
        <div className="overflow-hidden rounded-xl border border-border">
          <p className="border-b border-border bg-surface-2 px-4 py-2 text-xs font-semibold">Prévisualisation · {rows.length} lignes détectées <Badge s="Prêt à importer" /></p>
          <Table head={cols.map((c) => LABELS[c])}>{rows.map((r, i) => <tr key={i}>{cols.map((_, j) => <td key={j} className={cn(td, "whitespace-nowrap")}>{r[j] || <span className="text-destructive">manquant</span>}</td>)}</tr>)}</Table>
        </div>
      )}
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Annuler</Btn><Btn variant="primary" disabled={!rows} onClick={validate}>Valider l’import</Btn></div>
    </Modal>
  );
}

export function Confirm({ open, onClose, onConfirm, title, children }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; children?: ReactNode }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {children}
      <div className="flex justify-end gap-2"><Btn onClick={onClose}>Annuler</Btn><Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>Supprimer</Btn></div>
    </Modal>
  );
}
