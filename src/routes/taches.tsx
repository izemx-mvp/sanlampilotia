import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Avatar, Button, Card, PageHeader, PriorityBadge, StatusBadge, Tabs } from "@/components/app/ui";
import { PostponeButton } from "@/components/app/actions";
import { useStore } from "@/lib/store";
import { OPERATORS, TODAY, addDays, fmt } from "@/lib/mock";
import { byPriority } from "@/lib/items";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/taches")({ head: pageHead("Tâches & Relances", "Toutes les tâches créées par les Agents IA et les opérateurs."), component: Taches });

const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function Taches() {
  const { tasks, updateTask, deleteTask } = useStore();
  const [tab, setTab] = useState("today");
  const [edit, setEdit] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const open = tasks.filter((t) => t.status !== "Terminée");
  const groups: Record<string, typeof tasks> = {
    today: open.filter((t) => same(t.due, TODAY)), tomorrow: open.filter((t) => same(t.due, addDays(TODAY, 1))),
    week: open.filter((t) => t.due > TODAY && t.due <= addDays(TODAY, 7)), late: open.filter((t) => t.due < TODAY && !same(t.due, TODAY)), done: tasks.filter((t) => t.status === "Terminée"),
  };
  const list = [...groups[tab]].sort(byPriority);
  return (
    <Shell>
      <PageHeader title="Tâches & Relances" subtitle={`${open.length} tâches ouvertes · ${groups.late.length} en retard`} />
      <div className="mb-4"><Tabs value={tab} onChange={setTab} tabs={[
        { id: "today", label: "Aujourd’hui", count: groups.today.length }, { id: "tomorrow", label: "Demain", count: groups.tomorrow.length }, { id: "week", label: "Cette semaine", count: groups.week.length },
        { id: "late", label: "En retard", count: groups.late.length }, { id: "done", label: "Terminées", count: groups.done.length }]} /></div>
      <div className="grid gap-2">
        <AnimatePresence initial={false}>
          {list.map((t, i) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ delay: Math.min(i, 10) * 0.02 }}>
              <Card className="grid items-center gap-3 p-4 transition-colors hover:border-primary/30 lg:grid-cols-[auto_1.6fr_1fr_1fr_auto]">
                <button onClick={() => updateTask(t.id, { status: t.status === "Terminée" ? "À faire" : "Terminée" })} className={cn("flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-colors", t.status === "Terminée" ? "border-success bg-success text-primary-foreground" : "border-border hover:border-primary")}>{t.status === "Terminée" && <Check className="h-3.5 w-3.5" />}</button>
                <div>
                  {edit === t.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); updateTask(t.id, { action: draft }); setEdit(null); }}><input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={() => setEdit(null)} className="h-8 w-full rounded-lg border border-border bg-surface-2 px-2 text-sm" /></form>
                  ) : <p className={cn("font-medium", t.status === "Terminée" && "text-muted-foreground line-through")}>{t.action}</p>}
                  <p className="text-xs text-muted-foreground">{t.ref} · {t.client}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2"><PriorityBadge p={t.priority} /><StatusBadge s={t.status} /></div>
                <div className="text-xs">
                  <p className={cn("tabular-nums", t.due < TODAY && t.status !== "Terminée" ? "text-destructive" : "text-muted-foreground")}>Échéance {fmt(t.due)}</p>
                  <p className="flex items-center gap-1 text-muted-foreground"><Bot className="h-3 w-3" />Agent {t.agent === "client" ? "Client" : "Sinistre"}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Avatar name={t.operator} size={26} />
                  <select value={t.operator} onChange={(e) => updateTask(t.id, { operator: e.target.value })} title="Attribuer" className="h-8 max-w-28 rounded-lg border border-border bg-surface-2 px-1 text-xs">{OPERATORS.map((o) => <option key={o} className="bg-card">{o}</option>)}</select>
                  <Button size="icon" variant="success" title="Valider" onClick={() => updateTask(t.id, { status: "Terminée" })}><Check className="h-4 w-4" /></Button>
                  <PostponeButton refId={t.id} />
                  <Button size="icon" variant="ghost" title="Modifier" onClick={() => { setEdit(t.id); setDraft(t.action); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" title="Supprimer" onClick={() => deleteTask(t.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {list.length === 0 && <p className="py-16 text-center text-muted-foreground">Rien à traiter ici ✨</p>}
      </div>
    </Shell>
  );
}
