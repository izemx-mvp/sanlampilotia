import type { Claim, Client, Priority } from "./mock";
import { TODAY, expertById, garageById } from "./mock";

export interface Item {
  id: string; kind: "Client" | "Sinistre"; client: string; issue: string; lastAction: string; nextAction: string;
  due: Date; agent: "Agent Client" | "Agent Sinistre"; operator: string; priority: Priority; status: string; type: string; age: number;
  contact: { who: string; role: "client" | "expert" | "garage"; phone: string };
}

const P: Record<Priority, number> = { critique: 0, haute: 1, moyenne: 2, basse: 3 };
export const byPriority = (a: { priority: Priority }, b: { priority: Priority }) => P[a.priority] - P[b.priority];

export function buildItems(clients: Client[], claims: Claim[]): Item[] {
  const a: Item[] = clients.map((c) => ({
    id: c.id, kind: "Client", client: c.name, issue: c.reason, lastAction: c.timeline[c.timeline.length - 1]?.label ?? "", nextAction: c.recommendation.split(/[.,]/)[0] ?? "",
    due: c.nextFollow, agent: "Agent Client", operator: c.operator, priority: c.priority, status: c.status, type: c.category,
    age: Math.round((TODAY.getTime() - c.lastInteraction.getTime()) / 864e5), contact: { who: c.name, role: "client", phone: c.phone },
  }));
  const b: Item[] = claims.map((c) => {
    const isGarage = /garage|devis|pièces/i.test(c.nextAction + c.issue);
    const ex = expertById(c.expertId), ga = garageById(c.garageId);
    return {
      id: c.id, kind: "Sinistre", client: c.client, issue: c.issue, lastAction: c.lastAction, nextAction: c.nextAction, due: c.nextFollow,
      agent: "Agent Sinistre", operator: c.operator, priority: c.priority, status: c.status, type: c.type,
      age: Math.round((TODAY.getTime() - c.declared.getTime()) / 864e5),
      contact: isGarage ? { who: ga.name, role: "garage", phone: ga.phone } : /client|virement|sanlam/i.test(c.nextAction) ? { who: c.client, role: "client", phone: "06 61 22 33 44" } : { who: ex.cabinet, role: "expert", phone: ex.phone },
    };
  });
  return [...a, ...b];
}

export const isDone = (s: string) => /résolu|régularisé|clôturé/i.test(s);
