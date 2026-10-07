// Mock data (Moroccan context) — everything runs front-end only.
export const TODAY = new Date(2026, 9, 7);
export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const d = (n: number) => addDays(TODAY, n);
export const diffDays = (x: Date) => Math.round((new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime() - TODAY.getTime()) / 864e5);
const p2 = (n: number) => String(n).padStart(2, "0");
export const fmt = (x?: Date) => (x ? `${p2(x.getDate())}/${p2(x.getMonth() + 1)}` : "—");
export const fmtFull = (x?: Date) => (x ? `${fmt(x)}/${x.getFullYear()}` : "—");
export const rel = (x?: Date) => {
  if (!x) return "—";
  const n = diffDays(x);
  return n === 0 ? "Aujourd’hui" : n === 1 ? "Demain" : n === -1 ? "Hier" : n < 0 ? `${fmt(x)} · retard ${-n} j` : fmt(x);
};
export const dh = (n: number) => `${String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} DH`;
export const toInput = (x?: Date) => (x ? `${x.getFullYear()}-${p2(x.getMonth() + 1)}-${p2(x.getDate())}` : "");
export const fromInput = (s: string) => {
  if (!s) return undefined;
  const [y, m, dd] = s.split("-").map(Number);
  return new Date(y, m - 1, dd);
};
export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, "");
export const uid = () => Math.random().toString(36).slice(2, 9);

export const CITIES = ["Casablanca", "Rabat", "Marrakech", "Tanger", "Agadir", "Fès"];
export type Priority = "Haute" | "Moyenne" | "Basse";
export type QuoteStatus = "À préparer" | "Envoyé" | "En attente" | "Accepté" | "Refusé";
export const QUOTE_STATUSES: QuoteStatus[] = ["À préparer", "Envoyé", "En attente", "Accepté", "Refusé"];
export type PayStatus = "Payé" | "Partiellement payé" | "Non payé" | "En retard";
export const PAY_STATUSES: PayStatus[] = ["Payé", "Partiellement payé", "Non payé", "En retard"];
export const CLAIM_STATUSES = ["Déclaré", "Expert à affecter", "Expertise en cours", "Garage à affecter", "Réparation", "Règlement", "Clôturé"] as const;
export type ClaimStatus = (typeof CLAIM_STATUSES)[number];
export const EXPERT_STATUSES = ["Expert à affecter", "Expertise programmée", "Rapport attendu", "Rapport en préparation", "Rapport reçu"];
export const EXPERT_RESULTS = ["Pas de réponse", "Expert contacté", "Expertise programmée", "Rapport en préparation", "Rapport reçu"];
export const GARAGE_STATUSES = ["Garage à affecter", "Véhicule reçu", "Devis garage attendu", "Devis reçu", "Réparation en cours", "Véhicule prêt"];
export const GARAGE_RESULTS = ["Pas de réponse", "Véhicule reçu", "Devis garage attendu", "Devis reçu", "Réparation en cours", "Véhicule prêt"];
export const QUOTE_RESULTS = ["Pas de réponse", "Client contacté", "Rappel demandé", "Devis accepté", "Devis refusé"];
export const PAY_RESULTS = ["Pas de réponse", "Client contacté", "Promesse de paiement", "Paiement reçu"];
export const MISSING_RESULTS = ["Pas de réponse", "Client contacté", "Document promis"];
export const DOC_CATEGORIES = ["Constat", "Photos", "Carte grise", "CIN", "Rapport expert", "Devis garage", "Facture", "Autres documents"];
export const MISSING_TYPES = ["CIN manquante", "Carte grise manquante", "RIB manquant", "Adresse incorrecte", "Téléphone manquant", "Email manquant", "Attestation manquante", "Document véhicule manquant"];
export const PRODUCTS = ["Auto tous risques", "Auto tiers étendu", "Multirisque habitation", "Santé famille", "Assistance voyage", "Flotte entreprise", "RC professionnelle"];
export const CLAIM_TYPES = ["Collision", "Accrochage parking", "Bris de glace", "Vol", "Incendie"];

