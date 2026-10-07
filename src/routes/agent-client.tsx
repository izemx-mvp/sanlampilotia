import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, CalendarClock, CreditCard, FileText, FileX, Info, Mail, MessageCircle, Phone, Eye, Check, UserPlus } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Avatar, Button, Card, Counter, PageHeader, PriorityBadge, Pulse, Select, StatusBadge } from "@/components/app/ui";
import { PostponeButton } from "@/components/app/actions";
import { useStore } from "@/lib/store";
import { CLIENT_STATUSES, OPERATORS, fmt, TODAY } from "@/lib/mock";
import { byPriority } from "@/lib/items";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/agent-client")({ head: pageHead("Agent IA Suivi Client", "Clients et prospects à relancer détectés automatiquement."), component: AgentClient });

const CATS = [
  { id: "Documents manquants", icon: FileX }, { id: "Règlements non payés", icon: CreditCard }, { id: "Devis en attente", icon: FileText },
  { id: "Prospects à relancer", icon: UserPlus }, { id: "Contrats arrivant à échéance", icon: CalendarClock }, { id: "Informations manquantes", icon: Info },
];

export function ClientFollowTable({ only }: { only?: "Client" | "Prospect" }) {
  const { clients, openClient, startCall, message, resolve } = useStore();
  const [cat, setCat] = useState(""); const [status, setStatus] = useState(""); const [op, setOp] = useState(""); const [q, setQ] = useState("");
  const rows = clients.filter((c) => (!only || c.type === only) && (!cat || c.category === cat) && (!status || c.status === status) && (!op || c.operator === op) && (!q || c.name.toLowerCase().includes(q.toLowerCase()))).sort(byPriority);
  return (
    <>
      {!only && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {CATS.map((c, i) => {
            const n = clients.filter((x) => x.category === c.id).length;
            return (
              <Card key={c.id} delay={i * 0.04} onClick={() => setCat(cat === c.id ? "" : c.id)} className={cn("cursor-pointer p-4 transition-all hover:-translate-y-0.5", cat === c.id && "border-primary/60 shadow-glow")}>
                <c.icon className="h-5 w-5 text-primary" /><p className="mt-2 font-display text-2xl font-semibold"><Counter to={n} /></p><p className="text-xs text-muted-foreground">{c.id}</p>
              </Card>
            );
          })}
        </div>
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client…" className="h-9 rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none" />
        <Select label="Motif" value={cat} onChange={setCat} options={CATS.map((c) => c.id)} />
        <Select label="Statut" value={status} onChange={setStatus} options={CLIENT_STATUSES} />
        <Select label="Opérateur" value={op} onChange={setOp} options={OPERATORS} />
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr>{["Client", "Téléphone", "Produit", "Motif de relance", "Dernière interaction", "Prochaine relance", "Priorité", "Opérateur", "Statut", ""].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i, 15) * 0.02 }} onClick={() => openClient(c.id)} className="cursor-pointer border-t border-border hover:bg-accent/30">
                <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={c.name} /><div><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{c.type} · {c.city}</p></div></div></td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{c.phone}</td>
                <td className="px-4 py-3">{c.product}</td>
                <td className="max-w-[220px] px-4 py-3"><p className="truncate">{c.reason}</p><p className="text-xs text-muted-foreground">{c.category}</p></td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{fmt(c.lastInteraction)}</td>
                <td className={cn("px-4 py-3 tabular-nums", c.nextFollow < TODAY && "text-destructive")}>{fmt(c.nextFollow)}</td>
                <td className="px-4 py-3"><PriorityBadge p={c.priority} /></td>
                <td className="px-4 py-3 text-muted-foreground">{c.operator}</td>
                <td className="px-4 py-3"><StatusBadge s={c.status} /></td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-1">
                    <Button size="icon" variant="soft" title="Appeler" onClick={() => startCall({ ref: c.id, who: c.name, role: "client", phone: c.phone })}><Phone className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="WhatsApp" onClick={() => message(c.id, "whatsapp", c.name)}><MessageCircle className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Email" onClick={() => message(c.id, "email", c.name)}><Mail className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" title="Voir fiche" onClick={() => openClient(c.id)}><Eye className="h-4 w-4" /></Button>
                    <PostponeButton refId={c.id} />
                    <Button size="icon" variant="success" title="Marquer comme résolu" onClick={() => resolve(c.id)}><Check className="h-4 w-4" /></Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

function AgentClient() {
  return (
    <Shell>
      <PageHeader title="Agent IA — Suivi Client" subtitle="Identifie automatiquement les clients et prospects nécessitant une relance.">
        <span className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success"><Pulse />Agent actif · 245 dossiers analysés</span>
        <Button variant="primary" size="sm"><Bot className="h-4 w-4" />Relancer l’analyse</Button>
      </PageHeader>
      <ClientFollowTable />
    </Shell>
  );
}
