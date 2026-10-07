import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Bot, CheckCircle2, Clock, CreditCard, FileX, Hourglass, PhoneCall, Sparkles as Spark, Users, Zap, Car, ExternalLink, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Card, Counter, Sparkline, PriorityBadge, Pulse, Button, Avatar, StatusBadge } from "@/components/app/ui";
import { PostponeButton } from "@/components/app/actions";
import { useStore } from "@/lib/store";
import { buildItems, byPriority, isDone } from "@/lib/items";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vue d’ensemble — PilotIA Assurance" },
      { name: "description", content: "Votre journée en 10 secondes : priorités, relances et activité des Agents IA." },
      { property: "og:title", content: "Vue d’ensemble — PilotIA Assurance" },
      { property: "og:description", content: "Cockpit opérationnel du cabinet d’assurances." },
    ],
  }),
  component: Dashboard,
});

const KPIS = [
  { label: "À traiter aujourd’hui", v: 23, delta: "+4 depuis hier", up: true, icon: Zap, to: "/taches", color: "var(--chart-1)", data: [12, 15, 14, 18, 17, 19, 23] },
  { label: "Relances clients", v: 12, delta: "+2 depuis hier", up: true, icon: Users, to: "/agent-client", color: "var(--chart-2)", data: [8, 9, 11, 10, 9, 10, 12] },
  { label: "Relances sinistres", v: 8, delta: "-12 % cette semaine", up: false, icon: Car, to: "/agent-sinistre", color: "var(--chart-2)", data: [11, 12, 10, 9, 10, 9, 8] },
  { label: "Documents manquants", v: 7, delta: "-2 depuis hier", up: false, icon: FileX, to: "/agent-client", color: "var(--chart-4)", data: [10, 9, 9, 8, 9, 9, 7] },
  { label: "Règlements en attente", v: 5, delta: "+1 depuis hier", up: true, icon: CreditCard, to: "/agent-client", color: "var(--chart-4)", data: [3, 4, 4, 3, 4, 4, 5] },
  { label: "Dossiers critiques", v: 3, delta: "stable", up: false, icon: AlertTriangle, to: "/suivi", color: "var(--chart-5)", data: [4, 3, 5, 4, 3, 3, 3] },
  { label: "Actions réalisées par l’IA", v: 38, delta: "+18 % cette semaine", up: true, icon: Bot, to: "/historique", color: "var(--chart-3)", data: [20, 24, 28, 27, 31, 35, 38] },
  { label: "Taux de dossiers à jour", v: 84, suffix: " %", delta: "+3 pts", up: true, icon: CheckCircle2, to: "/analytics", color: "var(--chart-3)", data: [76, 78, 79, 80, 82, 83, 84] },
] as const;

function Gauge({ value }: { value: number }) {
  const r = 70, c = Math.PI * r;
  return (
    <svg viewBox="0 0 180 100" className="w-full max-w-[220px]">
      <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stopColor="var(--chart-3)" /><stop offset="60%" stopColor="var(--chart-4)" /><stop offset="100%" stopColor="var(--chart-5)" /></linearGradient></defs>
      <path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="var(--muted)" strokeWidth="14" strokeLinecap="round" />
      <motion.path d="M20 90 A70 70 0 0 1 160 90" fill="none" stroke="url(#g)" strokeWidth="14" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.4, ease: "easeOut" }} />
      <text x="90" y="82" textAnchor="middle" className="fill-foreground font-display text-[28px] font-semibold">{value}%</text>
    </svg>
  );
}

function AgentCard({ name, lines, tone }: { name: string; lines: string[]; tone: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 2600); return () => clearInterval(t); }, []);
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5"><span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}><Bot className="h-5 w-5" /></span><p className="font-semibold">{name}</p></div>
        <span className="flex items-center gap-2 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success"><Pulse />ACTIF</span>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {lines.map((l, i) => (
          <motion.li key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.15 }} className={cn("flex items-center gap-2", i === tick % lines.length ? "text-foreground" : "text-muted-foreground")}>
            <Spark className={cn("h-3.5 w-3.5", i === tick % lines.length ? "text-primary" : "opacity-40")} />{l}
          </motion.li>
        ))}
      </ul>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted"><motion.div className="h-full w-1/3 bg-gradient-primary" animate={{ x: ["-100%", "300%"] }} transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }} /></div>
    </div>
  );
}

