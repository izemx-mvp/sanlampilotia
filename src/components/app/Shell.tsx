import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, BarChart3, Bell, Bot, Car, ChevronsLeft, ClipboardList, History, LayoutDashboard, Radar, Search, Settings, ShieldCheck, Users, Wrench, X, FileWarning, Trash2, Check, Send, ExternalLink,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { daysSince, fmt } from "@/lib/mock";
import { Avatar, Button, PriorityBadge, StatusBadge, Pulse } from "./ui";
import { CallModal, PostponeButton } from "./actions";

const NAV = [
  { to: "/", label: "Vue d’ensemble", icon: LayoutDashboard },
  { to: "/suivi", label: "Centre de suivi", icon: Radar },
  { to: "/clients", label: "Clients & Prospects", icon: Users },
  { to: "/sinistres", label: "Sinistres", icon: Car },
  { to: "/taches", label: "Tâches & Relances", icon: ClipboardList },
  { to: "/agent-client", label: "Agent IA Suivi Client", icon: Bot },
  { to: "/agent-sinistre", label: "Agent IA Suivi Sinistre", icon: Bot },
  { to: "/intervenants", label: "Intervenants", icon: Wrench },
  { to: "/historique", label: "Historique", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/parametres", label: "Paramètres", icon: Settings },
] as const;

export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="animate-blob absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-[120px]" />
      <div className="animate-blob absolute right-[-120px] top-1/3 h-[460px] w-[460px] rounded-full bg-cyan/10 blur-[120px] [animation-delay:-9s]" />
      <div className="animate-blob absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-info/10 blur-[130px] [animation-delay:-18s]" />
    </div>
  );
}

