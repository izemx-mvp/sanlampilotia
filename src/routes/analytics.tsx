import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, CreditCard, FileText, FileWarning, Hourglass, Users, Wrench, UserRoundCheck, Car, FolderCheck } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/app/Shell";
import { Card, PageHeader, Stat } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { buildActions } from "@/lib/actions";
import { payStatus } from "@/lib/data";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/analytics")({ head: pageHead("Analytics", "Indicateurs essentiels du suivi client et des sinistres."), component: Analytics });

const C = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-6)", "var(--chart-5)", "var(--chart-3)"];
const tip = { contentStyle: { borderRadius: 12, border: "1px solid var(--border)", fontSize: 12 } };

function Analytics() {
  const s = useStore();
  const items = buildActions(s);
  const ps = s.payments.map(payStatus);
  const grp = (f: (st: string) => boolean) => s.claims.filter((c) => f(c.status)).length;
  const donut = [
    { name: "Déclaré", v: grp((x) => x === "Déclaré" || x === "Expert à affecter") }, { name: "Expertise", v: grp((x) => x === "Expertise en cours") },
    { name: "Garage", v: grp((x) => x === "Garage à affecter") }, { name: "Réparation", v: grp((x) => x === "Réparation") },
    { name: "Règlement", v: grp((x) => x === "Règlement") }, { name: "Clôturé", v: grp((x) => x === "Clôturé") },
  ];
  const pay = (["Payé", "Partiellement payé", "Non payé", "En retard"] as const).map((n) => ({ name: n, v: ps.filter((x) => x === n).length }));
  const monthly = [{ m: "Mai", n: 9, c: 7 }, { m: "Juin", n: 12, c: 8 }, { m: "Juil.", n: 15, c: 11 }, { m: "Août", n: 18, c: 13 }, { m: "Sept.", n: 14, c: 15 }, { m: "Oct.", n: s.claims.filter((c) => c.date.getMonth() === 9).length, c: grp((x) => x === "Clôturé") }];
  const top = (kind: "e" | "g") => (kind === "e" ? s.experts : s.garages).map((p) => ({ name: "cabinet" in p ? p.cabinet : p.name, v: s.claims.filter((c) => (kind === "e" ? c.expertId : c.garageId) === p.id).length + p.treated })).sort((a, b) => b.v - a.v).slice(0, 5);
  const avg = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1).replace(".", ",");
  return (
    <Shell>
      <PageHeader eyebrow="Pilotage" title="Analytics" subtitle="Uniquement les indicateurs essentiels." />
      <h2 className="mb-3 text-lg font-semibold">Suivi Client</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Clients suivis" value={s.clients.length} icon={Users} />
        <Stat label="Devis en attente" value={s.quotes.filter((q) => q.status === "Envoyé" || q.status === "En attente").length} icon={FileText} tone="warning" delay={0.03} />
        <Stat label="Devis acceptés" value={s.quotes.filter((q) => q.status === "Accepté").length} icon={CheckCircle2} tone="success" delay={0.06} />
        <Stat label="Paiements non réglés" value={ps.filter((x) => x !== "Payé").length} icon={CreditCard} tone="warning" delay={0.09} />
        <Stat label="Paiements en retard" value={ps.filter((x) => x === "En retard").length} icon={AlertTriangle} tone="destructive" delay={0.12} />
        <Stat label="Informations manquantes" value={s.missing.filter((m) => m.status !== "Complété").length} icon={FileWarning} tone="cyan" delay={0.15} />
      </div>
      <h2 className="mb-3 mt-6 text-lg font-semibold">Sinistres</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Sinistres ouverts" value={s.claims.filter((c) => c.status !== "Clôturé").length} icon={Car} tone="navy" />
        <Stat label="Sinistres clôturés" value={grp((x) => x === "Clôturé")} icon={FolderCheck} tone="success" delay={0.03} />
        <Stat label="Experts à relancer" value={items.filter((i) => i.target === "Expert").length} icon={UserRoundCheck} tone="cyan" delay={0.06} />
        <Stat label="Garages à relancer" value={items.filter((i) => i.target === "Garage").length} icon={Wrench} tone="warning" delay={0.09} />
        <Stat label="Rapports experts en attente" value={s.claims.filter((c) => c.expertId && c.expertStatus !== "Rapport reçu").length} icon={Hourglass} tone="primary" delay={0.12} />
        <Stat label="Devis garages en attente" value={s.claims.filter((c) => c.garageId && !c.garageQuotes.length).length} icon={ClipboardList} tone="destructive" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Card className="p-5"><h3 className="mb-2 font-semibold">Sinistres par statut</h3>
          <ResponsiveContainer width="100%" height={260}><PieChart><Pie data={donut} dataKey="v" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>{donut.map((_, i) => <Cell key={i} fill={C[i]} />)}</Pie><Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="mb-2 font-semibold">Paiements</h3>
          <ResponsiveContainer width="100%" height={260}><BarChart data={pay}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip {...tip} /><Bar dataKey="v" name="Paiements" radius={[8, 8, 0, 0]}>{pay.map((_, i) => <Cell key={i} fill={["var(--chart-3)", "var(--chart-4)", "var(--chart-1)", "var(--chart-5)"][i]} />)}</Bar></BarChart></ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="mb-2 font-semibold">Évolution des sinistres</h3>
          <ResponsiveContainer width="100%" height={260}><LineChart data={monthly}><CartesianGrid vertical={false} stroke="var(--border)" /><XAxis dataKey="m" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 12 }} /><Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} /><Line dataKey="n" name="Nouveaux sinistres" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4 }} /><Line dataKey="c" name="Sinistres clôturés" stroke="var(--chart-3)" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="mb-4 font-semibold">Délais moyens</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {([["Expertise", avg(s.experts.map((e) => e.avgDelay))], ["Réparation", avg(s.garages.map((g) => g.avgDelay))], ["Clôture sinistre", "18,5"]] as [string, string][]).map(([l, v]) => <div key={l} className="rounded-xl bg-surface-2 p-4"><p className="text-xs text-muted-foreground">Délai moyen {l.toLowerCase()}</p><p className="mt-1 font-display text-2xl font-semibold">{v} j</p></div>)}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {([["Experts les plus sollicités", top("e")], ["Garages les plus sollicités", top("g")]] as const).map(([t, list]) => (
              <div key={t}><p className="mb-2 text-sm font-semibold">{t}</p>{list.map((x, i) => <div key={x.name} className="mb-2"><div className="flex justify-between text-xs"><span>{i + 1}. {x.name}</span><b>{x.v}</b></div><div className="mt-1 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-primary" style={{ width: `${(x.v / (list[0]?.v || 1)) * 100}%` }} /></div></div>)}</div>
            ))}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