function Dashboard() {
  const { clients, claims, startCall, openClient, resolve } = useStore();
  const nav = useNavigate();
  const priorities = buildItems(clients, claims).filter((i) => !isDone(i.status) && (i.priority === "critique" || i.priority === "haute")).sort(byPriority).slice(0, 7);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  return (
    <Shell>
      <div className="mb-6">
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold md:text-4xl">Bonjour Salma 👋</motion.h1>
        <p className="mt-1 text-muted-foreground">Voici les dossiers qui nécessitent votre attention aujourd’hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <Link key={k.label} to={k.to}>
            <Card delay={i * 0.04} className="group h-full p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40">
              <div className="flex items-center justify-between"><p className="text-xs text-muted-foreground">{k.label}</p><k.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" /></div>
              <p className="mt-2 font-display text-3xl font-semibold"><Counter to={k.v} suffix={"suffix" in k ? k.suffix : ""} /></p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className={cn("flex items-center gap-0.5 text-xs", k.up ? "text-success" : "text-muted-foreground")}>{k.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{k.delta}</span>
                <div className="w-20"><Sparkline data={[...k.data]} color={k.color} /></div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Card delay={0.2} className="p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Command Center</h2><span className="text-xs text-muted-foreground">Mis à jour en continu</span></div>
          <div className="grid items-center gap-5 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Urgent", v: 3, s: "dossiers critiques", icon: AlertTriangle, t: "text-destructive bg-destructive/10 border-destructive/25" },
                { l: "À traiter aujourd’hui", v: 18, s: "actions", icon: Clock, t: "text-primary bg-primary/10 border-primary/25" },
                { l: "En attente externe", v: 11, s: "dossiers", icon: Hourglass, t: "text-warning bg-warning/10 border-warning/25" },
                { l: "Géré automatiquement", v: 27, s: "actions IA", icon: Bot, t: "text-success bg-success/10 border-success/25" },
              ].map((x) => (
                <motion.div whileHover={{ scale: 1.02 }} key={x.l} className={cn("rounded-2xl border p-4", x.t)}>
                  <x.icon className="h-4 w-4" /><p className="mt-2 font-display text-2xl font-semibold text-foreground"><Counter to={x.v} /> <span className="text-sm font-normal text-muted-foreground">{x.s}</span></p><p className="text-xs">{x.l}</p>
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col items-center"><Gauge value={67} /><p className="text-sm text-muted-foreground">Charge opérationnelle aujourd’hui</p></div>
          </div>
        </Card>
        <Card delay={0.25} className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Activité des Agents IA</h2>
          <div className="space-y-3">
            <AgentCard name="Agent Suivi Client" tone="bg-primary/15 text-primary" lines={["Analyse de 245 dossiers clients", "12 relances détectées", "7 documents manquants"]} />
            <AgentCard name="Agent Suivi Sinistre" tone="bg-cyan/15 text-cyan" lines={["Analyse de 86 sinistres", "8 relances nécessaires", "3 dossiers prioritaires"]} />
          </div>
        </Card>
      </div>

      <Card delay={0.3} className="mt-5 overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3"><div><h2 className="text-lg font-semibold">Priorités du jour</h2><p className="text-sm text-muted-foreground">Quoi, pourquoi, qui contacter, et l’action à faire maintenant.</p></div><Link to="/suivi"><Button size="sm" variant="ghost">Tout voir →</Button></Link></div>
        <div className="divide-y divide-border">
          {loading ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="flex gap-4 px-5 py-4"><div className="skeleton h-6 w-20" /><div className="skeleton h-6 flex-1" /><div className="skeleton h-6 w-40" /></div>) :
            priorities.map((i, idx) => (
              <motion.div key={i.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="grid items-center gap-3 px-5 py-4 transition-colors hover:bg-accent/25 lg:grid-cols-[100px_1.3fr_1.4fr_1.2fr_auto]">
                <PriorityBadge p={i.priority} />
                <div className="flex items-center gap-3"><Avatar name={i.client} /><div><p className="font-medium">{i.client}</p><p className="text-xs text-muted-foreground">{i.id} · {i.type}</p></div></div>
                <div><p className="text-sm">{i.issue}</p><p className="text-xs text-muted-foreground">Depuis {i.age} j · {i.operator} · <StatusBadge s={i.status} /></p></div>
                <div><p className="text-xs text-muted-foreground">Prochaine action</p><p className="text-sm font-medium text-primary">{i.nextAction}</p><p className="text-xs text-muted-foreground">→ {i.contact.who}</p></div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="sm" variant="primary" onClick={() => startCall({ ref: i.id, ...i.contact })}><PhoneCall className="h-3.5 w-3.5" />Traiter</Button>
                  <PostponeButton refId={i.id} />
                  <Button size="sm" variant="ghost" onClick={() => (i.kind === "Client" ? openClient(i.id) : nav({ to: "/sinistres/$id", params: { id: i.id } }))}><ExternalLink className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="success" onClick={() => resolve(i.id)}><Check className="h-3.5 w-3.5" /></Button>
                </div>
              </motion.div>
            ))}
        </div>
      </Card>
    </Shell>
  );
}
