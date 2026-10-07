import { animate, motion, useInView } from "framer-motion";
import { Phone as PhoneIcon, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { diffDays, fmt, rel, type Priority, type TimelineEvent } from "@/lib/data";

export function Card({ className, children, delay = 0, onClick }: { className?: string; children: ReactNode; delay?: number; onClick?: () => void }) {
  return (
    <motion.div onClick={onClick} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("rounded-2xl border border-border bg-card shadow-card", className)}>{children}</motion.div>
  );
}

type V = "primary" | "outline" | "ghost" | "danger" | "success" | "soft";
const V_CLS: Record<V, string> = {
  primary: "bg-gradient-primary text-primary-foreground shadow-sm hover:brightness-110",
  outline: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-destructive/10 text-destructive hover:bg-destructive/15",
  success: "bg-success/10 text-success hover:bg-success/15",
  soft: "bg-accent text-accent-foreground hover:bg-primary/15",
};
export function Btn({ variant = "outline", size = "md", className, type = "button", ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V; size?: "sm" | "md" | "lg" | "icon" }) {
  return <button type={type} {...p} className={cn("inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-medium transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-8 px-3 text-xs" : size === "lg" ? "h-12 px-5 text-sm font-semibold" : size === "icon" ? "h-8 w-8" : "h-10 px-4 text-sm", V_CLS[variant], className)} />;
}

export function tone(s: string) {
  if (/inactif/i.test(s)) return "bg-muted text-muted-foreground";
  if (/retard|refusé|non payé/i.test(s)) return "bg-destructive/10 text-destructive";
  if (/attente|attendu|partiel|préparer|affecter|relancé|envoyé|programmée|préparation|déclaré/i.test(s)) return "bg-warning/12 text-warning";
  if (/payé|accepté|complété|reçu|prêt|clôturé|actif|connecté|validé|terminé/i.test(s)) return "bg-success/12 text-success";
  return "bg-primary/10 text-primary";
}
export const Badge = ({ s }: { s: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", tone(s))}><span className="h-1.5 w-1.5 rounded-full bg-current" />{s}</span>
);
const PR: Record<Priority, string> = { Haute: "bg-destructive/10 text-destructive", Moyenne: "bg-warning/12 text-warning", Basse: "bg-muted text-muted-foreground" };
export const Prio = ({ p }: { p: Priority }) => <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold", PR[p])}>{p === "Haute" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}{p}</span>;

export function Phone({ n, label, className }: { n: string; label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", className)}>
      <PhoneIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="whitespace-nowrap font-mono font-semibold tabular-nums text-foreground">{n}</span>
      {label && <span className="truncate text-xs text-muted-foreground">· {label}</span>}
    </span>
  );
}
export function NextDate({ d }: { d?: Date }) {
  if (!d) return <span className="text-muted-foreground">—</span>;
  const n = diffDays(d);
  return <span className={cn("whitespace-nowrap", n < 0 ? "font-semibold text-destructive" : n === 0 ? "font-semibold text-primary" : "text-foreground")}>{rel(d)}</span>;
}
export function Avatar({ name, size = 34 }: { name: string; size?: number }) {
  const init = name.split(" ").map((x) => x[0]).slice(0, 2).join("");
  const h = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  return <span style={{ width: size, height: size }} className={cn("inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold", ["bg-primary/12 text-primary", "bg-cyan/15 text-cyan", "bg-success/12 text-success", "bg-warning/12 text-warning"][h])}>{init}</span>;
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: ReactNode; subtitle?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        {eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </motion.div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, id = "tabs" }: { tabs: { id: string; label: string; count?: number }[]; value: string; onChange: (v: string) => void; id?: string }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-1 shadow-card">
      {tabs.map((t) => (
        <button key={t.id} type="button" onClick={() => onChange(t.id)} className={cn("relative rounded-xl px-4 py-2 text-sm font-medium transition-colors", value === t.id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
          {value === t.id && <motion.span layoutId={id} className="absolute inset-0 rounded-xl bg-navy" transition={{ type: "spring", bounce: 0.15, duration: 0.45 }} />}
          <span className="relative flex items-center gap-2">{t.label}{t.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px] font-bold", value === t.id ? "bg-primary text-primary-foreground" : "bg-muted")}>{t.count}</span>}</span>
        </button>
      ))}
    </div>
  );
}

export const inputCls = "h-10 w-full rounded-xl border border-input bg-card px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-muted disabled:text-muted-foreground";
export function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: readonly string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "w-auto pr-8", value && "border-primary/50 bg-accent text-accent-foreground")}>
      <option value="">{label} : Tous</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}
