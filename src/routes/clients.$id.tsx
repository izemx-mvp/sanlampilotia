import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Car, CheckCircle2, CreditCard, Download, Eye, FileText, Mail, MapPin, Plus, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Avatar, Badge, Btn, Card, NextDate, Phone, ProgressBar, Timeline, downloadMock } from "@/components/app/ui";
import { QuoteDialog, useDocViewer, useFollowDialog } from "@/components/app/dialogs";
import { PaymentModal } from "@/components/app/PaymentModal";
import { useStore } from "@/lib/store";
import { PAY_RESULTS, dh, fmt, fmtFull, payStatus, type TimelineEvent } from "@/lib/data";

export const Route = createFileRoute("/clients/$id")({
  head: ({ params }) => ({ meta: [{ title: `Fiche client ${params.id} — PilotIA` }, { name: "description", content: "Informations, devis, paiements, sinistres et timeline du client." }, { property: "og:title", content: `Fiche client ${params.id} — PilotIA` }, { property: "og:description", content: "Fiche client complète." }] }),
  component: ClientPage,
});

function Block({ title, icon: Icon, action, children, delay }: { title: string; icon: typeof UserRound; action?: ReactNode; children: ReactNode; delay?: number }) {
  return (
    <Card delay={delay} className="p-5">
      <div className="mb-4 flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary"><Icon className="h-4 w-4" /></span>{title}</h2>{action}</div>
      {children}
    </Card>
  );
}

