import { createContext, useContext, useState, type ReactNode } from "react";
import * as D from "./data";
import type { Cabinet, Claim, Client, Expert, Follow, Garage, Missing, Payment, Quote, QuoteStatus, Rule } from "./data";
import { GARAGE_STATUSES, TODAY, addDays, nextClaimId, uid } from "./data";

export interface State { clients: Client[]; quotes: Quote[]; payments: Payment[]; missing: Missing[]; claims: Claim[]; experts: Expert[]; garages: Garage[]; cabinet: Cabinet; rules: Rule[] }
export type PartnerKind = "expert" | "garage";
export interface NewClaim { clientId: string; contract: string; type: string; date: Date; city: string; vehicle: string; plate: string; description: string; docs: string[]; photos: string[]; expertId?: string; garageId?: string }

function useStoreValue() {
  const [s, setS] = useState<State>(() => ({ clients: D.CLIENTS, quotes: D.QUOTES, payments: D.PAYMENTS, missing: D.MISSING, claims: D.CLAIMS, experts: D.EXPERTS, garages: D.GARAGES, cabinet: D.CABINET, rules: D.RULES }));
  const mapClaim = (id: string, fn: (c: Claim, st: State) => Claim) => setS((st) => ({ ...st, claims: st.claims.map((c) => (c.id === id ? fn(c, st) : c)) }));
  const rule = (k: string, i = 0) => s.rules.find((r) => r.key === k)?.steps[i]?.value ?? 2;
  const fl = (f: Follow) => `Relance : ${f.result}${f.comment ? ` — ${f.comment}` : ""}`;

  return {
    ...s,
    addQuote: (q: { clientId: string; product: string; amount: number; date: Date; status: QuoteStatus; doc?: string }) => {
      const id = `DEV-2026-${String(41 + s.quotes.length).padStart(3, "0")}`;
      const open = q.status === "Envoyé" || q.status === "En attente";
      setS((st) => ({ ...st, quotes: [{ ...q, id, doc: q.doc || `devis-${id}.pdf`, nextFollow: open ? addDays(q.date, rule("devis")) : q.status === "À préparer" ? addDays(TODAY, 1) : undefined, history: [{ date: q.date, label: `Devis ${id} ajouté` }] }, ...st.quotes] }));
      return id;
    },
    setQuoteStatus: (id: string, status: QuoteStatus) => setS((st) => ({ ...st, quotes: st.quotes.map((q) => q.id !== id ? q : { ...q, status, nextFollow: status === "Accepté" || status === "Refusé" ? undefined : status === "Envoyé" ? addDays(TODAY, rule("devis")) : q.nextFollow, history: [...q.history, { date: TODAY, label: `Statut : ${status}` }] }) })),
    followQuote: (id: string, f: Follow) => setS((st) => ({ ...st, quotes: st.quotes.map((q) => {
      if (q.id !== id) return q;
      const status: QuoteStatus = f.result === "Devis accepté" ? "Accepté" : f.result === "Devis refusé" ? "Refusé" : q.status === "Envoyé" ? "En attente" : q.status;
      const closed = status === "Accepté" || status === "Refusé";
      return { ...q, status, lastFollow: f.date, nextFollow: closed ? undefined : f.next, history: [...q.history, { date: f.date, label: fl(f) }] };
    }) })),
    followPayment: (id: string, f: Follow) => setS((st) => ({ ...st, payments: st.payments.map((p) => p.id !== id ? p : f.result === "Paiement reçu"
      ? { ...p, paid: p.amount, lastFollow: f.date, nextFollow: undefined, timeline: [...p.timeline, { date: f.date, label: "Paiement reçu — soldé" }] }
      : { ...p, lastFollow: f.date, nextFollow: f.next, timeline: [...p.timeline, { date: f.date, label: fl(f) }] }) })),
    addPayment: (id: string, amount: number) => setS((st) => ({ ...st, payments: st.payments.map((p) => {
      if (p.id !== id) return p;
      const paid = Math.min(p.amount, p.paid + amount);
      return { ...p, paid, nextFollow: paid >= p.amount ? undefined : p.nextFollow, timeline: [...p.timeline, { date: TODAY, label: `Paiement enregistré : ${D.dh(amount)}` }] };
    }) })),
    followMissing: (id: string, f: Follow) => setS((st) => ({ ...st, missing: st.missing.map((m) => (m.id !== id ? m : { ...m, status: "Relancé", lastFollow: f.date, nextFollow: f.next })) })),
    markReceived: (id: string) => setS((st) => ({ ...st, missing: st.missing.map((m) => (m.id !== id ? m : { ...m, status: "Complété", nextFollow: undefined })) })),
    addClaim: (n: NewClaim) => {
      const id = nextClaimId(s.claims);
      const ex = s.experts.find((e) => e.id === n.expertId), ga = s.garages.find((g) => g.id === n.garageId);
      const docs = [...n.docs.map((name) => ({ id: uid(), name, category: /constat/i.test(name) ? "Constat" : /cin/i.test(name) ? "CIN" : /grise/i.test(name) ? "Carte grise" : "Autres documents", date: TODAY })), ...n.photos.map((name) => ({ id: uid(), name, category: "Photos", date: TODAY }))];
      const claim: Claim = {
        id, clientId: n.clientId, contract: n.contract, type: n.type, date: n.date, city: n.city, vehicle: n.vehicle, plate: n.plate, description: n.description,
        status: ex ? "Expertise en cours" : "Déclaré", nextAction: ex ? undefined : addDays(TODAY, 1),
        expertId: ex?.id, expertStatus: ex ? "Rapport attendu" : "Expert à affecter", expertAssigned: ex ? TODAY : undefined, expertNext: ex ? addDays(TODAY, rule("experts")) : undefined, expertFollows: [],
        garageId: ga?.id, garageStatus: ga ? "Véhicule reçu" : "Garage à affecter", garageAssigned: ga ? TODAY : undefined, garageNext: ga ? addDays(TODAY, rule("garages")) : undefined, garageFollows: [],
        garageQuotes: [], docs,
        history: [{ date: TODAY, label: "Sinistre déclaré" }, ...(ex ? [{ date: TODAY, label: `Expert affecté : ${ex.cabinet}` }] : []), ...(ga ? [{ date: TODAY, label: `Garage affecté : ${ga.name}` }] : [])],
      };
      setS((st) => ({ ...st, claims: [claim, ...st.claims] }));
      return id;
    },
    updateClaim: (id: string, patch: Partial<Claim>, label?: string) => mapClaim(id, (c) => ({ ...c, ...patch, history: label ? [...c.history, { date: TODAY, label }] : c.history })),
    assign: (claimId: string, kind: PartnerKind, pid: string) => mapClaim(claimId, (c, st) => {
      if (kind === "expert") {
        const e = st.experts.find((x) => x.id === pid)!;
        return { ...c, expertId: pid, expertAssigned: TODAY, expertStatus: "Rapport attendu", expertNext: addDays(TODAY, rule("experts")), nextAction: undefined,
          status: c.status === "Déclaré" || c.status === "Expert à affecter" ? "Expertise en cours" : c.status, history: [...c.history, { date: TODAY, label: `Expert affecté : ${e.cabinet}` }] };
      }
      const g = st.garages.find((x) => x.id === pid)!;
      return { ...c, garageId: pid, garageAssigned: TODAY, garageStatus: "Devis garage attendu", garageNext: addDays(TODAY, rule("garages")), nextAction: undefined,
        status: c.status === "Garage à affecter" ? "Réparation" : c.status, history: [...c.history, { date: TODAY, label: `Garage affecté : ${g.name}` }] };
    }),
    followPartner: (claimId: string, kind: PartnerKind, f: Follow) => mapClaim(claimId, (c, st) => {
      if (kind === "expert") {
        const name = st.experts.find((e) => e.id === c.expertId)?.cabinet ?? "expert";
        const got = f.result === "Rapport reçu";
        const es = ["Expertise programmée", "Rapport en préparation", "Rapport reçu"].includes(f.result) ? f.result : c.expertStatus;
        return { ...c, expertStatus: es, expertLast: f.date, expertNext: got ? undefined : f.next, expertFollows: [...c.expertFollows, f],
          status: got && c.status === "Expertise en cours" ? (c.garageId ? "Réparation" : "Garage à affecter") : c.status,
          nextAction: got && !c.garageId ? addDays(TODAY, 1) : c.nextAction,
          docs: got ? [...c.docs, { id: uid(), name: `rapport-expertise-${c.id}.pdf`, category: "Rapport expert", date: f.date }] : c.docs,
          history: [...c.history, { date: f.date, label: `Relance expert (${name}) : ${f.result}${f.comment ? ` — ${f.comment}` : ""}` }] };
      }
      const name = st.garages.find((g) => g.id === c.garageId)?.name ?? "garage";
      const gs = GARAGE_STATUSES.includes(f.result) ? f.result : c.garageStatus;
      const ready = gs === "Véhicule prêt";
      return { ...c, garageStatus: gs, garageLast: f.date, garageNext: ready ? undefined : f.next, garageFollows: [...c.garageFollows, f],
        status: ready ? "Règlement" : gs === "Réparation en cours" ? "Réparation" : c.status,
        history: [...c.history, { date: f.date, label: `Relance garage (${name}) : ${f.result}${f.comment ? ` — ${f.comment}` : ""}` }] };
    }),
    addGarageQuote: (claimId: string, q: { amount: number; date: Date; doc: string }) => mapClaim(claimId, (c) => c.garageId ? {
      ...c, garageStatus: "Devis reçu", garageQuotes: [...c.garageQuotes, { id: uid(), garageId: c.garageId, status: "Reçu", ...q }],
      docs: [...c.docs, { id: uid(), name: q.doc, category: "Devis garage", date: q.date }], history: [...c.history, { date: q.date, label: `Devis garage ajouté : ${D.dh(q.amount)}` }],
    } : c),
    setGarageQuoteStatus: (claimId: string, qid: string, status: "Validé" | "Refusé") => mapClaim(claimId, (c) => ({
      ...c, garageQuotes: c.garageQuotes.map((q) => (q.id === qid ? { ...q, status } : q)),
      garageStatus: status === "Validé" ? "Réparation en cours" : "Devis garage attendu", status: status === "Validé" ? "Réparation" : c.status,
      history: [...c.history, { date: TODAY, label: `Devis garage ${status.toLowerCase()}` }],
    })),
    addDoc: (claimId: string, doc: { name: string; category: string }) => mapClaim(claimId, (c) => ({ ...c, docs: [...c.docs, { id: uid(), date: TODAY, ...doc }], history: [...c.history, { date: TODAY, label: `Document ajouté : ${doc.name}` }] })),
    savePartner: (kind: PartnerKind, item: Expert | Garage) => setS((st) => {
      const key = kind === "expert" ? "experts" : "garages";
      const list = st[key] as (Expert | Garage)[];
      const exists = list.some((x) => x.id === item.id);
      const next = exists ? list.map((x) => (x.id === item.id ? item : x)) : [{ ...item, id: `${kind === "expert" ? "EXP" : "GAR"}-${uid()}` }, ...list];
      return { ...st, [key]: next };
    }),
    deletePartner: (kind: PartnerKind, id: string) => setS((st) => kind === "expert" ? { ...st, experts: st.experts.filter((x) => x.id !== id) } : { ...st, garages: st.garages.filter((x) => x.id !== id) }),
    importPartners: (kind: PartnerKind, items: (Expert | Garage)[]) => setS((st) => kind === "expert"
      ? { ...st, experts: [...(items as Expert[]).map((x) => ({ ...x, id: `EXP-${uid()}` })), ...st.experts] }
      : { ...st, garages: [...(items as Garage[]).map((x) => ({ ...x, id: `GAR-${uid()}` })), ...st.garages] }),
    setCabinet: (cabinet: Cabinet) => setS((st) => ({ ...st, cabinet })),
    setRule: (rule: Rule) => setS((st) => ({ ...st, rules: st.rules.map((r) => (r.key === rule.key ? rule : r)) })),
  };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useStoreValue();
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}
export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}