export interface TimelineEvent { date: Date; label: string }
export interface Follow { date: Date; result: string; comment: string; next?: Date }
export interface Client { id: string; name: string; phone: string; email: string; city: string; address: string }
export interface Quote { id: string; clientId: string; product: string; date: Date; amount: number; status: QuoteStatus; lastFollow?: Date; nextFollow?: Date; doc: string; history: TimelineEvent[] }
export interface Payment { id: string; clientId: string; contract: string; amount: number; paid: number; due: Date; lastFollow?: Date; nextFollow?: Date; timeline: TimelineEvent[] }
export interface Missing { id: string; clientId: string; info: string; since: Date; lastFollow?: Date; nextFollow?: Date; status: "En attente" | "Relancé" | "Complété" }
export interface Doc { id: string; name: string; category: string; date: Date }
export interface GarageQuote { id: string; garageId: string; date: Date; amount: number; status: "Reçu" | "Validé" | "Refusé"; doc: string }
export interface Claim {
  id: string; clientId: string; contract: string; type: string; date: Date; city: string; vehicle: string; plate: string; description: string; status: ClaimStatus; nextAction?: Date;
  expertId?: string; expertStatus: string; expertAssigned?: Date; expertLast?: Date; expertNext?: Date; expertFollows: Follow[];
  garageId?: string; garageStatus: string; garageAssigned?: Date; garageLast?: Date; garageNext?: Date; garageFollows: Follow[];
  garageQuotes: GarageQuote[]; docs: Doc[]; history: TimelineEvent[];
}
export interface Expert { id: string; name: string; cabinet: string; city: string; phone: string; email: string; address: string; specialty: string; status: "Actif" | "Inactif"; treated: number; avgDelay: number }
export interface Garage { id: string; name: string; city: string; address: string; phone: string; email: string; contact: string; vehicles: string; status: "Actif" | "Inactif"; treated: number; avgDelay: number }
export interface RuleStep { label: string; value: number; unit: "Jour" | "Heure" }
export interface Rule { key: string; title: string; condition: string; enabled: boolean; steps: RuleStep[] }
export interface Cabinet { name: string; logo?: string; address: string; city: string; phone: string; email: string; manager: string; ice: string }

/** Payment status rule: fully paid → Payé; partially → Partiellement payé; nothing paid & past due → En retard; else Non payé. */
export const payStatus = (p: Pick<Payment, "amount" | "paid" | "due">): PayStatus =>
  p.paid >= p.amount ? "Payé" : p.paid > 0 ? "Partiellement payé" : diffDays(p.due) < 0 ? "En retard" : "Non payé";

/** Next claim number, format SIN-2026-00128. */
export const nextClaimId = (claims: { id: string }[]) => {
  const max = claims.reduce((m, c) => Math.max(m, Number(c.id.split("-")[2]) || 0), 0);
  return `SIN-${TODAY.getFullYear()}-${String(max + 1).padStart(5, "0")}`;
};

// ---------- seeded generator ----------
let seed = 7;
const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const ri = (a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const two = () => String(ri(10, 99));
const phone = (pre = "06") => `${pre} ${two()} ${two()} ${two()} ${two()}`;
const slug = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "");
const STREETS = ["Rue Ibn Sina", "Bd Zerktouni", "Av. Mohammed V", "Rue Moulay Youssef", "Av. Hassan II", "Rue Allal Ben Abdellah", "Bd Abdelmoumen", "Rue Oued Fès"];

const NAMES = ["Mohamed Amrani", "Sara Alaoui", "Youssef Benali", "Fatima Zahra Idrissi", "Karim Tazi", "Nadia Berrada", "Omar Chraibi", "Salma Bennani", "Hamza El Fassi", "Imane Lahlou", "Rachid Ouazzani", "Khadija Sefrioui", "Mehdi Kettani", "Laila Benjelloun", "Anas Mansouri", "Houda Saadi", "Adil Naciri", "Zineb Filali", "Yassine Hajji", "Meryem Alami", "Tarik Bouzid", "Siham Raji", "Ayoub Zerouali", "Ghita Squalli", "Brahim Ait Lahcen", "Asmae Kabbaj", "Nabil Guessous", "Hind Cherkaoui", "Soufiane Rami", "Kenza Belkadi"];

