import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Download, Eye, FileText, History, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Badge, Btn, Card, Field, Modal, NextDate, PageHeader, Phone, ProgressBar, RecoPanel, Sel, Table, Tabs, Timeline, downloadMock, inputCls, rowCls, td } from "@/components/app/ui";
import { ActionsTable } from "@/components/app/ActionsTable";
import { QuoteDialog, useDocViewer, useFollowDialog } from "@/components/app/dialogs";
import { PaymentModal } from "@/components/app/PaymentModal";
import { useStore } from "@/lib/store";
import { buildActions } from "@/lib/actions";
import { CITIES, MISSING_RESULTS, PAY_RESULTS, PAY_STATUSES, QUOTE_RESULTS, QUOTE_STATUSES, diffDays, dh, fmt, fmtFull, norm, payStatus, type Quote, type QuoteStatus } from "@/lib/data";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/agent-client")({
  validateSearch: (s: Record<string, unknown>): { tab?: string } => ({ tab: typeof s["tab"] === "string" ? (s["tab"] as string) : undefined }),
  head: pageHead("Agent IA — Suivi Client", "Devis, paiements et informations manquantes : les relances clients identifiées automatiquement."),
  component: AgentClient,
});

const matchDue = (d: Date | undefined, f: string) => !f || (!!d && (f === "Aujourd’hui" ? diffDays(d) === 0 : f === "En retard" ? diffDays(d) < 0 : diffDays(d) >= 0 && diffDays(d) <= 7));

