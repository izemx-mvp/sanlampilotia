import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bot, FileText, Mail, MessageCircle, Phone, RefreshCw, StickyNote, Bell } from "lucide-react";
import { useState } from "react";
import { Shell } from "@/components/app/Shell";
import { Card, PageHeader, Tabs } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { fmtLong } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/historique")({ head: pageHead("Historique", "Timeline centralisée de toutes les interactions et actions IA."), component: Historique });

const K = { call: [Phone, "text-cyan bg-cyan/15", "Appels"], email: [Mail, "text-warning bg-warning/15", "Emails"], whatsapp: [MessageCircle, "text-success bg-success/15", "Messages"], status: [RefreshCw, "text-info bg-info/15", "Statuts"], doc: [FileText, "text-success bg-success/15", "Documents"], ai: [Bot, "text-primary bg-primary/15", "Actions IA"], note: [StickyNote, "text-muted-foreground bg-muted", "Opérateur"], alert: [Bell, "text-destructive bg-destructive/15", "Alertes"] } as const;

function Historique() {
  const { history } = useStore();
  const [f, setF] = useState("all");
  const list = history.filter((h) => f === "all" || h.kind === f);
  const days = [...new Set(list.map((h) => h.date.toDateString()))];
  return (
    <Shell>
      <PageHeader title="Historique global" subtitle="Appels, emails, relances, statuts, documents et actions IA." />
      <div className="mb-5"><Tabs value={f} onChange={setF} tabs={[{ id: "all", label: "Tout" }, ...(["call", "email", "whatsapp", "status", "doc", "ai", "note"] as const).map((k) => ({ id: k, label: K[k][2] }))]} /></div>
      <div className="space-y-6">
        {days.map((d) => (
          <div key={d}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{fmtLong(new Date(d))}</p>
            <Card className="divide-y divide-border">
              {list.filter((h) => h.date.toDateString() === d).map((h, i) => {
                const [Icon, tone] = K[h.kind];
                return (
                  <motion.div key={h.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/20">
                    <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", tone)}><Icon className="h-4 w-4" /></span>
                    <div className="flex-1"><p className="text-sm">{h.label}</p><p className="text-xs text-muted-foreground">{h.ref} · {h.actor}</p></div>
                    <span className="tabular-nums text-xs text-muted-foreground">{h.time}</span>
                  </motion.div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </Shell>
  );
}