export const CLIENTS: Client[] = NAMES.map((name, i) => {
  const city = i < 3 ? ["Casablanca", "Rabat", "Casablanca"][i] : CITIES[i % 6];
  return { id: `CL-${1001 + i}`, name, phone: phone(i % 3 ? "06" : "07"), email: `${slug(name)}@gmail.com`, city, address: `${ri(3, 180)} ${STREETS[i % 8]}, ${city}` };
});

const EXP_RAW: [string, string, string, string, "Actif" | "Inactif", number, number][] = [
  ["Hicham Bennis", "Cabinet Expertise Atlas", "Casablanca", "Automobile", "Actif", 12, 1.5],
  ["Rachid Lamrani", "Expertise Maroc", "Casablanca", "Automobile", "Actif", 8, 2],
  ["Samira Ouali", "Cabinet Anfa Experts", "Casablanca", "Poids lourds", "Actif", 15, 2.5],
  ["Driss Benkirane", "Cabinet Al Amane Expertise", "Rabat", "Automobile", "Actif", 10, 1.8],
  ["Latifa Mernissi", "Bouregreg Expertise", "Rabat", "Bris de glace", "Actif", 6, 1.2],
  ["Abdelkader Tahiri", "Cabinet Menara Expertise", "Marrakech", "Automobile", "Actif", 9, 2.2],
  ["Mustapha Rifi", "Atlas Sud Expertise", "Marrakech", "Incendie", "Inactif", 3, 3],
  ["Jamal Tangi", "Détroit Expertise", "Tanger", "Automobile", "Actif", 7, 2],
  ["Aziz Soussi", "Expert Auto Souss", "Agadir", "Automobile", "Actif", 5, 2.4],
  ["Noureddine Fassi", "Cabinet Zalagh Expertise", "Fès", "Automobile", "Actif", 8, 1.9],
];
export const EXPERTS: Expert[] = EXP_RAW.map(([name, cabinet, city, specialty, status, treated, avgDelay], i) => ({
  id: `EXP-${101 + i}`, name, cabinet, city, specialty, status, treated, avgDelay, phone: phone("06"), email: `contact@${slug(cabinet).replace(/\./g, "-")}.ma`, address: `${ri(5, 120)} ${STREETS[(i + 3) % 8]}, ${city}`,
}));

const GAR_RAW: [string, string, string, string, number, number][] = [
  ["Garage Atlas Auto", "Casablanca", "Said Moujahid", "Tourisme, SUV", 18, 6],
  ["Garage Premium Car", "Casablanca", "Yassir Alaoui", "Tourisme, Premium", 11, 5],
  ["Garage Salam Auto", "Casablanca", "Mounir Haddad", "Tourisme, Utilitaires", 9, 7],
  ["Garage Maarif Service", "Casablanca", "Hafid Bakkali", "Tourisme", 6, 8],
  ["Garage Auto Premium", "Rabat", "Karim Amraoui", "Tourisme, SUV, Premium", 14, 5],
  ["Garage Agdal Motors", "Rabat", "Ilyas Bouziane", "Tourisme", 7, 6],
  ["Garage Hassan Mécanique", "Rabat", "Hassan Idrissi", "Utilitaires, Poids lourds", 5, 9],
  ["Marrakech Motors", "Marrakech", "Reda Chafik", "Tourisme, SUV", 10, 6],
  ["Garage Oasis Auto", "Marrakech", "Younes Kadiri", "Tourisme", 4, 7],
  ["Tanger Auto Service", "Tanger", "Bilal Amrani", "Tourisme, Utilitaires", 8, 6],
  ["Garage Al Bahr", "Tanger", "Adnane Sbai", "Tourisme", 5, 8],
  ["Agadir Car Center", "Agadir", "Lahcen Ait Brahim", "Tourisme, SUV", 7, 7],
  ["Souss Auto Réparation", "Agadir", "Omar Belghiti", "Tourisme, Moto", 3, 9],
  ["Garage Fès Mécanique", "Fès", "Hamid Tazi", "Tourisme", 6, 7],
  ["Garage Saïss Auto", "Fès", "Anouar Berrada", "Tourisme, Utilitaires", 4, 8],
];
export const GARAGES: Garage[] = GAR_RAW.map(([name, city, contact, vehicles, treated, avgDelay], i) => ({
  id: `GAR-${101 + i}`, name, city, contact, vehicles, treated, avgDelay, status: i === 8 ? "Inactif" : "Actif", phone: phone("05"), email: `atelier@${slug(name).replace(/\./g, "-")}.ma`, address: `${ri(5, 220)} ${STREETS[(i + 5) % 8]}, ${city}`,
}));

