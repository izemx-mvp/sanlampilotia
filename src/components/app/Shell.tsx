import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Car, LayoutDashboard, Menu, Search, Settings, ShieldCheck, Users, Wrench, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { norm } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { to: "/agent-client", label: "Agent Suivi Client", icon: Users, match: (p: string) => /^\/(agent-client|clients)/.test(p) },
  { to: "/agent-sinistre", label: "Agent Sinistre", icon: Car, match: (p: string) => /^\/(agent-sinistre|sinistres)/.test(p) },
  { to: "/intervenants", label: "Experts & Garagistes", icon: Wrench, match: (p: string) => /^\/(intervenants|experts|garages)/.test(p) },
  { to: "/analytics", label: "Analytics", icon: BarChart3, match: (p: string) => p.startsWith("/analytics") },
  { to: "/parametres", label: "Paramètres", icon: Settings, match: (p: string) => p.startsWith("/parametres") },
] as const;

function Sidebar({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { cabinet } = useStore();
  return (
    <div className="flex h-full flex-col bg-navy p-4 text-navy-foreground">
      <div className="mb-8 flex items-center gap-3 px-2 pt-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-lg"><ShieldCheck className="h-5 w-5" /></span>
        <div><p className="font-display text-lg font-semibold leading-tight">PilotIA</p><p className="text-xs text-navy-muted">{cabinet.name}</p></div>
      </div>
      <nav className="space-y-1">
        {NAV.map((n) => {
          const active = n.match(path);
          return (
            <Link key={n.to} to={n.to} onClick={onNav} className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", active ? "text-navy-foreground" : "text-navy-muted hover:bg-navy-accent/60 hover:text-navy-foreground")}>
              {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-xl bg-navy-accent" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />}
              {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />}
              <n.icon className={cn("relative h-4.5 w-4.5", active && "text-primary")} /><span className="relative">{n.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3">
        <div className="rounded-xl bg-navy-accent/60 p-3 text-xs">
          {["Agent IA Suivi Client", "Agent IA Sinistre"].map((a) => (
            <p key={a} className="flex items-center gap-2 py-0.5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" /><span className="relative h-2 w-2 rounded-full bg-success" /></span>{a}<span className="ml-auto text-navy-muted">actif</span></p>
          ))}
        </div>
        <div className="flex items-center gap-3 px-1"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold">SI</span><div className="text-sm"><p className="font-medium">{cabinet.manager}</p><p className="text-xs text-navy-muted">Opératrice</p></div></div>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const { clients, claims, experts, garages } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const res = useMemo(() => {
    const n = norm(q);
    if (n.length < 2) return null;
    const has = (...xs: string[]) => xs.some((x) => norm(x).includes(n));
    const cName = (id: string) => clients.find((c) => c.id === id)?.name ?? "";
    return {
      clients: clients.filter((c) => has(c.name, c.phone, c.id)).slice(0, 5),
      claims: claims.filter((c) => has(c.id, c.plate, c.vehicle, cName(c.clientId), experts.find((e) => e.id === c.expertId)?.cabinet ?? "", garages.find((g) => g.id === c.garageId)?.name ?? "")).slice(0, 5),
      experts: experts.filter((e) => has(e.name, e.cabinet, e.phone)).slice(0, 4),
      garages: garages.filter((g) => has(g.name, g.contact, g.phone)).slice(0, 4),
    };
  }, [q, clients, claims, experts, garages]);
  const go = (fn: () => void) => { fn(); setQ(""); setFocus(false); };
  const total = res ? res.clients.length + res.claims.length + res.experts.length + res.garages.length : 0;
  const G = ({ t, children }: { t: string; children: ReactNode }) => <div className="py-1"><p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t}</p>{children}</div>;
  const R = ({ onClick, a, b }: { onClick: () => void; a: string; b: string }) => <button type="button" onMouseDown={() => go(onClick)} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"><span className="font-medium">{a}</span><span className="truncate text-xs text-muted-foreground">{b}</span></button>;
  return (
    <div className="relative w-full max-w-xl">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 120)}
        placeholder="Rechercher un client, téléphone, n° sinistre, immatriculation, expert, garage…" className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm shadow-card outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
      <AnimatePresence>
        {focus && res && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-12 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-popover p-2 shadow-card">
            {total === 0 && <p className="p-4 text-center text-sm text-muted-foreground">Aucun résultat pour « {q} »</p>}
            {res.clients.length > 0 && <G t="Clients">{res.clients.map((c) => <R key={c.id} onClick={() => nav({ to: "/clients/$id", params: { id: c.id } })} a={c.name} b={`${c.id} · ${c.phone}`} />)}</G>}
            {res.claims.length > 0 && <G t="Sinistres">{res.claims.map((c) => <R key={c.id} onClick={() => nav({ to: "/sinistres/$id", params: { id: c.id } })} a={c.id} b={`${c.vehicle} · ${c.plate}`} />)}</G>}
            {res.experts.length > 0 && <G t="Experts">{res.experts.map((e) => <R key={e.id} onClick={() => nav({ to: "/experts/$id", params: { id: e.id } })} a={e.cabinet} b={`${e.name} · ${e.phone}`} />)}</G>}
            {res.garages.length > 0 && <G t="Garages">{res.garages.map((g) => <R key={g.id} onClick={() => nav({ to: "/garages/$id", params: { id: g.id } })} a={g.name} b={`${g.city} · ${g.phone}`} />)}</G>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen w-full">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block"><Sidebar /></aside>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="relative h-full w-64"><Sidebar onNav={() => setOpen(false)} /></motion.div>
            <button type="button" aria-label="Fermer le menu" onClick={() => setOpen(false)} className="absolute left-68 top-4 rounded-full bg-card p-2"><X className="h-4 w-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
          <div className="animate-blob absolute -right-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-primary/8 blur-3xl" />
          <div className="animate-blob absolute -left-40 top-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan/8 blur-3xl [animation-delay:-9s]" />
        </div>
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border/70 bg-background/80 px-4 py-3 backdrop-blur-md md:px-8">
          <button type="button" aria-label="Ouvrir le menu" onClick={() => setOpen(true)} className="rounded-xl border border-border bg-card p-2.5 lg:hidden"><Menu className="h-4 w-4" /></button>
          <GlobalSearch />
          <p className="ml-auto hidden text-sm text-muted-foreground md:block">Mercredi 7 octobre 2026</p>
        </header>
        <main className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
