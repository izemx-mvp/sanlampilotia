import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Shell } from "@/components/app/Shell";
import { Button, Card, PageHeader } from "@/components/app/ui";
import { cn } from "@/lib/utils";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/parametres")({ head: pageHead("Paramètres", "Réglages des Agents IA, sources de données et notifications."), component: Parametres });

function Toggle({ on, set }: { on: boolean; set: (b: boolean) => void }) {
  return <button onClick={() => set(!on)} className={cn("relative h-6 w-11 rounded-full transition-colors", on ? "bg-primary" : "bg-muted")}><span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all", on ? "left-[22px]" : "left-0.5")} /></button>;
}

function Parametres() {
  const [s, setS] = useState({ auto: true, wa: true, email: true, digest: false, sinistre: true });
  const [delay, setDelay] = useState(48);
  const row = (k: keyof typeof s, l: string, d: string) => <div className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium">{l}</p><p className="text-xs text-muted-foreground">{d}</p></div><Toggle on={s[k]} set={(b) => setS({ ...s, [k]: b })} /></div>;
  return (
    <Shell>
      <PageHeader title="Paramètres" subtitle="Configurez le comportement de vos Agents IA."><Link to="/login"><Button size="sm" variant="ghost">Se déconnecter</Button></Link></PageHeader>
      <div className="grid max-w-4xl gap-5 lg:grid-cols-2">
        <Card className="divide-y divide-border p-5">
          <h3 className="pb-2 font-semibold">Agents IA</h3>
          {row("auto", "Relances automatiques", "L’agent envoie les rappels de faible priorité sans validation.")}
          {row("sinistre", "Analyse sinistres en continu", "Synchronisation toutes les 15 minutes.")}
          <div className="py-3"><p className="text-sm font-medium">Délai avant relance prospect : {delay} h</p><input type="range" min={12} max={120} step={12} value={delay} onChange={(e) => setDelay(+e.target.value)} className="mt-2 w-full accent-primary" /></div>
        </Card>
        <Card className="divide-y divide-border p-5">
          <h3 className="pb-2 font-semibold">Canaux & notifications</h3>
          {row("wa", "WhatsApp", "Autoriser les relances WhatsApp.")}
          {row("email", "Email", "Autoriser les relances email.")}
          {row("digest", "Résumé quotidien", "Recevoir un récapitulatif à 8h.")}
        </Card>
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-3 font-semibold">Sources de données connectées</h3>
          <div className="grid gap-3 md:grid-cols-3">{["Outil clients & prospects", "Outil sinistres SANLAM", "Fichier Excel de suivi (import)"].map((x) => <div key={x} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 p-3 text-sm">{x}<span className="text-xs text-success">● Synchronisé</span></div>)}</div>
        </Card>
      </div>
      <Button variant="primary" className="mt-5" onClick={() => toast.success("Paramètres enregistrés")}>Enregistrer</Button>
    </Shell>
  );
}
