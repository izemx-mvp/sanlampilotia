// "AI agents": rule-based analysis of mock data that surfaces the follow-ups to do.
import type { Claim, Priority } from "./data";
import { diffDays, dh, fmt, payStatus } from "./data";
import type { State, PartnerKind } from "./store";

export type Kind = "Devis" | "Paiement" | "Info manquante" | "Sinistre";
export interface ActionItem {
  key: string; agent: "client" | "sinistre"; kind: Kind; target: "Client" | "Expert" | "Garage";
  clientId: string; clientName: string; claimId?: string; city: string;
  motif: string; lastLabel: string; next?: Date; status: string; priority: Priority; reco: string;
  contact: { name: string; phone: string };
}

const P: Record<Priority, number> = { Haute: 0, Moyenne: 1, Basse: 2 };
export const prioOf = (next?: Date, urgent = false): Priority => {
  if (!next) return "Basse";
  const n = diffDays(next);
  return n < 0 || (n === 0 && urgent) ? "Haute" : n <= 1 ? "Moyenne" : "Basse";
};
const when = (x?: Date) => (!x || diffDays(x) <= 0 ? "aujourd’hui" : `le ${fmt(x)}`);

export const claimNext = (c: Claim) => [c.expertNext, c.garageNext, c.nextAction].filter((x): x is Date => !!x).sort((a, b) => a.getTime() - b.getTime())[0];
export const claimLast = (c: Claim) => [c.expertLast, c.garageLast].filter((x): x is Date => !!x).sort((a, b) => b.getTime() - a.getTime())[0];
export function claimPriority(c: Claim): Priority {
  if (c.status === "Clôturé") return "Basse";
  const waited = c.expertAssigned ? -diffDays(c.expertAssigned) : 0;
  const urgent = (c.expertStatus === "Rapport attendu" && waited >= 3) || ((c.status === "Déclaré" || c.status === "Expert à affecter") && -diffDays(c.date) >= 2);
  return prioOf(claimNext(c), urgent);
}

