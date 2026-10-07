import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/mock";

export function Card({ className, children, delay = 0, ...rest }: { className?: string; children: ReactNode; delay?: number; onClick?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("glass rounded-2xl", className)} {...rest}>
      {children}
    </motion.div>
  );
}

type BtnVariant = "primary" | "ghost" | "outline" | "soft" | "danger" | "success";
const btn: Record<BtnVariant, string> = {
  primary: "bg-gradient-primary text-primary-foreground shadow-glow hover:brightness-110",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-accent/60",
  outline: "border border-border bg-surface-2 text-foreground hover:bg-accent",
  soft: "bg-primary/15 text-primary hover:bg-primary/25",
  danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  success: "bg-success/15 text-success hover:bg-success/25",
};
export function Button({ variant = "outline", size = "md", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" | "icon" }) {
  return (
    <button {...p} className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-all active:scale-[0.97] disabled:opacity-50 whitespace-nowrap",
      size === "sm" ? "h-8 px-2.5 text-xs" : size === "icon" ? "h-9 w-9" : "h-10 px-4 text-sm", btn[variant], className)} />
  );
}

const prio: Record<Priority, string> = {
  critique: "bg-destructive/15 text-destructive border-destructive/30",
  haute: "bg-warning/15 text-warning border-warning/30",
  moyenne: "bg-info/15 text-info border-info/30",
  basse: "bg-muted text-muted-foreground border-border",
};
export function PriorityBadge({ p }: { p: Priority }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", prio[p])}>
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current", p === "critique" && "animate-pulse")} />{p}
    </span>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const tone = /résolu|régularisé|clôturé|terminée|prêt/i.test(s) ? "text-success bg-success/10" : /bloqué|retard/i.test(s) ? "text-destructive bg-destructive/10" : /attente|relancer/i.test(s) ? "text-warning bg-warning/10" : "text-cyan bg-cyan/10";
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", tone)}>{s}</span>;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const init = name.split(" ").map((x) => x[0]).slice(0, 2).join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const bg = ["bg-primary/25 text-primary", "bg-cyan/20 text-cyan", "bg-success/20 text-success", "bg-warning/20 text-warning"][hue];
  return <span style={{ width: size, height: size }} className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold", bg)}>{init}</span>;
}

export function Counter({ to, suffix = "", decimals = 0 }: { to: number; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => { if (!inView) return; const c = animate(0, to, { duration: 1.2, ease: "easeOut", onUpdate: setV }); return () => c.stop(); }, [inView, to]);
  return <span ref={ref}>{v.toFixed(decimals).replace(".", ",")}{suffix}</span>;
}

export function Sparkline({ data, color = "var(--chart-1)" }: { data: number[]; color?: string }) {
  const d = data.map((v, i) => ({ i, v }));
  const id = `sp${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={d}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.45} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#${id})`} isAnimationActive animationDuration={1200} /></AreaChart>
    </ResponsiveContainer>
  );
}

export function Progress({ value, tone = "bg-gradient-primary" }: { value: number; tone?: string }) {
  return <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1, ease: "easeOut" }} className={cn("h-full rounded-full", tone)} /></div>;
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface-2 p-1">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)} className={cn("relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors", value === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
          {value === t.id && <motion.span layoutId={`tab-${tabs[0].id}`} className="absolute inset-0 rounded-lg bg-accent" transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
          <span className="relative flex items-center gap-1.5">{t.label}{t.count !== undefined && <span className="rounded-md bg-background/50 px-1.5 text-[10px]">{t.count}</span>}</span>
        </button>
      ))}
    </div>
  );
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-xl border border-border bg-surface-2 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o} className="bg-card">{o}</option>)}
    </select>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </motion.div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Pulse({ tone = "bg-success" }: { tone?: string }) {
  return <span className="relative inline-flex h-2.5 w-2.5"><span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-60", tone)} /><span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", tone)} /></span>;
}