function Sidebar() {
  const { collapsed, setCollapsed, notifs } = useStore();
  const loc = useLocation();
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <motion.aside animate={{ width: collapsed ? 76 : 264 }} transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      className="glass sticky top-0 z-30 hidden h-screen shrink-0 flex-col rounded-none border-y-0 border-l-0 md:flex">
      <div className="flex h-16 items-center gap-3 px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow"><ShieldCheck className="h-5 w-5 text-primary-foreground" /></div>
        {!collapsed && <div className="leading-tight"><p className="font-display font-semibold">Pilot<span className="text-gradient">IA</span></p><p className="text-[10px] uppercase tracking-widest text-muted-foreground">Assurance · Sanlam</p></div>}
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {NAV.map((n) => {
          const active = n.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} title={n.label} className={cn("relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors", active ? "text-foreground" : "text-muted-foreground hover:bg-accent/40 hover:text-foreground")}>
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl border border-primary/30 bg-primary/15" />}
              <n.icon className={cn("relative h-[18px] w-[18px] shrink-0", active && "text-primary")} />
              {!collapsed && <span className="relative truncate">{n.label}</span>}
              {n.to === "/notifications" && unread > 0 && <span className={cn("relative ml-auto rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground", collapsed && "absolute right-1 top-1")}>{unread}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3">
        {!collapsed && (
          <div className="mb-3 rounded-xl border border-border bg-surface-2 p-3 text-xs">
            <div className="flex items-center gap-2 font-medium"><Pulse />2 agents IA actifs</div>
            <p className="mt-1 text-muted-foreground">Dernière analyse il y a 2 min</p>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="flex h-9 w-full items-center justify-center gap-2 rounded-xl text-sm text-muted-foreground hover:bg-accent/40">
          <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />{!collapsed && "Réduire"}
        </button>
      </div>
    </motion.aside>
  );
}

function GlobalSearch() {
  const { clients, claims, tasks, history, openClient } = useStore();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); inputRef.current?.focus(); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const res = useMemo(() => {
    const s = q.trim().toLowerCase(); if (s.length < 2) return null;
    const m = (x: string) => x.toLowerCase().includes(s);
    return {
      clients: clients.filter((c) => m(c.name) || m(c.phone) || m(c.id)).slice(0, 4),
      claims: claims.filter((c) => m(c.client) || m(c.id) || m(c.plate) || m(c.vehicle)).slice(0, 4),
      tasks: tasks.filter((t) => m(t.client) || m(t.ref)).slice(0, 3),
      history: history.filter((h) => m(h.ref) || m(h.label)).slice(0, 3),
    };
  }, [q, clients, claims, tasks, history]);
  const empty = res && !res.clients.length && !res.claims.length && !res.tasks.length;
  return (
    <div className="relative w-full max-w-xl">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 180)}
        placeholder="Client, n° sinistre, immatriculation, téléphone, expert…" className="h-11 w-full rounded-xl border border-border bg-surface-2 pl-10 pr-14 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring" />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border px-1.5 text-[10px] text-muted-foreground">⌘K</kbd>
      <AnimatePresence>
        {open && res && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-glow">
            {empty && <p className="p-4 text-center text-sm text-muted-foreground">Aucun résultat pour « {q} »</p>}
            {res.clients.length > 0 && <Group label="Clients & contrats">{res.clients.map((c) => (
              <Row key={c.id} onClick={() => openClient(c.id)}><Avatar name={c.name} size={26} /><span className="flex-1">{c.name}<span className="ml-2 text-xs text-muted-foreground">{c.type} · {c.contracts} contrat(s) · {c.product}</span></span><PriorityBadge p={c.priority} /></Row>))}</Group>}
            {res.claims.length > 0 && <Group label="Sinistres">{res.claims.map((c) => (
              <Row key={c.id} onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })}><Car className="h-4 w-4 text-cyan" /><span className="flex-1">{c.id} · {c.client}<span className="ml-2 text-xs text-muted-foreground">{c.vehicle} {c.plate}</span></span><StatusBadge s={c.stage} /></Row>))}</Group>}
            {res.tasks.length > 0 && <Group label="Tâches">{res.tasks.map((t) => <Row key={t.id} onClick={() => nav({ to: "/taches" })}><ClipboardList className="h-4 w-4 text-warning" /><span className="flex-1">{t.action}<span className="ml-2 text-xs text-muted-foreground">{t.client} · {fmt(t.due)}</span></span></Row>)}</Group>}
            {res.history.length > 0 && <Group label="Historique">{res.history.map((h) => <Row key={h.id} onClick={() => nav({ to: "/historique" })}><History className="h-4 w-4 text-muted-foreground" /><span className="flex-1">{h.label}<span className="ml-2 text-xs text-muted-foreground">{h.ref} · {fmt(h.date)}</span></span></Row>)}</Group>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
const Group = ({ label, children }: { label: string; children: ReactNode }) => <div className="mb-1"><p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>{children}</div>;
const Row = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => <button onMouseDown={onClick} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-accent">{children}</button>;

function Topbar() {
  const { notifs, setNotifOpen } = useStore();
  const [period, setPeriod] = useState("Aujourd’hui");
  const unread = notifs.filter((n) => !n.read).length;
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/60 px-4 backdrop-blur-xl md:px-8">
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-2">
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="hidden h-10 rounded-xl border border-border bg-surface-2 px-3 text-sm lg:block">
          {["Aujourd’hui", "Cette semaine", "Ce mois"].map((p) => <option key={p} className="bg-card">{p}</option>)}
        </select>
        <Button size="icon" variant="outline" className="relative" onClick={() => setNotifOpen(true)}>
          <Bell className="h-4 w-4" />
          {unread > 0 && <motion.span key={unread} initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{unread}</motion.span>}
        </Button>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 py-1 pl-1 pr-3">
          <Avatar name="Salma Idrissi" size={30} /><div className="hidden text-xs leading-tight sm:block"><p className="font-semibold">Salma Idrissi</p><p className="text-muted-foreground">Opératrice</p></div>
        </div>
      </div>
    </header>
  );
}

export function NotificationList({ compact }: { compact?: boolean }) {
  const { notifs, setNotifs, setNotifOpen, openClient, clients } = useStore();
  const nav = useNavigate();
  const openRef = (ref: string) => {
    setNotifOpen(false);
    if (ref.startsWith("SIN")) nav({ to: "/sinistres/$id", params: { id: ref } });
    else if (ref.startsWith("CLI") && clients.some((c) => c.id === ref)) openClient(ref);
    else if (ref.startsWith("GAR")) nav({ to: "/intervenants" });
    else nav({ to: "/suivi" });
  };
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {notifs.map((n) => (
          <motion.div key={n.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0 }}
            className={cn("rounded-xl border p-3", n.read ? "border-border bg-transparent opacity-70" : "border-primary/25 bg-primary/5")}>
            <div className="flex items-start gap-3">
              <FileWarning className={cn("mt-0.5 h-4 w-4 shrink-0", n.level === "critique" ? "text-destructive" : n.level === "haute" ? "text-warning" : "text-info")} />
              <div className="flex-1"><p className="text-sm">{n.text}</p><p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p></div>
              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary" />}
            </div>
            <div className={cn("mt-2 flex flex-wrap gap-1", compact ? "" : "pl-7")}>
              <Button size="sm" variant="soft" onClick={() => openRef(n.ref)}><ExternalLink className="h-3 w-3" />Ouvrir</Button>
              <Button size="sm" variant="ghost" onClick={() => { setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, read: true } : x))); openRef(n.ref); }}>Traiter</Button>
              {!n.read && <Button size="sm" variant="ghost" onClick={() => setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}><Check className="h-3 w-3" />Lu</Button>}
              <Button size="sm" variant="ghost" onClick={() => setNotifs((ns) => ns.filter((x) => x.id !== n.id))}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {notifs.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Aucune notification 🎉</p>}
    </div>
  );
}

