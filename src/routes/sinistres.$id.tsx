import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Car, Download, Eye, FileText, FolderOpen, History, Plus, Repeat, UserRound, UserRoundCheck, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Badge, Btn, Card, Field, Modal, NextDate, Phone, Prio, Table, Timeline, downloadMock, inputCls, td } from "@/components/app/ui";
import { FilePick, PartnerRecos, useDocViewer, useFollowDialog } from "@/components/app/dialogs";
import { useStore } from "@/lib/store";
import { claimPriority } from "@/lib/actions";
import { CLAIM_STATUSES, DOC_CATEGORIES, EXPERT_RESULTS, GARAGE_RESULTS, TODAY, dh, fmt, fmtFull, fromInput, toInput, type ClaimStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sinistres/$id")({
  head: ({ params }) => ({ meta: [{ title: `Sinistre ${params.id} — PilotIA` }, { name: "description", content: "Fiche sinistre : client, véhicule, expert, garage, documents et historique." }, { property: "og:title", content: `Sinistre ${params.id} — PilotIA` }, { property: "og:description", content: "Fiche sinistre détaillée." }] }),
  component: ClaimPage,
});

function Block({ title, icon: Icon, action, children, className }: { title: string; icon: typeof Car; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-4 w-4" /></span>{title}</h2>{action}</div>
      {children}
    </Card>
  );
}
const Row = ({ k, children }: { k: string; children: ReactNode }) => <div className="flex items-start justify-between gap-3 py-1.5 text-sm"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{children}</dd></div>;

