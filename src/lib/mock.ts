export type Priority = "critique" | "haute" | "moyenne" | "basse";
export type Agent = "client" | "sinistre";

export const OPERATORS = ["Salma Idrissi", "Hamza Berrada", "Imane Chraibi", "Omar Lahlou"];

const first = ["Mohamed", "Youssef", "Sara", "Nadia", "Amine", "Karim", "Fatima Zahra", "Hicham", "Leila", "Rachid", "Khadija", "Mehdi", "Samira", "Anas", "Zineb", "Othmane", "Houda", "Badr", "Meriem", "Yassine", "Ghita", "Adil", "Soukaina", "Reda", "Hajar", "Ilyas", "Asmae", "Tarik", "Wiam", "Nabil", "Loubna", "Hassan", "Salma", "Ayoub", "Kenza", "Driss", "Siham", "Jamal", "Naima", "Walid", "Ikram", "Mourad", "Btissam", "Saad", "Rim"];
const last = ["El Amrani", "Benali", "Alaoui", "Bennani", "El Mansouri", "Tazi", "Fassi", "Berrada", "Chraibi", "Lahlou", "Benjelloun", "Sqalli", "Kettani", "Idrissi", "Ouazzani", "Naciri", "Cherkaoui", "Hajji", "Zniber", "Belkadi", "Raji", "Amrani", "Saidi", "Bouzidi", "El Khatib", "Mernissi", "Tahiri", "Rifai", "Guessous", "Lamrani", "Filali", "Skalli", "Benkirane", "Mouline", "Squalli", "Jabri", "Bekkali", "Hilali", "Kabbaj", "Sefrioui", "Daoudi", "Ziani", "Sbai", "Tounsi", "Ammor"];
const cities = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Fès", "Agadir", "Kénitra", "Mohammedia"];
const products = ["Auto Tous Risques", "Auto Tiers", "Multirisque Habitation", "Santé Famille", "Prévoyance", "RC Pro", "Flotte Auto"];
const cars = ["Dacia Duster", "Dacia Logan", "Renault Clio", "Peugeot 208", "Hyundai Tucson", "Toyota Corolla", "Kia Sportage", "VW Golf", "Fiat Tipo", "Skoda Octavia"];

let seed = 7;
const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
const pick = <T,>(a: T[]): T => a[Math.floor(rnd() * a.length)]!;
const int = (a: number, b: number) => Math.floor(rnd() * (b - a + 1)) + a;
const phone = () => `06 ${int(10, 99)} ${int(10, 99)} ${int(10, 99)} ${int(10, 99)}`;
const plate = () => `${int(10000, 99999)}-${pick(["A", "B", "D", "H", "W"])}-${int(1, 80)}`;

export const TODAY = new Date(2026, 9, 7);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);
export const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
export const fmtLong = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });

export interface TimelineEvent { date: Date; label: string; kind: "call" | "email" | "whatsapp" | "status" | "doc" | "ai" | "note" | "alert" }

export interface Client {
  id: string; name: string; phone: string; email: string; city: string;
  type: "Client" | "Prospect"; product: string; contracts: number;
  reason: string; category: string; lastInteraction: Date; nextFollow: Date;
  priority: Priority; operator: string; status: string; score: number;
  why: string; recommendation: string; timeline: TimelineEvent[];
}

export const CLIENT_STATUSES = ["À contacter", "Contacté", "En attente client", "À relancer", "Régularisé", "Clôturé"];