export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cn("block space-y-1.5", className)}><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

export function Modal({ open, onClose, title, description, children, wide }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn("max-h-[90vh] overflow-y-auto rounded-2xl", wide ? "sm:max-w-3xl" : "sm:max-w-lg")}>
        <DialogHeader><DialogTitle className="font-display">{title}</DialogTitle><DialogDescription>{description ?? " "}</DialogDescription></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(to);
  useEffect(() => { if (!inView) return; const c = animate(0, to, { duration: 0.9, ease: "easeOut", onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

export function Stat({ label, value, icon: Icon, tone: t = "primary", hint, delay = 0, suffix }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "warning" | "destructive" | "success" | "cyan" | "navy"; hint?: string; delay?: number; suffix?: string }) {
  const T = { primary: "bg-primary/10 text-primary", warning: "bg-warning/12 text-warning", destructive: "bg-destructive/10 text-destructive", success: "bg-success/12 text-success", cyan: "bg-cyan/15 text-cyan", navy: "bg-navy/10 text-navy" }[t];
  return (
    <Card delay={delay} className="group h-full p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40">
      <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-muted-foreground">{label}</p><span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", T)}><Icon className="h-4.5 w-4.5" /></span></div>
      <p className="mt-1 font-display text-3xl font-semibold"><Counter to={value} suffix={suffix} /></p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}><motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className={cn("h-full rounded-full", v >= 100 ? "bg-success" : v > 0 ? "bg-warning" : "bg-destructive/60")} /></div>;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const ev = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!ev.length) return <p className="text-sm text-muted-foreground">Aucun événement.</p>;
  return (
    <ol className="relative space-y-3 border-l-2 border-border pl-5">
      {ev.map((e, i) => (
        <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="relative text-sm">
          <span className={cn("absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card", i === ev.length - 1 ? "bg-primary" : "bg-navy-muted")} />
          <span className="font-mono text-xs font-semibold text-muted-foreground">{fmt(e.date)}</span> <span className="text-muted-foreground">—</span> {e.label}
        </motion.li>
      ))}
    </ol>
  );
}

export function RecoPanel({ title, recos }: { title: string; recos: { key: string; text: string; onClick?: () => void; urgent?: boolean }[] }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="mb-3 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground"><Sparkles className="h-4 w-4" /></span><div><p className="font-display font-semibold">{title}</p><p className="text-xs text-muted-foreground">Analyse automatique en arrière-plan · mise à jour en continu</p></div></div>
      <div className="grid gap-2 md:grid-cols-2">
        {recos.length === 0 && <p className="text-sm text-muted-foreground">Aucune action recommandée. Tout est à jour.</p>}
        {recos.map((r, i) => (
          <motion.button type="button" key={r.key} onClick={r.onClick} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            className="flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent">
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", r.urgent ? "animate-pulse bg-destructive" : "bg-primary")} /><span><span className="text-xs font-semibold uppercase tracking-wide text-primary">Recommandation IA</span><br />{r.text}</span>
          </motion.button>
        ))}
      </div>
    </Card>
  );
}

export const th = "whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground";
export const td = "px-4 py-3 align-middle";
export const rowCls = "cursor-pointer transition-colors hover:bg-accent/50";
export function Table({ head, children, empty }: { head: string[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-surface-2"><tr>{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
      {empty && <p className="p-10 text-center text-sm text-muted-foreground">Aucun élément ne correspond aux filtres.</p>}
    </div>
  );
}

const ascii = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’]/g, "'").replace(/[^\x20-\x7E]/g, "").replace(/[()\\]/g, "");
/** Generates a small valid PDF so mock downloads open in any viewer. */
export function downloadMock(filename: string, lines: string[]) {
  const text = lines.map((l, i) => `BT /F1 ${i === 0 ? 18 : 11} Tf 50 ${790 - i * 24} Td (${ascii(l)}) Tj ET`).join("\n");
  const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>", "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>", `<< /Length ${text.length} >>\nstream\n${text}\nendstream`, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
  let pdf = "%PDF-1.4\n";
  const offs: number[] = [];
  objs.forEach((o, i) => { offs.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("")}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  toast.success(`${filename} téléchargé`);
}