function ClaimPage() {
  const { id } = Route.useParams();
  const s = useStore();
  const [follow, followEl] = useFollowDialog();
  const [showDoc, docEl] = useDocViewer();
  const [change, setChange] = useState<"" | "expert" | "garage">("");
  const [gq, setGq] = useState<{ amount: string; date: string; doc: string } | null>(null);
  const [doc, setDoc] = useState<{ category: string; name: string } | null>(null);
  const c = s.claims.find((x) => x.id === id);
  if (!c) return <Shell><p className="text-muted-foreground">Sinistre introuvable. <Link to="/agent-sinistre" className="text-primary">Retour</Link></p></Shell>;
  const client = s.clients.find((x) => x.id === c.clientId)!;
  const ex = s.experts.find((x) => x.id === c.expertId);
  const ga = s.garages.find((x) => x.id === c.garageId);
  const docLines = (name: string, cat: string) => [name, `Sinistre : ${c.id}`, `Client : ${client.name}`, `Vehicule : ${c.vehicle} ${c.plate}`, `Categorie : ${cat}`, s.cabinet.name];

  return (
    <Shell>
      <Link to="/agent-sinistre" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Agent Sinistre</Link>
      <Card className="relative mb-5 overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Numéro sinistre</p>
            <h1 className="font-mono text-3xl font-semibold">{c.id}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span><span className="text-muted-foreground">Client </span><Link to="/clients/$id" params={{ id: client.id }} className="font-semibold hover:text-primary">{client.name}</Link></span>
              <span><span className="text-muted-foreground">Date </span><b>{fmtFull(c.date)}</b></span>
              <span><span className="text-muted-foreground">Ville </span><b>{c.city}</b></span>
              <span className="flex items-center gap-2"><span className="text-muted-foreground">Priorité</span><Prio p={claimPriority(c)} /></span>
            </div>
          </div>
          <Field label="Statut" className="w-56"><select className={inputCls} value={c.status} onChange={(e) => { s.updateClaim(c.id, { status: e.target.value as ClaimStatus }, `Statut modifié : ${e.target.value}`); toast.success("Statut mis à jour"); }}>{CLAIM_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
        </div>
        <div className="relative mt-5 flex gap-1">{CLAIM_STATUSES.map((x, i) => <div key={x} title={x} className={cn("h-1.5 flex-1 rounded-full", i <= CLAIM_STATUSES.indexOf(c.status) ? "bg-gradient-primary" : "bg-muted")} />)}</div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block title="Informations client" icon={UserRound}>
          <dl className="divide-y divide-border"><Row k="Nom">{client.name}</Row><Row k="Téléphone"><Phone n={client.phone} /></Row><Row k="Email">{client.email}</Row><Row k="Ville">{client.city}</Row><Row k="Contrat">{c.contract}</Row></dl>
        </Block>
        <Block title="Informations véhicule" icon={Car}>
          <dl className="divide-y divide-border"><Row k="Véhicule">{c.vehicle}</Row><Row k="Immatriculation"><span className="font-mono">{c.plate}</span></Row><Row k="Type de sinistre">{c.type}</Row><Row k="Description">{c.description || "—"}</Row></dl>
        </Block>

        <Block title="Expert" icon={UserRoundCheck} action={ex && <div className="flex gap-1"><Btn size="sm" variant="ghost" onClick={() => setChange(change === "expert" ? "" : "expert")}><Repeat className="h-3.5 w-3.5" />Changer</Btn><Btn size="sm" variant="primary" onClick={() => follow({ title: "Ajouter une relance expert", subtitle: ex.cabinet, results: EXPERT_RESULTS, onSave: (f) => s.followPartner(c.id, "expert", f) })}><History className="h-3.5 w-3.5" />Ajouter une relance</Btn></div>}>
          {ex && change !== "expert" ? <>
            <dl className="divide-y divide-border">
              <Row k="Expert"><Link to="/experts/$id" params={{ id: ex.id }} className="hover:text-primary">{ex.cabinet}</Link><span className="block text-xs font-normal text-muted-foreground">{ex.name}</span></Row>
              <Row k="Téléphone"><Phone n={ex.phone} /></Row><Row k="Email">{ex.email}</Row><Row k="Ville">{ex.city}</Row>
              <Row k="Dernière relance">{fmtFull(c.expertLast)}</Row><Row k="Prochaine relance"><NextDate d={c.expertNext} /></Row><Row k="Statut"><Badge s={c.expertStatus} /></Row>
            </dl>
            {c.expertFollows.length > 0 && <FollowList list={c.expertFollows} />}
          </> : <><p className="mb-3 text-sm text-muted-foreground">Experts recommandés à {c.city} :</p><PartnerRecos kind="expert" city={c.city} selected={c.expertId} onPick={(pid) => { s.assign(c.id, "expert", pid); setChange(""); toast.success("Expert affecté"); }} /></>}
        </Block>

        <Block title="Garage" icon={Wrench} action={ga && <div className="flex gap-1"><Btn size="sm" variant="ghost" onClick={() => setChange(change === "garage" ? "" : "garage")}><Repeat className="h-3.5 w-3.5" />Changer</Btn><Btn size="sm" variant="primary" onClick={() => follow({ title: "Ajouter une relance garage", subtitle: ga.name, results: GARAGE_RESULTS, onSave: (f) => s.followPartner(c.id, "garage", f) })}><History className="h-3.5 w-3.5" />Ajouter une relance</Btn></div>}>
          {ga && change !== "garage" ? <>
            <dl className="divide-y divide-border">
              <Row k="Garage"><Link to="/garages/$id" params={{ id: ga.id }} className="hover:text-primary">{ga.name}</Link><span className="block text-xs font-normal text-muted-foreground">{ga.contact}</span></Row>
              <Row k="Téléphone"><Phone n={ga.phone} /></Row><Row k="Ville">{ga.city}</Row><Row k="Adresse">{ga.address}</Row>
              <Row k="Dernière relance">{fmtFull(c.garageLast)}</Row><Row k="Prochaine relance"><NextDate d={c.garageNext} /></Row><Row k="Statut"><Badge s={c.garageStatus} /></Row>
            </dl>
            {c.garageFollows.length > 0 && <FollowList list={c.garageFollows} />}
          </> : <><p className="mb-3 text-sm text-muted-foreground">Garages recommandés à {c.city} :</p><PartnerRecos kind="garage" city={c.city} selected={c.garageId} onPick={(pid) => { s.assign(c.id, "garage", pid); setChange(""); toast.success("Garage affecté"); }} /></>}
        </Block>
      </div>

      <Block className="mt-5" title="Devis Garage" icon={FileText} action={<Btn size="sm" variant="primary" disabled={!ga} onClick={() => setGq({ amount: "", date: toInput(TODAY), doc: "" })}><Plus className="h-3.5 w-3.5" />Ajouter un devis</Btn>}>
        {!ga ? <p className="text-sm text-muted-foreground">Affectez d’abord un garage.</p> : !c.garageQuotes.length ? <p className="text-sm text-warning">Aucun devis garage n’a encore été ajouté au dossier.</p> : (
          <Table head={["Garage", "Date devis", "Montant", "Statut", "Document", ""]}>
            {c.garageQuotes.map((q) => { const g = s.garages.find((x) => x.id === q.garageId); const lines = [`Devis garage`, `Garage : ${g?.name}`, `Sinistre : ${c.id}`, `Vehicule : ${c.vehicle} ${c.plate}`, `Montant : ${dh(q.amount)}`, `Date : ${fmtFull(q.date)}`]; return (
              <tr key={q.id}>
                <td className={cn(td, "font-semibold")}>{g?.name}</td><td className={td}>{fmt(q.date)}</td><td className={cn(td, "font-semibold")}>{dh(q.amount)}</td><td className={td}><Badge s={q.status} /></td>
                <td className={cn(td, "text-xs text-muted-foreground")}>{q.doc}</td>
                <td className={td}><div className="flex justify-end gap-1">
                  <Btn size="sm" variant="ghost" onClick={() => showDoc({ name: q.doc, lines })}><Eye className="h-3.5 w-3.5" />Voir</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => downloadMock(q.doc, lines)}><Download className="h-3.5 w-3.5" />Télécharger</Btn>
                  {q.status === "Reçu" && <><Btn size="sm" variant="success" onClick={() => { s.setGarageQuoteStatus(c.id, q.id, "Validé"); toast.success("Devis validé — réparation lancée"); }}>Valider</Btn><Btn size="sm" variant="danger" onClick={() => s.setGarageQuoteStatus(c.id, q.id, "Refusé")}>Refuser</Btn></>}
                </div></td>
              </tr>); })}
          </Table>
        )}
      </Block>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Block title="Documents" icon={FolderOpen} action={<Btn size="sm" variant="primary" onClick={() => setDoc({ category: DOC_CATEGORIES[0], name: "" })}><Plus className="h-3.5 w-3.5" />Ajouter un document</Btn>}>
          <div className="space-y-3">
            {DOC_CATEGORIES.map((cat) => { const list = c.docs.filter((d) => d.category === cat); return (
              <div key={cat}>
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{cat}{!list.length && <span className="font-normal normal-case text-warning">· manquant</span>}</p>
                {list.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2 text-sm">
                    <FileText className="h-4 w-4 text-primary" /><span className="flex-1 truncate font-medium">{d.name}</span><span className="hidden text-xs text-muted-foreground sm:inline">{d.category} · ajouté le {fmt(d.date)}</span>
                    <Btn size="icon" variant="ghost" title="Voir" onClick={() => showDoc({ name: d.name, lines: docLines(d.name, d.category) })}><Eye className="h-4 w-4" /></Btn>
                    <Btn size="sm" variant="soft" onClick={() => downloadMock(d.name, docLines(d.name, d.category))}><Download className="h-3.5 w-3.5" />Télécharger</Btn>
                  </div>))}
              </div>); })}
          </div>
        </Block>
        <Block title="Historique" icon={History}><Timeline events={c.history} /></Block>
      </div>

      <Modal open={!!gq} onClose={() => setGq(null)} title="Ajouter un devis garage" description={ga?.name}>
        {gq && <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Montant (DH)"><input type="number" className={inputCls} value={gq.amount} onChange={(e) => setGq({ ...gq, amount: e.target.value })} /></Field>
          <Field label="Date du devis"><input type="date" className={inputCls} value={gq.date} onChange={(e) => setGq({ ...gq, date: e.target.value })} /></Field>
          <Field label="Document PDF" className="sm:col-span-2"><FilePick accept=".pdf" value={gq.doc} onPick={(n) => setGq({ ...gq, doc: n[0] ?? "" })} /></Field>
        </div>}
        <div className="flex justify-end gap-2"><Btn onClick={() => setGq(null)}>Annuler</Btn><Btn variant="primary" onClick={() => { if (!gq || !Number(gq.amount)) return toast.error("Montant obligatoire"); s.addGarageQuote(c.id, { amount: Number(gq.amount), date: fromInput(gq.date) ?? TODAY, doc: gq.doc || `devis-garage-${c.id}.pdf` }); toast.success("Devis garage ajouté"); setGq(null); }}>Ajouter</Btn></div>
      </Modal>
      <Modal open={!!doc} onClose={() => setDoc(null)} title="Ajouter un document">
        {doc && <div className="grid gap-3">
          <Field label="Catégorie"><select className={inputCls} value={doc.category} onChange={(e) => setDoc({ ...doc, category: e.target.value })}>{DOC_CATEGORIES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Fichier"><FilePick value={doc.name} onPick={(n) => setDoc({ ...doc, name: n[0] ?? "" })} /></Field>
        </div>}
        <div className="flex justify-end gap-2"><Btn onClick={() => setDoc(null)}>Annuler</Btn><Btn variant="primary" onClick={() => { if (!doc?.name) return toast.error("Choisissez un fichier"); s.addDoc(c.id, doc); toast.success("Document ajouté"); setDoc(null); }}>Ajouter</Btn></div>
      </Modal>
      {followEl}{docEl}
    </Shell>
  );
}

function FollowList({ list }: { list: { date: Date; result: string; comment: string }[] }) {
  return (
    <div className="mt-3 space-y-1.5 border-t border-border pt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Relances</p>
      {[...list].reverse().slice(0, 4).map((f, i) => <p key={i} className="text-sm"><span className="font-mono text-xs text-muted-foreground">{fmt(f.date)}</span> · <b>{f.result}</b>{f.comment && <span className="text-muted-foreground"> — {f.comment}</span>}</p>)}
    </div>
  );
}