const clientCases: { category: string; reason: string; why: string; rec: string }[] = [
  { category: "Documents manquants", reason: "Attestation d’assurance manquante", why: "L’attestation n’a pas été reçue 5 jours après la souscription.", rec: "Envoyer un WhatsApp de rappel avec la liste des pièces." },
  { category: "Documents manquants", reason: "Copie CIN non reçue", why: "Le dossier ne peut pas être validé sans copie de la CIN.", rec: "Envoyer un WhatsApp aujourd’hui." },
  { category: "Documents manquants", reason: "Document véhicule incomplet", why: "La carte grise transmise est illisible.", rec: "Demander un nouveau scan par email." },
  { category: "Règlements non payés", reason: "Prime non réglée", why: "Règlement toujours absent 7 jours après l’échéance.", rec: "Contacter le client aujourd’hui." },
  { category: "Règlements non payés", reason: "Échéance dépassée de 8 jours", why: "Risque de suspension de garantie sous 7 jours.", rec: "Appeler le client en priorité." },
  { category: "Devis en attente", reason: "Devis envoyé il y a 4 jours sans réponse", why: "Aucune ouverture de l’email de devis détectée.", rec: "Appeler pour présenter le devis." },
  { category: "Prospects à relancer", reason: "Prospect intéressé — aucune réponse depuis 48 h", why: "Le prospect a demandé un rappel mais n’a pas répondu.", rec: "Relancer par WhatsApp puis appel." },
  { category: "Contrats arrivant à échéance", reason: "Renouvellement dans 15 jours", why: "Contrat à renouveler avant le 22/10.", rec: "Proposer le renouvellement par email." },
  { category: "Informations manquantes", reason: "Numéro d’immatriculation manquant", why: "Impossible d’émettre le contrat sans immatriculation.", rec: "Appeler le client pour compléter." },
];

const prios: Priority[] = ["critique", "haute", "haute", "moyenne", "moyenne", "basse"];