export function buildActions(s: Pick<State, "clients" | "quotes" | "payments" | "missing" | "claims" | "experts" | "garages">): ActionItem[] {
  const cl = new Map(s.clients.map((c) => [c.id, c]));
  const out: ActionItem[] = [];
  for (const q of s.quotes) {
    if (!["Envoyé", "En attente", "À préparer"].includes(q.status)) continue;
    const c = cl.get(q.clientId); if (!c) continue;
    const prep = q.status === "À préparer";
    out.push({ key: q.id, agent: "client", kind: "Devis", target: "Client", clientId: c.id, clientName: c.name, city: c.city, status: q.status,
      motif: prep ? `Devis ${q.product} à préparer` : "Devis envoyé mais pas encore validé", lastLabel: `Dernier contact : ${fmt(q.lastFollow ?? q.date)}`, next: q.nextFollow,
      priority: prioOf(q.nextFollow), contact: { name: c.name, phone: c.phone },
      reco: prep ? `Préparer et envoyer le devis ${q.product} de ${c.name}.` : `Relancer ${c.name} ${when(q.nextFollow)} : son devis est sans réponse depuis ${-diffDays(q.date)} jours.` });
  }
  for (const p of s.payments) {
    const st = payStatus(p); if (st === "Payé") continue;
    const c = cl.get(p.clientId); if (!c) continue;
    const late = -diffDays(p.due), rest = p.amount - p.paid;
    out.push({ key: p.id, agent: "client", kind: "Paiement", target: "Client", clientId: c.id, clientName: c.name, city: c.city, status: st,
      motif: st === "Partiellement payé" ? `Reste à payer ${dh(rest)}` : st === "En retard" ? "Prime non réglée" : `Échéance à venir (${dh(p.amount)})`,
      lastLabel: late > 0 ? `Échéance dépassée de ${late} jours` : `Échéance : ${fmt(p.due)}`, next: p.nextFollow,
      priority: prioOf(p.nextFollow, st === "En retard"), contact: { name: c.name, phone: c.phone },
      reco: st === "En retard" ? `Le règlement de ${c.name} est en retard de ${late} jours.` : st === "Partiellement payé" ? `${c.name} a réglé ${dh(p.paid)} sur ${dh(p.amount)} : relancer pour le solde de ${dh(rest)}.` : `Rappeler à ${c.name} l’échéance du ${fmt(p.due)} (${dh(p.amount)}).` });
  }
  for (const m of s.missing) {
    if (m.status === "Complété") continue;
    const c = cl.get(m.clientId); if (!c) continue;
    const n = -diffDays(m.since);
    out.push({ key: m.id, agent: "client", kind: "Info manquante", target: "Client", clientId: c.id, clientName: c.name, city: c.city, status: m.status,
      motif: m.info, lastLabel: m.lastFollow ? `Dernière relance : ${fmt(m.lastFollow)}` : `Depuis ${n} jours`, next: m.nextFollow,
      priority: prioOf(m.nextFollow, n > 15), contact: { name: c.name, phone: c.phone }, reco: `Demander à ${c.name} : ${m.info.toLowerCase()} depuis ${n} jours.` });
  }
  for (const k of s.claims) {
    if (k.status === "Clôturé" || k.status === "Règlement") continue;
    const c = cl.get(k.clientId); if (!c) continue;
    const base = { agent: "sinistre" as const, kind: "Sinistre" as const, clientId: c.id, clientName: c.name, claimId: k.id, city: k.city };
    const ex = s.experts.find((e) => e.id === k.expertId), ga = s.garages.find((g) => g.id === k.garageId);
    if (!ex) out.push({ ...base, key: `${k.id}-ae`, target: "Client", status: k.status, motif: "Expert à affecter", lastLabel: `Déclaré le ${fmt(k.date)}`, next: k.nextAction, priority: claimPriority(k), contact: { name: c.name, phone: c.phone }, reco: `Affecter un expert au sinistre ${k.id} (${k.city}).` });
    else if (k.expertStatus !== "Rapport reçu") {
      const n = k.expertAssigned ? -diffDays(k.expertAssigned) : 0;
      out.push({ ...base, key: `${k.id}-e`, target: "Expert", status: k.expertStatus, motif: "Rapport expert non reçu", lastLabel: `Dernier contact : ${fmt(k.expertLast ?? k.expertAssigned)}`, next: k.expertNext, priority: claimPriority(k), contact: { name: ex.cabinet, phone: ex.phone }, reco: `Relancer ${ex.cabinet} : le rapport est attendu depuis ${n} jours.` });
    }
    if (ex && k.expertStatus === "Rapport reçu" && !ga) out.push({ ...base, key: `${k.id}-ag`, target: "Client", status: "Garage à affecter", motif: "Garage à affecter", lastLabel: `Rapport reçu le ${fmt(k.expertLast)}`, next: k.nextAction, priority: prioOf(k.nextAction), contact: { name: c.name, phone: c.phone }, reco: `Affecter un garage au sinistre ${k.id} (${k.city}).` });
    if (ga && ["Véhicule reçu", "Devis garage attendu", "Réparation en cours"].includes(k.garageStatus)) {
      const noQuote = k.garageQuotes.length === 0;
      out.push({ ...base, key: `${k.id}-g`, target: "Garage", status: k.garageStatus, motif: noQuote ? "Devis garage non reçu" : "Réparation en cours", lastLabel: `Dernier contact : ${fmt(k.garageLast ?? k.garageAssigned)}`, next: k.garageNext, priority: prioOf(k.garageNext), contact: { name: ga.name, phone: ga.phone },
        reco: noQuote ? `Relancer ${ga.name} : aucun devis n’a encore été ajouté au dossier.` : `Relancer ${ga.name} : réparation en cours depuis ${k.garageAssigned ? -diffDays(k.garageAssigned) : 0} jours.` });
    }
  }
  return out.sort((a, b) => P[a.priority] - P[b.priority] || (a.next?.getTime() ?? 9e15) - (b.next?.getTime() ?? 9e15));
}

export function kpis(s: Pick<State, "quotes" | "payments">, items: ActionItem[]) {
  return {
    clients: new Set(items.filter((i) => i.agent === "client").map((i) => i.clientId)).size,
    quotes: s.quotes.filter((q) => q.status === "Envoyé" || q.status === "En attente").length,
    unpaid: s.payments.filter((p) => payStatus(p) !== "Payé").length,
    claims: new Set(items.filter((i) => i.agent === "sinistre").map((i) => i.claimId)).size,
    experts: items.filter((i) => i.target === "Expert").length,
    garages: items.filter((i) => i.target === "Garage").length,
  };
}

export const partnerLoad = (claims: Claim[], kind: PartnerKind, id: string) => {
  const mine = claims.filter((c) => (kind === "expert" ? c.expertId : c.garageId) === id);
  const done = mine.filter((c) => (kind === "expert" ? c.expertStatus === "Rapport reçu" : c.garageStatus === "Véhicule prêt") || c.status === "Clôturé");
  return { mine, current: mine.length - done.length, done: done.length };