const QS: QuoteStatus[] = ["En attente", "Envoyé", "À préparer", "Accepté", "En attente", "Refusé", "Envoyé", "Accepté", "En attente", "Envoyé"];
export const QUOTES: Quote[] = Array.from({ length: 20 }, (_, i) => {
  const status = QS[i % 10];
  const date = i === 0 ? d(-5) : d(-ri(2, 20));
  const open = status === "Envoyé" || status === "En attente";
  const id = `DEV-2026-${String(41 + i).padStart(3, "0")}`;
  const lastFollow = i === 0 ? d(-4) : open ? addDays(date, 1) : undefined;
  const nextFollow = i === 0 ? d(0) : open ? d(ri(-3, 3)) : status === "À préparer" ? d(1) : undefined;
  const history: TimelineEvent[] = [{ date, label: `Devis ${id} ajouté` }];
  if (status !== "À préparer") history.push({ date, label: "Devis envoyé au client" });
  if (lastFollow) history.push({ date: lastFollow, label: "Relance effectuée" });
  if (status === "Accepté" || status === "Refusé") history.push({ date: addDays(date, 1), label: `Devis ${status.toLowerCase()} par le client` });
  return { id, clientId: CLIENTS[i === 0 ? 0 : (i * 7) % 30].id, product: PRODUCTS[i % 7], date, amount: ri(18, 140) * 100, status, lastFollow, nextFollow, doc: `devis-${id}.pdf`, history };
});

const PAY_FR = [0, 0.625, 0, 1, 0.5, 0, 1, 0.3, 0, 1];
const CTR = ["AUTO", "HAB", "SANTE", "AUTO", "RC"];
export const PAYMENTS: Payment[] = Array.from({ length: 20 }, (_, i) => {
  const amount = i === 0 ? 4200 : i === 1 ? 8000 : ri(15, 120) * 100;
  const paid = i === 0 ? 0 : i === 1 ? 5000 : Math.round((amount * PAY_FR[i % 10]) / 100) * 100;
  const due = i === 0 ? d(-5) : i === 1 ? d(-3) : d(ri(-15, 20));
  const done = paid >= amount;
  const late = diffDays(due) < 0 && !done;
  const lastFollow = late ? d(Math.max(diffDays(due) + 1, -2)) : undefined;
  const nextFollow = done ? undefined : late ? (i === 0 ? d(0) : d(ri(-2, 2))) : addDays(due, 1);
  const timeline: TimelineEvent[] = [{ date: addDays(due, -14), label: "Échéance créée" }];
  if (paid > 0 && !done) timeline.push({ date: addDays(due, -2), label: `Paiement partiel reçu : ${dh(paid)}` });
  if (done) timeline.push({ date: addDays(due, -1), label: "Paiement reçu" });
  if (lastFollow) timeline.push({ date: lastFollow, label: "Relance envoyée" });
  if (late) timeline.push({ date: TODAY, label: paid > 0 ? "Solde toujours non réglé" : "Toujours non payé" });
  return { id: `PAY-${201 + i}`, clientId: CLIENTS[i === 0 ? 1 : (i * 11 + 1) % 30].id, contract: `${CTR[i % 5]}-${ri(10000, 99999)}`, amount, paid, due, lastFollow, nextFollow, timeline };
});