function AgentClient() {
  const s = useStore();
  const nav = useNavigate();
  const { tab = "tous" } = Route.useSearch();
  const setTab = (t: string) => { setSt(""); nav({ to: "/agent-client", search: { tab: t }, replace: true }); };
  const [q, setQ] = useState(""); const [city, setCity] = useState(""); const [st, setSt] = useState(""); const [pr, setPr] = useState(""); const [due, setDue] = useState("");
  const [addQ, setAddQ] = useState(false);
  const [viewQ, setViewQ] = useState<string | null>(null);
  const [viewP, setViewP] = useState<string | null>(null);
  const [follow, followEl] = useFollowDialog();
  const [showDoc, docEl] = useDocViewer();
  const cm = useMemo(() => new Map(s.clients.map((c) => [c.id, c])), [s.clients]);
  const items = useMemo(() => buildActions(s).filter((i) => i.agent === "client"), [s.clients, s.quotes, s.payments, s.missing]); // eslint-disable-line react-hooks/exhaustive-deps
  const okClient = (id: string, extra = "") => { const c = cm.get(id); return !!c && (!city || c.city === city) && (!q || norm(c.name + c.phone + c.id + extra).includes(norm(q))); };

  const fItems = items.filter((i) => okClient(i.clientId) && (!st || i.status === st) && (!pr || i.priority === pr) && matchDue(i.next, due));
  const fQuotes = s.quotes.filter((x) => okClient(x.clientId, x.id) && (!st || x.status === st) && matchDue(x.nextFollow, due));
  const fPays = s.payments.filter((x) => okClient(x.clientId, x.contract) && (!st || payStatus(x) === st) && matchDue(x.nextFollow, due));
  const fMiss = s.missing.filter((x) => okClient(x.clientId, x.info) && (!st || x.status === st) && matchDue(x.nextFollow, due));
  const statusOpts = tab === "devis" ? QUOTE_STATUSES : tab === "paiements" ? PAY_STATUSES : tab === "infos" ? ["En attente", "Relancé", "Complété"] : [...new Set(items.map((i) => i.status))];

  const quoteLines = (x: Quote) => { const c = cm.get(x.clientId)!; return [`Devis ${x.id}`, `Client : ${c.name} (${c.id})`, `Telephone : ${c.phone}`, `Produit : ${x.product}`, `Date : ${fmtFull(x.date)}`, `Montant : ${dh(x.amount)}`, `Statut : ${x.status}`, s.cabinet.name]; };
  const ClientCell = ({ id }: { id: string }) => { const c = cm.get(id)!; return <Link to="/clients/$id" params={{ id }} onClick={(e) => e.stopPropagation()} className="font-semibold hover:text-primary">{c.name}<span className="block text-xs font-normal text-muted-foreground">{c.city}</span></Link>; };
  const vq = s.quotes.find((x) => x.id === viewQ);
  const vp = s.payments.find((x) => x.id === viewP);

  return (
    <Shell>
      <PageHeader eyebrow="Agent IA" title="Agent IA — Suivi Client" subtitle="L’agent analyse devis, paiements, documents et dernières interactions pour identifier les relances à faire." actions={<Btn variant="primary" onClick={() => setAddQ(true)}><Plus className="h-4 w-4" />Ajouter un devis</Btn>} />
      <RecoPanel title="Recommandations de l’Agent Suivi Client" recos={items.slice(0, 4).map((i) => ({ key: i.key, text: i.reco, urgent: i.priority === "Haute", onClick: () => nav({ to: "/clients/$id", params: { id: i.clientId } }) }))} />
      <div className="mt-5 mb-4"><Tabs id="ac-tabs" value={tab} onChange={setTab} tabs={[
        { id: "tous", label: "Tous", count: items.length },
        { id: "devis", label: "Devis", count: s.quotes.filter((x) => x.status === "Envoyé" || x.status === "En attente").length },
        { id: "paiements", label: "Paiements", count: s.payments.filter((x) => payStatus(x) !== "Payé").length },
        { id: "infos", label: "Informations manquantes", count: s.missing.filter((x) => x.status !== "Complété").length },
      ]} /></div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1 md:max-w-xs"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className={cn(inputCls, "pl-9")} placeholder="Nom, téléphone, n° client…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <Sel label="Ville" value={city} onChange={setCity} options={CITIES} />
        <Sel label="Statut" value={st} onChange={setSt} options={statusOpts} />
        {tab === "tous" && <Sel label="Priorité" value={pr} onChange={setPr} options={["Haute", "Moyenne", "Basse"]} />}
        <Sel label="Relance" value={due} onChange={setDue} options={["Aujourd’hui", "En retard", "7 prochains jours"]} />
      </div>

      <Card className="overflow-hidden">
        {tab === "tous" && <ActionsTable items={fItems} />}

        {tab === "devis" && (
          <Table head={["Client", "Téléphone", "N° devis", "Date devis", "Montant", "Statut", "Dernière relance", "Prochaine relance", "Document", ""]} empty={!fQuotes.length}>
            {fQuotes.map((x) => (
              <tr key={x.id} className={rowCls} onClick={() => setViewQ(x.id)}>
                <td className={td}><ClientCell id={x.clientId} /></td>
                <td className={td}><Phone n={cm.get(x.clientId)!.phone} /></td>
                <td className={cn(td, "font-mono text-xs")}>{x.id}<span className="block font-sans text-muted-foreground">{x.product}</span></td>
                <td className={td}>{fmt(x.date)}</td>
                <td className={cn(td, "whitespace-nowrap font-semibold")}>{dh(x.amount)}</td>
                <td className={td}><Badge s={x.status} /></td>
                <td className={td}>{fmt(x.lastFollow)}</td>
                <td className={td}><NextDate d={x.nextFollow} /></td>
                <td className={td}><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><FileText className="h-3.5 w-3.5 text-destructive" />PDF</span></td>
                <td className={td} onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Btn size="icon" variant="ghost" title="Voir" onClick={() => showDoc({ name: x.doc, lines: quoteLines(x) })}><Eye className="h-4 w-4" /></Btn>
                    <Btn size="icon" variant="ghost" title="Télécharger" onClick={() => downloadMock(x.doc, quoteLines(x))}><Download className="h-4 w-4" /></Btn>
                    <Btn size="sm" variant="soft" onClick={() => follow({ title: `Relance devis ${x.id}`, subtitle: cm.get(x.clientId)!.name, results: QUOTE_RESULTS, onSave: (f) => s.followQuote(x.id, f) })}><History className="h-3.5 w-3.5" />Relance</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}

        {tab === "paiements" && (
          <Table head={["Client", "Téléphone", "Contrat", "Montant", "Échéance", "Payé / Reste", "Statut", "Dernière relance", "Prochaine relance", ""]} empty={!fPays.length}>
            {fPays.map((x) => { const ps = payStatus(x); return (
              <tr key={x.id} className={rowCls} onClick={() => setViewP(x.id)}>
                <td className={td}><ClientCell id={x.clientId} /></td>
                <td className={td}><Phone n={cm.get(x.clientId)!.phone} /></td>
                <td className={cn(td, "font-mono text-xs")}>{x.contract}</td>
                <td className={cn(td, "whitespace-nowrap font-semibold")}>{dh(x.amount)}</td>
                <td className={cn(td, diffDays(x.due) < 0 && ps !== "Payé" && "font-semibold text-destructive")}>{fmt(x.due)}</td>
                <td className={cn(td, "min-w-[170px]")}><ProgressBar value={(x.paid / x.amount) * 100} /><p className="mt-1 text-xs"><span className="text-success">{dh(x.paid)}</span> · <span className="text-muted-foreground">reste {dh(x.amount - x.paid)}</span></p></td>
                <td className={td}><Badge s={ps} /></td>
                <td className={td}>{fmt(x.lastFollow)}</td>
                <td className={td}><NextDate d={x.nextFollow} /></td>
                <td className={td} onClick={(e) => e.stopPropagation()}>{ps !== "Payé" && <Btn size="sm" variant="soft" onClick={() => follow({ title: `Relance paiement ${x.contract}`, subtitle: cm.get(x.clientId)!.name, results: PAY_RESULTS, onSave: (f) => s.followPayment(x.id, f) })}><History className="h-3.5 w-3.5" />Relance</Btn>}</td>
              </tr>
            ); })}
          </Table>
        )}

        {tab === "infos" && (
          <Table head={["Client", "Téléphone", "Information manquante", "Depuis", "Dernière relance", "Prochaine relance", "Statut", ""]} empty={!fMiss.length}>
            {fMiss.map((x) => (
              <tr key={x.id} className={cn(x.status === "Complété" && "opacity-60")}>
                <td className={td}><ClientCell id={x.clientId} /></td>
                <td className={td}><Phone n={cm.get(x.clientId)!.phone} /></td>
                <td className={cn(td, "font-medium")}>{x.info}</td>
                <td className={td}>{-diffDays(x.since)} jours</td>
                <td className={td}>{fmt(x.lastFollow)}</td>
                <td className={td}><NextDate d={x.nextFollow} /></td>
                <td className={td}><Badge s={x.status} /></td>
                <td className={td}>{x.status !== "Complété" && <div className="flex gap-1">
                  <Btn size="sm" variant="ghost" onClick={() => follow({ title: `Relance : ${x.info}`, subtitle: cm.get(x.clientId)!.name, results: MISSING_RESULTS, onSave: (f) => s.followMissing(x.id, f) })}><History className="h-3.5 w-3.5" />Relance</Btn>
                  <Btn size="sm" variant="success" onClick={() => { s.markReceived(x.id); toast.success(`${x.info.replace(/ manquante?| incorrecte/, "")} reçu(e) — dossier complété`); }}><CheckCircle2 className="h-3.5 w-3.5" />Marquer comme reçu</Btn>
                </div>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <QuoteDialog open={addQ} onClose={() => setAddQ(false)} />
      <Modal open={!!vq} onClose={() => setViewQ(null)} title={`Devis ${vq?.id ?? ""}`} description={vq ? `${cm.get(vq.clientId)?.name} · ${vq.product}` : ""}>
        {vq && <>
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface-2 p-4 text-sm">
            <p><span className="text-muted-foreground">Montant</span><br /><b>{dh(vq.amount)}</b></p>
            <p><span className="text-muted-foreground">Date</span><br /><b>{fmtFull(vq.date)}</b></p>
            <p><span className="text-muted-foreground">Téléphone client</span><br /><Phone n={cm.get(vq.clientId)!.phone} /></p>
            <Field label="Statut"><select className={inputCls} value={vq.status} onChange={(e) => { s.setQuoteStatus(vq.id, e.target.value as QuoteStatus); toast.success("Statut mis à jour"); }}>{QUOTE_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
          </div>
          <Timeline events={vq.history} />
          <div className="flex flex-wrap justify-end gap-2">
            <Btn onClick={() => showDoc({ name: vq.doc, lines: quoteLines(vq) })}><Eye className="h-4 w-4" />Voir</Btn>
            <Btn onClick={() => downloadMock(vq.doc, quoteLines(vq))}><Download className="h-4 w-4" />Télécharger</Btn>
            <Btn variant="primary" onClick={() => follow({ title: `Relance devis ${vq.id}`, results: QUOTE_RESULTS, onSave: (f) => s.followQuote(vq.id, f) })}>Ajouter une relance</Btn>
          </div>
        </>}
      </Modal>
      <PaymentModal id={vp?.id} onClose={() => setViewP(null)} onFollow={(id) => follow({ title: "Relance paiement", results: PAY_RESULTS, onSave: (f) => s.followPayment(id, f) })} />
      {followEl}{docEl}
    </Shell>
  );
}
