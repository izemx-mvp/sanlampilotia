import { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import * as M from "./mock";

export interface CallTarget { ref: string; who: string; role: "client" | "expert" | "garage"; phone: string }

interface Store {
  clients: M.Client[]; claims: M.Claim[]; tasks: M.Task[]; history: M.HistoryItem[]; notifs: M.Notif[];
  collapsed: boolean; setCollapsed: (b: boolean) => void;
  notifOpen: boolean; setNotifOpen: (b: boolean) => void;
  assistantOpen: boolean; setAssistantOpen: (b: boolean) => void;
  call: CallTarget | null; startCall: (t: CallTarget) => void; endCall: () => void;
  drawerClient: string | null; openClient: (id: string | null) => void;
  logCall: (t: CallTarget, result: string, duration: string) => void;
  message: (ref: string, channel: "whatsapp" | "email", who: string) => void;
  addNote: (ref: string, note: string) => void;
  postpone: (ref: string, days: number) => void;
  resolve: (ref: string) => void;
  moveClaim: (id: string, stage: string) => void;
  updateTask: (id: string, patch: Partial<M.Task>) => void;
  deleteTask: (id: string) => void;
  setNotifs: (fn: (n: M.Notif[]) => M.Notif[]) => void;
  setGarageStatus: (id: string, s: string) => void;
}

const Ctx = createContext<Store | null>(null);
const now = () => new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(M.clients);
  const [claims, setClaims] = useState(M.claims);
  const [tasks, setTasks] = useState(M.tasks);
  const [history, setHistory] = useState(M.history);
  const [notifs, setNotifs] = useState(M.notifications);
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [call, setCall] = useState<CallTarget | null>(null);
  const [drawerClient, openClient] = useState<string | null>(null);

  const pushEvent = (ref: string, ev: M.TimelineEvent, patchClient: Partial<M.Client> = {}, patchClaim: Partial<M.Claim> = {}) => {
    setHistory((h) => [{ id: `H-${Date.now()}`, date: M.TODAY, time: now(), kind: ev.kind, label: ev.label, ref, actor: "Salma Idrissi" }, ...h]);
    setClients((cs) => cs.map((c) => (c.id === ref ? { ...c, ...patchClient, timeline: [...c.timeline, ev] } : c)));
    setClaims((cs) => cs.map((c) => (c.id === ref ? { ...c, ...patchClaim, timeline: [...c.timeline, ev] } : c)));
  };

  const logCall: Store["logCall"] = (t, result, duration) => {
    const label = `Appel ${t.role === "client" ? "client" : t.role} (${t.who}) — ${result} · ${duration}`;
    const ev: M.TimelineEvent = { date: M.TODAY, label, kind: "call" };
    const next = M.addDays(M.TODAY, result === "Répondu" || result === "Rapport envoyé" ? 3 : 1);
    pushEvent(t.ref, ev,
      { lastInteraction: M.TODAY, nextFollow: next, status: result === "Répondu" ? "Contacté" : result === "Pas de réponse" ? "À relancer" : "En attente client" },
      {
        lastUpdate: M.TODAY, nextFollow: next, lastAction: `Appel ${t.role} — ${result}`,
        status: result === "Rapport envoyé" || result === "Véhicule prêt" ? "En cours" : "En attente externe",
        ...(t.role === "expert" ? {} : {}),
      });
    setClaims((cs) => cs.map((c) => {
      if (c.id !== t.ref) return c;
      const entry = { date: M.TODAY, label: result };
      return t.role === "expert" ? { ...c, expertCalls: [entry, ...c.expertCalls] } : t.role === "garage" ? { ...c, garageCalls: [entry, ...c.garageCalls] } : c;
    }));
    toast.success("Appel enregistré", { description: `${result} — prochaine relance le ${M.fmt(next)}` });
  };

  const value: Store = {
    clients, claims, tasks, history, notifs, collapsed, setCollapsed, notifOpen, setNotifOpen, assistantOpen, setAssistantOpen,
    call, startCall: setCall, endCall: () => setCall(null), drawerClient, openClient, logCall,
    message: (ref, channel, who) => {
      pushEvent(ref, { date: M.TODAY, label: `${channel === "whatsapp" ? "WhatsApp" : "Email"} envoyé à ${who}`, kind: channel }, { lastInteraction: M.TODAY, status: "En attente client" }, { lastUpdate: M.TODAY });
      toast.success(`${channel === "whatsapp" ? "WhatsApp" : "Email"} envoyé`, { description: who });
    },
    addNote: (ref, note) => { pushEvent(ref, { date: M.TODAY, label: `Note : ${note}`, kind: "note" }); toast("Note ajoutée"); },
    postpone: (ref, days) => {
      const d = M.addDays(M.TODAY, days);
      setClients((cs) => cs.map((c) => (c.id === ref ? { ...c, nextFollow: d } : c)));
      setClaims((cs) => cs.map((c) => (c.id === ref ? { ...c, nextFollow: d } : c)));
      setTasks((ts) => ts.map((t) => (t.id === ref || t.ref === ref ? { ...t, due: d } : t)));
      toast("Relance reportée", { description: `Nouvelle échéance : ${M.fmt(d)}` });
    },
    resolve: (ref) => {
      pushEvent(ref, { date: M.TODAY, label: "Dossier marqué comme résolu", kind: "status" }, { status: "Régularisé", priority: "basse" }, { status: "Résolu", priority: "basse" });
      setTasks((ts) => ts.map((t) => (t.id === ref || t.ref === ref ? { ...t, status: "Terminée" } : t)));
      toast.success("Dossier résolu", { description: ref });
    },
    moveClaim: (id, stage) => {
      const c = claims.find((x) => x.id === id);
      if (!c || c.stage === stage) return;
      setClaims((cs) => cs.map((x) => (x.id === id ? { ...x, stage, lastUpdate: M.TODAY, status: stage === "Clôturé" ? "Clôturé" : x.status } : x)));
      pushEvent(id, { date: M.TODAY, label: `Étape → ${stage}`, kind: "status" });
      toast.success(`${id} déplacé`, { description: stage });
    },
    updateTask: (id, patch) => setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t))),
    deleteTask: (id) => { setTasks((ts) => ts.filter((t) => t.id !== id)); toast("Tâche supprimée"); },
    setNotifs,
    setGarageStatus: (id, s) => { setClaims((cs) => cs.map((c) => (c.id === id ? { ...c, garageStatus: s } : c))); pushEvent(id, { date: M.TODAY, label: `Garage : ${s}`, kind: "status" }); },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("StoreProvider missing");
  return s;
};