export const MISSING: Missing[] = Array.from({ length: 12 }, (_, i) => ({
  id: `INF-${101 + i}`, clientId: CLIENTS[(i * 5 + 3) % 30].id, info: MISSING_TYPES[i % 8], since: d(-ri(2, 25)),
  lastFollow: i % 3 ? d(-ri(1, 2)) : undefined, nextFollow: i === 11 ? undefined : d(ri(-2, 3)), status: i === 11 ? "Complété" : i % 3 ? "Relancé" : "En attente",
}));

const SEQ = [2, 2, 4, 1, 4, 3, 0, 2, 4, 5, 6, 2, 4, 1, 3, 4, 6, 2, 5, 0, 4, 2, 6, 4, 1];
const VEH = ["Dacia Logan", "Renault Clio", "Peugeot 208", "Hyundai Tucson", "Toyota Yaris", "Volkswagen Golf", "Kia Sportage", "Dacia Duster", "Fiat Tipo", "Skoda Octavia"];
const DESC = ["Choc arrière à un feu rouge", "Rayure et porte enfoncée sur parking", "Pare-brise fissuré sur autoroute", "Véhicule forcé pendant la nuit", "Début d’incendie compartiment moteur"];
export const CLAIMS: Claim[] = SEQ.map((si, i) => {
  const client = CLIENTS[i === 0 ? 2 : (i * 7 + 2) % 30];
  const city = client.city;
  const status = CLAIM_STATUSES[si];
  const date = i === 0 ? d(-6) : d(-(3 + si * 4 + ri(0, 4)));
  const exps = EXPERTS.filter((e) => e.city === city && e.status === "Actif");
  const gars = GARAGES.filter((g) => g.city === city && g.status === "Actif");
  const hasExpert = si >= 2, hasGarage = si >= 4;
  const expert = hasExpert ? (i === 0 ? EXPERTS[0] : exps[i % exps.length]) : undefined;
  const garage = hasGarage ? gars[i % gars.length] : undefined;
  const expertAssigned = hasExpert ? addDays(date, 1) : undefined;
  const expertStatus = !hasExpert ? "Expert à affecter" : si === 2 ? (i === 0 ? "Rapport attendu" : ["Expertise programmée", "Rapport attendu", "Rapport en préparation"][i % 3]) : "Rapport reçu";
  const expertLast = si === 2 ? (i === 0 ? d(-2) : d(-ri(1, 3))) : hasExpert ? addDays(date, 3) : undefined;
  const expertNext = si === 2 ? (i === 0 ? d(0) : d(ri(-2, 2))) : undefined;
  const garageStatus = !hasGarage ? "Garage à affecter" : si === 4 ? ["Véhicule reçu", "Devis garage attendu", "Devis reçu", "Réparation en cours", "Devis garage attendu"][i % 5] : "Véhicule prêt";
  const garageAssigned = hasGarage ? addDays(date, 5) : undefined;
  const garageLast = hasGarage ? d(-ri(1, 4)) : undefined;
  const garageNext = si === 4 ? d(ri(-2, 2)) : undefined;
  const garageQuotes: GarageQuote[] = garage && ["Devis reçu", "Réparation en cours", "Véhicule prêt"].includes(garageStatus)
    ? [{ id: `DG-${i}`, garageId: garage.id, date: addDays(date, 7), amount: ri(30, 180) * 100, status: garageStatus === "Devis reçu" ? "Reçu" : "Validé", doc: `devis-garage-${i + 101}.pdf` }] : [];
  const docs: Doc[] = [
    { id: `d${i}a`, name: "constat-amiable.pdf", category: "Constat", date },
    { id: `d${i}b`, name: "photos-sinistre.jpg", category: "Photos", date },
    { id: `d${i}c`, name: "cin-recto-verso.pdf", category: "CIN", date },
  ];
  if (i % 4 !== 1) docs.push({ id: `d${i}d`, name: "carte-grise.pdf", category: "Carte grise", date });
  if (expertStatus === "Rapport reçu" && expertLast) docs.push({ id: `d${i}e`, name: `rapport-expertise-${i + 101}.pdf`, category: "Rapport expert", date: expertLast });
  garageQuotes.forEach((q) => docs.push({ id: `d${i}f`, name: q.doc, category: "Devis garage", date: q.date }));
  if (si >= 5) docs.push({ id: `d${i}g`, name: "facture-reparation.pdf", category: "Facture", date: d(-3) });
  const history: TimelineEvent[] = [{ date, label: "Sinistre déclaré" }];
  if (expert && expertAssigned) history.push({ date: expertAssigned, label: `Expert affecté : ${expert.cabinet}` });
  if (expertStatus === "Rapport reçu" && expertLast) history.push({ date: expertLast, label: "Rapport d’expertise reçu" });
  if (garage && garageAssigned) history.push({ date: garageAssigned, label: `Garage affecté : ${garage.name}` });
  garageQuotes.forEach((q) => history.push({ date: q.date, label: `Devis garage reçu : ${dh(q.amount)}` }));
  if (si >= 6) history.push({ date: d(-2), label: "Sinistre clôturé" });
  return {
    id: `SIN-2026-${String(101 + i).padStart(5, "0")}`, clientId: client.id, contract: `AUTO-${ri(10000, 99999)}`, type: CLAIM_TYPES[i % 5], date, city,
    vehicle: VEH[i % 10], plate: `${ri(10000, 99999)}-${"ABDHW"[i % 5]}-${ri(1, 80)}`, description: DESC[i % 5], status,
    nextAction: si <= 1 || si === 3 ? d(ri(-1, 1)) : undefined,
    expertId: expert?.id, expertStatus, expertAssigned, expertLast, expertNext, expertFollows: [],
    garageId: garage?.id, garageStatus, garageAssigned, garageLast, garageNext, garageFollows: [], garageQuotes, docs, history,
  };
});