function ClientPage() {
  const { id } = Route.useParams();
  const s = useStore();
  const [addQ, setAddQ] = useState(false);
  const [viewP, setViewP] = useState<string | null>(null);
  const [follow, followEl] = useFollowDialog();
  const [showDoc, docEl] = useDocViewer();
  const c = s.clients.find((x) => x.id === id);
  if (!c) return <Shell><p className="text-muted-foreground">Client introuvable. <Link to="/agent-client" className="text-primary">Retour</Link></p></Shell>;
  const quotes = s.quotes.filter((q) => q.clientId === id);
  const pays = s.payments.filter((p) => p.clientId === id);
  const claims = s.claims.filter((k) => k.clientId === id);
  const miss = s.missing.filter((m) => m.clientId === id);
  const events: TimelineEvent[] = [
    ...quotes.flatMap((q) => q.history.map((h) => ({ ...h, label: `${h.label.startsWith("Devis") ? "" : `Devis ${q.id} — `}${h.label}` }))),
    ...pays.flatMap((p) => p.timeline.map((t) => ({ ...t, label: `Paiement ${p.contract} — ${t.label}` }))),
    ...claims.flatMap((k) => k.history.map((h) => ({ ...h, label: `${k.id} — ${h.label}` }))),
  ];
  return (
    <Shell>
      <Link to="/agent-client" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="h-4 w-4" />Agent Suivi Client</Link>
      <Card className="relative mb-5 overflow-hidden p-6">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <Avatar name={c.name} size={64} />
          <div className="flex-1"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Client {c.id}</p><h1 className="text-3xl font-semibold">{c.name}</h1>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground"><span className="flex items-center gap-1.5"><Mail className="h-4 w-4" />{c.email}</span><span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{c.address}</span></div></div>
          <div className="rounded-2xl border border-primary/25 bg-accent px-5 py-3"><p className="text-xs font-semibold text-muted-foreground">Téléphone</p><Phone n={c.phone} className="text-lg" /></div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Block title="Informations" icon={UserRound} delay={0.05}>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[["Nom complet", c.name], ["Numéro client", c.id], ["Email", c.email], ["Ville", c.city], ["Adresse", c.address]].map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            <div><dt className="text-xs text-muted-foreground">Téléphone</dt><dd><Phone n={c.phone} /></dd></div>
          </dl>
          {miss.length > 0 && <div className="mt-4 space-y-2 border-t border-border pt-4"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Informations manquantes</p>
            {miss.map((m) => <div key={m.id} className="flex items-center justify-between gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm"><span>{m.info}</span>{m.status === "Complété" ? <Badge s="Complété" /> : <Btn size="sm" variant="success" onClick={() => { s.markReceived(m.id); toast.success("Marqué comme reçu"); }}><CheckCircle2 className="h-3.5 w-3.5" />Marquer comme reçu</Btn>}</div>)}
          </div>}
        </Block>

        <Block title="Devis" icon={FileText} delay={0.1} action={<Btn size="sm" variant="primary" onClick={() => setAddQ(true)}><Plus className="h-3.5 w-3.5" />Ajouter / uploader</Btn>}>
          {!quotes.length && <p className="text-sm text-muted-foreground">Aucun devis.</p>}
          <div className="space-y-2">{quotes.map((q) => { const lines = [`Devis ${q.id}`, `Client : ${c.name}`, `Produit : ${q.product}`, `Montant : ${dh(q.amount)}`, `Date : ${fmtFull(q.date)}`, `Statut : ${q.status}`]; return (
            <div key={q.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3">
              <FileText className="h-5 w-5 text-destructive" />
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{q.product} · {dh(q.amount)}</p><p className="text-xs text-muted-foreground">{q.id} · {fmt(q.date)} · relance <NextDate d={q.nextFollow} /></p></div>
              <Badge s={q.status} />
              <Btn size="icon" variant="ghost" title="Voir" onClick={() => showDoc({ name: q.doc, lines })}><Eye className="h-4 w-4" /></Btn>
              <Btn size="icon" variant="ghost" title="Télécharger" onClick={() => downloadMock(q.doc, lines)}><Download className="h-4 w-4" /></Btn>
            </div>); })}</div>
        </Block>

        <Block title="Paiements" icon={CreditCard} delay={0.15}>
          {!pays.length && <p className="text-sm text-muted-foreground">Aucun paiement suivi.</p>}
          <div className="space-y-2">{pays.map((p) => (
            <button type="button" key={p.id} onClick={() => setViewP(p.id)} className="w-full rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-accent/40">
              <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">{p.contract} · {dh(p.amount)}</span><Badge s={payStatus(p)} /></div>
              <ProgressBar value={(p.paid / p.amount) * 100} />
              <p className="mt-1.5 text-xs text-muted-foreground">Payé {dh(p.paid)} · Reste {dh(p.amount - p.paid)} · Échéance {fmt(p.due)}</p>
            </button>))}</div>
        </Block>

        <Block title="Sinistres" icon={Car} delay={0.2}>
          {!claims.length && <p className="text-sm text-muted-foreground">Aucun sinistre.</p>}
          <div className="space-y-2">{claims.map((k) => (
            <Link key={k.id} to="/sinistres/$id" params={{ id: k.id }} className="flex items-center gap-3 rounded-xl border border-border p-3 transition hover:border-primary/40 hover:bg-accent/40">
              <Car className="h-5 w-5 text-primary" /><div className="flex-1"><p className="text-sm font-semibold">{k.id}</p><p className="text-xs text-muted-foreground">{k.type} · {k.vehicle} {k.plate} · {fmt(k.date)}</p></div><Badge s={k.status} />
            </Link>))}</div>
        </Block>
      </div>

      <Card delay={0.25} className="mt-5 p-5"><h2 className="mb-4 text-lg font-semibold">Timeline du client</h2><Timeline events={events} /></Card>
      <QuoteDialog open={addQ} onClose={() => setAddQ(false)} clientId={id} />
      <PaymentModal id={viewP ?? undefined} onClose={() => setViewP(null)} onFollow={(pid) => follow({ title: "Relance paiement", subtitle: c.name, results: PAY_RESULTS, onSave: (f) => s.followPayment(pid, f) })} />
      {followEl}{docEl}
    </Shell>
  );
}