export const clients: Client[] = Array.from({ length: 45 }, (_, i) => {
  const isProspect = i >= 30;
  const c = i === 0 ? clientCases[4]! : isProspect ? pick([clientCases[5]!, clientCases[6]!]) : pick(clientCases.filter((x) => x.category !== "Prospects à relancer"));
  const name = i === 0 ? "Mohamed El Amrani" : `${first[i]} ${last[i]}`;
  const last_ = addDays(TODAY, -int(1, 9));
  const next = addDays(TODAY, int(-3, 4));
  const status = pick(CLIENT_STATUSES.slice(0, 4));
  return {
    id: `CLI-${2400 + i}`, name, phone: phone(), city: pick(cities),
    email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, ".")}@gmail.com`,
    type: isProspect ? "Prospect" : "Client", product: pick(products), contracts: isProspect ? 0 : int(1, 4),
    reason: c.reason, category: c.category, lastInteraction: last_, nextFollow: next,
    priority: i === 0 ? "haute" : pick(prios), operator: pick(OPERATORS), status, score: int(38, 96),
    why: c.why, recommendation: c.rec,
    timeline: [
      { date: addDays(last_, -10), label: isProspect ? "Demande de devis reçue" : "Devis envoyé", kind: "email" },
      { date: addDays(last_, -6), label: "Relance email", kind: "email" },
      { date: addDays(last_, -4), label: "Client contacté", kind: "call" },
      { date: addDays(last_, -2), label: "Document reçu", kind: "doc" },
      { date: last_, label: c.reason, kind: "alert" },
    ],
  };
});

export interface Expert { id: string; name: string; cabinet: string; phone: string; email: string; active: number; delay: number; late: number; rate: number; last: Date }
export interface Garage { id: string; name: string; contact: string; phone: string; city: string; active: number; delay: number; late: number; rate: number; last: Date }

export const experts: Expert[] = [
  ["Rachid Bennis", "Cabinet Expertise Atlas"], ["Nawal Kadiri", "Expertises Maghreb Conseil"], ["Hamid Oulad", "Cabinet Expert Auto Rabat"], ["Saïd Lazrak", "Bureau Technique Sud"],
  ["Fouad Tahri", "Expertise Plus Casablanca"], ["Amal Rhazi", "Cabinet Rhazi & Associés"], ["Jalil Marzouk", "Atlantique Expertises"], ["Laila Sabri", "Cabinet Expertise Nord"],
].map(([n, c], i) => ({ id: `EXP-${i + 1}`, name: n!, cabinet: c!, phone: phone(), email: `${n!.split(" ")[0]!.toLowerCase()}@expertise.ma`, active: int(4, 16), delay: +(1 + rnd() * 3.5).toFixed(1), late: int(0, 5), rate: int(70, 98), last: addDays(TODAY, -int(0, 5)) }));

export const garages: Garage[] = ["Garage Atlas", "Auto Service Casablanca", "Garage Al Fath", "Carrosserie Moderne", "Garage Anfa Auto", "Méca Rabat Center", "Garage Ennour", "Auto Pro Marrakech", "Carrosserie du Détroit", "Garage Souss Auto"].map((n, i) => ({
  id: `GAR-${i + 1}`, name: n, contact: `${pick(first)} ${pick(last)}`, phone: phone(), city: pick(cities), active: i === 0 ? 14 : int(3, 12), delay: i === 0 ? 1.8 : +(1 + rnd() * 3).toFixed(1), late: int(0, 4), rate: i === 0 ? 92 : int(68, 97), last: addDays(TODAY, -int(0, 6)),
}));

export const STAGES = ["Nouveau sinistre", "Expertise à programmer", "Expertise en cours", "Rapport expert attendu", "Garage / réparation", "Validation assurance", "Règlement", "Clôturé"];
export const GARAGE_STATUSES = ["Véhicule reçu", "Devis attendu", "Pièces attendues", "Réparation en cours", "Véhicule prêt"];

export interface Claim {
  id: string; client: string; type: string; vehicle: string; plate: string; declared: Date;
  expertId: string; garageId: string; stage: string; lastUpdate: Date; nextFollow: Date;
  operator: string; priority: Priority; status: string; issue: string; nextAction: string; lastAction: string;
  garageStatus: string; expertCalls: { date: Date; label: string }[]; garageCalls: { date: Date; label: string }[];
  timeline: TimelineEvent[];
}

const claimIssues = [
  ["Expert non relancé depuis 5 jours", "Appeler l’expert"], ["Rapport expertise non reçu", "Relancer l’expert"], ["Garage non contacté", "Appeler le garage"],
  ["Devis garage manquant", "Appeler le garage"], ["Véhicule en attente de pièces", "Relancer le garage"], ["Accord assurance en attente", "Relancer SANLAM"],
  ["Règlement en attente", "Vérifier le virement"], ["Dossier sans mise à jour depuis 4 jours", "Faire le point dossier"],
];

export const claims: Claim[] = Array.from({ length: 30 }, (_, i) => {
  let [issue = "", action = ""] = pick(claimIssues);
  let client = `${pick(first)} ${pick(last)}`;
  let id = `SIN-2026-${int(1000, 9899)}`;
  let garageId = pick(garages).id, expertId = pick(experts).id, stage = STAGES[i % 8]!;
  let priority: Priority = pick(prios);
  if (i === 0) { id = "SIN-2026-7841"; client = "Mohamed El Amrani"; issue = "Expert non relancé depuis 5 jours"; action = "Appeler l’expert"; priority = "critique"; stage = STAGES[2]!; }
  if (i === 1) { id = "SIN-2026-8421"; client = "Youssef Benali"; expertId = "EXP-1"; issue = "Rapport attendu depuis 3 jours"; action = "Relancer l’expert"; priority = "haute"; stage = STAGES[3]!; }
  if (i === 2) { id = "SIN-2026-7932"; client = "Sara Alaoui"; garageId = "GAR-2"; issue = "Devis réparation non reçu — retard 2 jours"; action = "Appeler le garage"; priority = "haute"; stage = STAGES[4]!; }
  if (i === 3) { id = "SIN-2026-00284"; client = "Youssef Benali"; issue = "Rapport toujours non reçu"; action = "Relancer l’expert"; priority = "haute"; stage = STAGES[2]!; }
  if (stage === "Clôturé") priority = "basse";
  const declared = i === 3 ? new Date(2026, 9, 3) : addDays(TODAY, -int(3, 30));
  const lastUpdate = addDays(TODAY, -int(0, 6));
  return {
    id, client, type: i === 3 ? "Accident automobile" : pick(["Accident automobile", "Bris de glace", "Vol partiel", "Collision", "Dégât des eaux"]),
    vehicle: i === 3 ? "Dacia Duster" : pick(cars), plate: i === 3 ? "12345-A-6" : plate(), declared, expertId, garageId, stage,
    lastUpdate, nextFollow: addDays(TODAY, int(-2, 3)), operator: pick(OPERATORS), priority,
    status: stage === "Clôturé" ? "Clôturé" : pick(["En cours", "Bloqué", "En attente externe", "En cours"]),
    issue, nextAction: action, lastAction: pick(["Appel expert", "Email garage", "Relance IA", "Note opérateur"]),
    garageStatus: pick(GARAGE_STATUSES),
    expertCalls: [{ date: addDays(TODAY, 0), label: "Appel sans réponse" }, { date: addDays(TODAY, -1), label: "Expert confirme intervention" }, { date: addDays(TODAY, -3), label: "Premier contact" }],
    garageCalls: [{ date: addDays(TODAY, -1), label: "Devis en préparation" }, { date: addDays(TODAY, -3), label: "Véhicule reçu au garage" }],
    timeline: [
      { date: declared, label: "Sinistre déclaré", kind: "status" }, { date: declared, label: "Dossier créé", kind: "status" },
      { date: addDays(declared, 1), label: "Expert assigné", kind: "ai" }, { date: addDays(declared, 2), label: "Expert contacté", kind: "call" },
      { date: lastUpdate, label: issue, kind: "alert" },
    ],
  };
});

export interface Task { id: string; ref: string; client: string; action: string; due: Date; priority: Priority; agent: Agent; operator: string; status: "À faire" | "En cours" | "Terminée" }
export const tasks: Task[] = Array.from({ length: 50 }, (_, i) => {
  const isClaim = i % 2 === 0;
  const src = (isClaim ? claims[i % claims.length] : clients[i % clients.length])!;
  return {
    id: `T-${500 + i}`, ref: src.id, client: isClaim ? (src as Claim).client : (src as Client).name,
    action: isClaim ? (src as Claim).nextAction : (src as Client).recommendation.split(" ").slice(0, 5).join(" "),
    due: addDays(TODAY, int(-3, 6)), priority: src.priority, agent: isClaim ? "sinistre" : "client",
    operator: pick(OPERATORS), status: i % 7 === 0 ? "Terminée" : i % 3 === 0 ? "En cours" : "À faire",
  };
});

export interface HistoryItem { id: string; date: Date; time: string; kind: TimelineEvent["kind"]; label: string; ref: string; actor: string }
export const history: HistoryItem[] = Array.from({ length: 40 }, (_, i) => {
  const kinds: TimelineEvent["kind"][] = ["call", "email", "whatsapp", "status", "doc", "ai", "ai", "note"];
  const k = pick(kinds);
  const labels: Record<string, string[]> = {
    call: ["Appel sortant — expert", "Appel client — sans réponse", "Appel garage — devis confirmé"], email: ["Email de relance envoyé", "Devis envoyé par email"],
    whatsapp: ["WhatsApp rappel documents", "WhatsApp confirmation RDV"], status: ["Statut → Expertise en cours", "Statut → Régularisé"],
    doc: ["Copie CIN reçue", "Rapport d’expertise ajouté"], ai: ["Agent IA : relance détectée", "Agent IA : priorité relevée à Haute", "Agent IA : tâche créée"], note: ["Note opérateur ajoutée"],
  };
  const isClaim = rnd() > 0.5;
  return { id: `H-${i}`, date: addDays(TODAY, -Math.floor(i / 6)), time: `${int(8, 18)}:${String(int(0, 59)).padStart(2, "0")}`, kind: k, label: pick(labels[k]!), ref: isClaim ? claims[i % 30]!.id : clients[i % 45]!.id, actor: k === "ai" ? (isClaim ? "Agent Sinistre" : "Agent Client") : pick(OPERATORS) };
});

export interface Notif { id: string; text: string; ref: string; read: boolean; level: Priority; time: string }
export const notifications: Notif[] = [
  { id: "n1", text: "Rapport expert toujours non reçu — SIN-2026-8421", ref: "SIN-2026-8421", read: false, level: "haute", time: "il y a 5 min" },
  { id: "n2", text: "Prime client non réglée depuis 8 jours — Mohamed El Amrani", ref: "CLI-2400", read: false, level: "haute", time: "il y a 18 min" },
  { id: "n3", text: "Garage Atlas doit être relancé aujourd’hui.", ref: "GAR-1", read: false, level: "moyenne", time: "il y a 1 h" },
  { id: "n4", text: "5 dossiers clients sont sans réponse depuis plus de 72 heures.", ref: "", read: false, level: "moyenne", time: "il y a 2 h" },
  { id: "n5", text: "3 sinistres nécessitent une action urgente.", ref: "", read: true, level: "critique", time: "ce matin" },
];

export const expertById = (id: string) => experts.find((e) => e.id === id)!;
export const garageById = (id: string) => garages.find((g) => g.id === id)!;
export const daysSince = (d: Date) => Math.max(0, Math.round((TODAY.getTime() - d.getTime()) / 86400000));