function SidePanel({ open, onClose, title, children, width = "max-w-md" }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; width?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60] bg-background/50 backdrop-blur-[2px]" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn("fixed bottom-0 right-0 top-0 z-[70] flex w-full flex-col border-l border-border bg-card/95 backdrop-blur-xl", width)}>
            <div className="flex h-16 items-center justify-between border-b border-border px-5"><div className="font-display font-semibold">{title}</div><Button size="icon" variant="ghost" onClick={onClose}><X className="h-4 w-4" /></Button></div>
            <div className="flex-1 overflow-y-auto p-5">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function ClientDrawer() {
  const { drawerClient, openClient, clients, startCall, message, addNote, resolve } = useStore();
  const c = clients.find((x) => x.id === drawerClient);
  const [note, setNote] = useState("");
  return (
    <SidePanel open={!!c} onClose={() => openClient(null)} title="Fiche client" width="max-w-xl">
      {c && (
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <Avatar name={c.name} size={56} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <p className="text-sm text-muted-foreground">{c.phone} · {c.email}</p>
              <div className="mt-2 flex flex-wrap gap-2"><StatusBadge s={c.type} /><StatusBadge s={c.status} /><PriorityBadge p={c.priority} /></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[["Contrats actifs", c.contracts], ["Score de suivi", `${c.score}/100`], ["Produit", c.product]].map(([l, v]) => (
              <div key={l as string} className="rounded-xl border border-border bg-surface-2 p-3"><p className="text-[11px] text-muted-foreground">{l}</p><p className="mt-1 text-sm font-semibold">{v}</p></div>
            ))}
          </div>
          <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-warning">Pourquoi ce dossier nécessite une action ?</p>
            <p className="mt-1 text-sm">{c.why}</p>
          </div>
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><Bot className="h-3.5 w-3.5" />Action recommandée par l’IA</p>
            <p className="mt-1 text-sm">{c.recommendation}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" onClick={() => startCall({ ref: c.id, who: c.name, role: "client", phone: c.phone })}>Lancer l’appel</Button>
            <Button size="sm" onClick={() => message(c.id, "whatsapp", c.name)}>Envoyer WhatsApp</Button>
            <Button size="sm" onClick={() => message(c.id, "email", c.name)}>Envoyer email</Button>
            <PostponeButton refId={c.id} />
            <Button size="sm" variant="success" onClick={() => resolve(c.id)}>Clôturer</Button>
          </div>
          <div className="flex gap-2">
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…" className="h-9 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none" />
            <Button size="sm" variant="soft" disabled={!note} onClick={() => { addNote(c.id, note); setNote(""); }}>Ajouter note</Button>
          </div>
          <Timeline events={c.timeline} />
        </div>
      )}
    </SidePanel>
  );
}

