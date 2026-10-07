import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart } from "recharts";
import { Shell } from "@/components/app/Shell";
import { Avatar, Card, Counter, PageHeader, Progress, Tabs } from "@/components/app/ui";
import { useStore } from "@/lib/store";
import { STAGES, OPERATORS } from "@/lib/mock";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/analytics")({ head: pageHead("Analytics", "Indicateurs de relance, sinistres bloqués et performance des opérateurs."), component: Analytics });

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--info)", "var(--cyan)", "var(--muted-foreground)"];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--foreground)" } };

function Analytics() {
  const { claims } = useStore();
  const [period, setPeriod] = useState("semaine");
  const relances = period === "semaine" ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map((d, i) => ({ d, v: [14, 18, 12, 21, 16, 6][i] })) : ["S1", "S2", "S3", "S4"].map((d, i) => ({ d, v: [62, 74, 58, 81][i] }));
  const stages = STAGES.map((s) => ({ name: s, value: claims.filter((c) => c.stage === s).length }));
  const blocked = [{ m: "Expert", v: 9 }, { m: "Garage", v: 7 }, { m: "Client", v: 4 }, { m: "Règlement", v: 5 }, { m: "Documents", v: 3 }];
  return (
    <Shell>
      <PageHeader title="Analytics" subtitle="Vue consolidée de l’activité du cabinet." />
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-5"><p className="text-xs text-muted-foreground">Délai moyen de traitement</p><p className="mt-2 font-display text-3xl font-semibold"><Counter to={4.8} decimals={1} /> j</p><p className="text-xs text-success">-0,6 j vs mois dernier</p></Card>
        <Card className="p-5" delay={0.05}><p className="text-xs text-muted-foreground">Sinistres actifs</p><p className="mt-2 font-display text-3xl font-semibold"><Counter to={claims.filter((c) => c.stage !== "Clôturé").length} /></p></Card>
        <Card className="p-5" delay={0.1}><p className="text-xs text-muted-foreground">Relances automatiques IA</p><p className="mt-2 font-display text-3xl font-semibold text-gradient"><Counter to={68} suffix=" %" /></p><div className="mt-2"><Progress value={68} /></div></Card>
        <Card className="p-5" delay={0.15}><p className="text-xs text-muted-foreground">Relances manuelles</p><p className="mt-2 font-display text-3xl font-semibold"><Counter to={32} suffix=" %" /></p><div className="mt-2"><Progress value={32} tone="bg-warning" /></div></Card>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Dossiers clients à relancer</h3><Tabs value={period} onChange={setPeriod} tabs={[{ id: "semaine", label: "Semaine" }, { id: "mois", label: "Mois" }]} /></div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={relances}><defs><linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><Tooltip {...tip} />
              <Area type="monotone" dataKey="v" name="Relances" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#ar)" /></AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card className="p-5" delay={0.05}>
          <h3 className="mb-4 font-semibold">Sinistres actifs par étape</h3>
          <div className="grid items-center gap-4 sm:grid-cols-2">
            <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={stages} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={3} stroke="none">{stages.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer>
            <ul className="space-y-1.5 text-xs">{stages.map((s, i) => <li key={s.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} /><span className="flex-1 text-muted-foreground">{s.name}</span><span className="font-semibold">{s.value}</span></li>)}</ul>
          </div>
        </Card>
        <Card className="p-5" delay={0.1}>
          <h3 className="mb-4 font-semibold">Sinistres bloqués par motif</h3>
          <ResponsiveContainer width="100%" height={240}><BarChart data={blocked}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><Tooltip {...tip} cursor={{ fill: "var(--accent)" }} /><Bar dataKey="v" name="Dossiers" radius={[8, 8, 0, 0]}>{blocked.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Bar></BarChart></ResponsiveContainer>
        </Card>
        <Card className="p-5" delay={0.15}>
          <h3 className="mb-4 font-semibold">Performance des opérateurs</h3>
          <table className="w-full text-sm"><thead className="text-left text-[11px] uppercase tracking-wider text-muted-foreground"><tr><th className="pb-2">Opérateur</th><th className="pb-2">Traités</th><th className="pb-2">Relances</th><th className="pb-2">Délai</th><th className="pb-2">Clôturés</th></tr></thead>
            <tbody>{OPERATORS.map((o, i) => <tr key={o} className="border-t border-border"><td className="py-3"><div className="flex items-center gap-2"><Avatar name={o} size={26} />{o}</div></td><td>{[48, 41, 37, 29][i]}</td><td>{[112, 96, 88, 71][i]}</td><td>{["3,9 j", "4,4 j", "5,1 j", "5,6 j"][i]}</td><td>{[22, 19, 17, 12][i]}</td></tr>)}</tbody></table>
        </Card>
      </div>
    </Shell>
  );
}
