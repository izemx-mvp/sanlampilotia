import { AnimatePresence, motion } from "framer-motion";
import { CalendarClock, Check, Mail, MessageCircle, Phone, PhoneOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore, type CallTarget } from "@/lib/store";
import { Button, Avatar } from "./ui";

export function PostponeButton({ refId, size = "sm" }: { refId: string; size?: "sm" | "md" }) {
  const { postpone } = useStore();
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div ref={ref} className="relative">
      <Button size={size} variant="ghost" onClick={(e) => { e.stopPropagation(); setOpen(!open); }}><CalendarClock className="h-3.5 w-3.5" />Reporter</Button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()} className="absolute right-0 z-40 mt-1 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-glow">
            {[["Demain", 1], ["Dans 2 jours", 2], ["Dans 3 jours", 3]].map(([l, d]) => (
              <button key={l} onClick={() => { postpone(refId, d as number); setOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-accent">{l}</button>
            ))}
            <div className="mt-1 flex gap-1 border-t border-border p-1.5">
              <input type="date" value={custom} onChange={(e) => setCustom(e.target.value)} className="h-8 flex-1 rounded-lg bg-muted px-2 text-xs text-foreground" />
              <Button size="sm" variant="soft" disabled={!custom} onClick={() => { const d = Math.max(1, Math.round((new Date(custom).getTime() - new Date(2026, 9, 7).getTime()) / 86400000)); postpone(refId, d); setOpen(false); }}>OK</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuickActions({ target, email }: { target: CallTarget; email?: boolean }) {
  const { startCall, message, resolve } = useStore();
  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button size="icon" variant="soft" title="Appeler" onClick={() => startCall(target)}><Phone className="h-4 w-4" /></Button>
      <Button size="icon" variant="ghost" title="WhatsApp" onClick={() => message(target.ref, "whatsapp", target.who)}><MessageCircle className="h-4 w-4" /></Button>
      {email && <Button size="icon" variant="ghost" title="Email" onClick={() => message(target.ref, "email", target.who)}><Mail className="h-4 w-4" /></Button>}
      <PostponeButton refId={target.ref} />
      <Button size="icon" variant="success" title="Marquer comme résolu" onClick={() => resolve(target.ref)}><Check className="h-4 w-4" /></Button>
    </div>
  );
}

const RESULTS: Record<CallTarget["role"], string[]> = {
  expert: ["Répondu", "Pas de réponse", "À rappeler", "Rapport en cours", "Rapport envoyé"],
  garage: ["Répondu", "Pas de réponse", "Devis attendu", "Pièces attendues", "Véhicule prêt"],
  client: ["Répondu", "Pas de réponse", "À rappeler", "Paiement promis", "Documents promis"],
};

export function CallModal() {
  const { call, endCall, logCall } = useStore();
  const [sec, setSec] = useState(0);
  const [ended, setEnded] = useState(false);
  useEffect(() => {
    if (!call) return; setSec(0); setEnded(false);
    const t = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(t);
  }, [call]);
  const dur = `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
  return (
    <AnimatePresence>
      {call && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" onClick={endCall}>
          <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} transition={{ type: "spring", bounce: 0.25 }}
            onClick={(e) => e.stopPropagation()} className="glass relative w-full max-w-md rounded-3xl p-7 text-center">
            <button onClick={endCall} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            <div className="relative mx-auto mb-4 w-fit">
              {!ended && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
              <Avatar name={call.who} size={72} />
            </div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{ended ? "Appel terminé" : "Appel en cours…"} · {call.role}</p>
            <h3 className="mt-1 text-xl font-semibold">{call.who}</h3>
            <p className="text-sm text-muted-foreground">{call.phone} · {call.ref}</p>
            <p className="mt-3 font-display text-3xl tabular-nums text-gradient">{dur}</p>
            {!ended ? (
              <Button variant="danger" className="mt-6 w-full" onClick={() => setEnded(true)}><PhoneOff className="h-4 w-4" />Raccrocher</Button>
            ) : (
              <div className="mt-6">
                <p className="mb-2 text-left text-sm font-medium">Résultat de l’appel</p>
                <div className="grid grid-cols-2 gap-2">
                  {RESULTS[call.role].map((r) => (
                    <Button key={r} variant="outline" size="sm" className="h-10" onClick={() => { logCall(call, r, dur); endCall(); }}>{r}</Button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