export function Timeline({ events }: { events: { date: Date; label: string; kind: string }[] }) {
  const tone: Record<string, string> = { alert: "bg-destructive", ai: "bg-primary", call: "bg-cyan", doc: "bg-success", status: "bg-info", email: "bg-warning", whatsapp: "bg-success", note: "bg-muted-foreground" };
  return (
    <div>
      <p className="mb-3 text-sm font-semibold">Timeline</p>
      <ol className="relative ml-2 border-l border-border">
        {[...events].reverse().map((e, i) => (
          <motion.li key={i + e.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="mb-4 ml-5">
            <span className={cn("absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-card", tone[e.kind] ?? "bg-primary")} />
            <p className="text-xs text-muted-foreground">{fmt(e.date)}</p><p className="text-sm">{e.label}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

const SUGGESTIONS = [
  "Quels dossiers dois-je traiter aujourd’hui ?", "Quels sinistres sont bloqués chez un expert ?", "Quels clients n’ont pas encore envoyé leurs documents ?",
  "Quels garages dois-je relancer aujourd’hui ?", "Quels dossiers sont prioritaires ?",
];

function Assistant() {
  const { assistantOpen, setAssistantOpen, clients, claims, tasks } = useStore();
  const [msgs, setMsgs] = useState<{ role: "u" | "a"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const answer = (q: string) => {
    const s = q.toLowerCase();
    const top = (arr: string[]) => arr.slice(0, 5).map((x) => `• ${x}`).join("\n");
    if (s.includes("expert")) { const l = claims.filter((c) => /expert|rapport/i.test(c.issue) && c.stage !== "Clôturé"); return `${l.length} sinistres sont bloqués côté expert :\n${top(l.map((c) => `${c.id} — ${c.client} : ${c.issue}`))}`; }
    if (s.includes("document")) { const l = clients.filter((c) => c.category === "Documents manquants"); return `${l.length} clients n’ont pas transmis leurs documents :\n${top(l.map((c) => `${c.name} — ${c.reason}`))}`; }
    if (s.includes("garage")) { const l = claims.filter((c) => /garage|devis|pièces/i.test(c.issue)); return `${l.length} relances garage recommandées aujourd’hui :\n${top(l.map((c) => `${c.id} — ${c.issue}`))}`; }
    if (s.includes("prioritaire")) { const l = [...claims.filter((c) => c.priority === "critique").map((c) => `${c.id} — ${c.client} (critique)`), ...clients.filter((c) => c.priority === "critique").map((c) => `${c.name} — ${c.reason} (critique)`)]; return `${l.length} dossiers critiques :\n${top(l)}`; }
    const t = tasks.filter((x) => x.status !== "Terminée" && x.due <= new Date(2026, 9, 7)); return `Vous avez ${t.length} actions à traiter aujourd’hui. Les plus urgentes :\n${top(t.sort((a, b) => a.due.getTime() - b.due.getTime()).map((x) => `${x.client} — ${x.action} (${x.ref})`))}`;
  };
  const ask = (q: string) => {
    if (!q.trim()) return;
    setMsgs((m) => [...m, { role: "u", text: q }]); setInput(""); setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { role: "a", text: answer(q) }]); }, 900);
  };
  return (
    <>
      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
        <Bot className="h-5 w-5" />Assistant IA
      </motion.button>
      <SidePanel open={assistantOpen} onClose={() => setAssistantOpen(false)} title={<span className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" />Assistant IA</span>}>
        <div className="flex min-h-full flex-col">
          <div className="flex-1 space-y-3">
            {msgs.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Posez une question sur vos dossiers :</p>
                {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)} className="block w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-left text-sm hover:border-primary/40 hover:bg-accent">{s}</button>)}
              </div>
            )}
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={cn("whitespace-pre-line text-sm", m.role === "u" ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground" : "pr-6")}>{m.text}</motion.div>
            ))}
            {typing && <div className="flex gap-1">{[0, 1, 2].map((i) => <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="h-2 w-2 rounded-full bg-primary" />)}</div>}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="sticky bottom-0 mt-4 flex gap-2 bg-card/95 pt-2">
            <input autoFocus value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre question…" className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <Button variant="primary" size="icon" className="h-10 w-10"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </SidePanel>
    </>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { notifOpen, setNotifOpen } = useStore();
  const loc = useLocation();
  return (
    <div className="flex min-h-screen">
      <Background />
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <motion.main key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="px-4 py-6 pb-24 md:px-8">
          {children}
        </motion.main>
      </div>
      <SidePanel open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications"><NotificationList compact /></SidePanel>
      <ClientDrawer />
      <CallModal />
      <Assistant />
    </div>
  );
}

export { daysSince, Activity };