export const CABINET: Cabinet = { name: "Cabinet Atlas Assurances", address: "45 Boulevard d’Anfa", city: "Casablanca", phone: "05 22 47 85 10", email: "contact@atlas-assurances.ma", manager: "Salma Idrissi", ice: "001528745000062" };

export const RULES: Rule[] = [
  { key: "devis", title: "Devis", condition: "Tant que le devis n’est ni accepté ni refusé.", enabled: true, steps: [{ label: "Première relance (après envoi)", value: 2, unit: "Jour" }, { label: "Deuxième relance (après envoi)", value: 5, unit: "Jour" }, { label: "Troisième relance (après envoi)", value: 10, unit: "Jour" }] },
  { key: "paiements", title: "Paiements", condition: "Tant que la prime n’est pas entièrement réglée.", enabled: true, steps: [{ label: "Première relance (après échéance)", value: 1, unit: "Jour" }, { label: "Deuxième relance (après échéance)", value: 5, unit: "Jour" }, { label: "Troisième relance (après échéance)", value: 10, unit: "Jour" }] },
  { key: "infos", title: "Informations manquantes", condition: "Tant que l’information n’est pas reçue.", enabled: true, steps: [{ label: "Première relance", value: 2, unit: "Jour" }, { label: "Deuxième relance", value: 5, unit: "Jour" }] },
  { key: "experts", title: "Experts", condition: "Tant que le rapport expert n’est pas reçu.", enabled: true, steps: [{ label: "Relance automatique recommandée : tous les", value: 2, unit: "Jour" }] },
  { key: "garages", title: "Garagistes", condition: "Tant que le devis garage n’est pas reçu ou que la réparation n’est pas terminée.", enabled: true, steps: [{ label: "Relance recommandée : tous les", value: 2, unit: "Jour" }] },
];
