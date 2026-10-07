import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Car, ChevronDown, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useState } from "react";
import { fmt, TODAY } from "@/lib/mock";
import type { Item } from "@/lib/items";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { QuickActions } from "./actions";
import { PriorityBadge, StatusBadge } from "./ui";

export function ItemsTable({ items, pageSize = 10, compact }: { items: Item[]; pageSize?: number; compact?: boolean }) {
  const { openClient } = useStore();
  const nav = useNavigate();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<"due" | "age" | null>(null);
  const sorted = sort ? [...items].sort((a, b) => (sort === "due" ? a.due.getTime() - b.due.getTime() : b.age - a.age)) : items;
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const rows = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const open = (i: Item) => (i.kind === "Client" ? openClient(i.id) : nav({ to: "/sinistres/$id", params: { id: i.id } }));
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="sticky top-0 bg-card/80 text-left text-[11px] uppercase tracking-wider text-muted-foreground backdrop-blur">
            <tr>
              <th className="px-4 py-3 font-medium">Priorité</th><th className="px-4 py-3 font-medium">Dossier</th><th className="px-4 py-3 font-medium">Problématique</th>
              {!compact && <th className="px-4 py-3 font-medium">Dernière action</th>}
              <th className="px-4 py-3 font-medium">Prochaine action</th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => setSort(sort === "due" ? null : "due")}>Échéance <ChevronDown className={cn("inline h-3 w-3", sort === "due" && "text-primary")} /></th>
              <th className="cursor-pointer px-4 py-3 font-medium" onClick={() => setSort(sort === "age" ? null : "age")}>Ancienneté <ChevronDown className={cn("inline h-3 w-3", sort === "age" && "text-primary")} /></th>
              <th className="px-4 py-3 font-medium">Statut</th><th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((i, idx) => (
                <motion.tr key={i.id} layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: idx * 0.02 }}
                  onClick={() => open(i)} className="cursor-pointer border-t border-border transition-colors hover:bg-accent/30">
                  <td className="px-4 py-3"><PriorityBadge p={i.priority} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", i.kind === "Client" ? "bg-primary/15 text-primary" : "bg-cyan/15 text-cyan")}>{i.kind === "Client" ? <User className="h-4 w-4" /> : <Car className="h-4 w-4" />}</span>
                      <div><p className="font-medium">{i.client}</p><p className="text-xs text-muted-foreground">{i.id} · {i.type}</p></div>
                    </div>
                  </td>
                  <td className="max-w-[220px] px-4 py-3"><p className="truncate">{i.issue}</p><p className="text-xs text-muted-foreground">{i.agent} · {i.operator}</p></td>
                  {!compact && <td className="max-w-[160px] truncate px-4 py-3 text-muted-foreground">{i.lastAction}</td>}
                  <td className="px-4 py-3"><p className="font-medium text-primary">{i.nextAction}</p><p className="text-xs text-muted-foreground">→ {i.contact.who}</p></td>
                  <td className={cn("px-4 py-3 tabular-nums", i.due < TODAY && "text-destructive")}>{fmt(i.due)}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{i.age} j</td>
                  <td className="px-4 py-3"><StatusBadge s={i.status} /></td>
                  <td className="px-4 py-3"><div className="flex justify-end"><QuickActions target={{ ref: i.id, ...i.contact }} email={i.kind === "Client"} /></div></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-muted-foreground">Aucun dossier ne correspond à ces critères.</p>}
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>{sorted.length} dossiers · page {page + 1}/{pages}</span>
          <div className="flex gap-1">
            <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded-lg p-1.5 hover:bg-accent disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
