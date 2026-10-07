import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Background } from "@/components/app/Shell";
import { Button } from "@/components/app/ui";
import { pageHead } from "@/lib/head";
import illu from "@/assets/login-illustration.jpg";

export const Route = createFileRoute("/login")({ head: pageHead("Connexion", "Pilotez vos clients et vos sinistres depuis une seule interface."), component: Login });

function Login() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("salma.idrissi@cabinet.ma");
  const [pwd, setPwd] = useState("demo1234");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Background />
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-glow"><ShieldCheck className="h-5 w-5 text-primary-foreground" /></div><p className="font-display text-lg font-semibold">Pilot<span className="text-gradient">IA</span></p></div>
        <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} src={illu} alt="" className="mx-auto w-[70%] max-w-md rounded-[2rem] opacity-90 [mask-image:radial-gradient(circle,black_55%,transparent_75%)]" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="max-w-lg text-4xl font-semibold leading-tight">Pilotez vos clients et vos sinistres depuis <span className="text-gradient">une seule interface.</span></h1>
          <p className="mt-4 max-w-md text-muted-foreground">Vos Agents IA identifient les dossiers à relancer et les prochaines actions à réaliser.</p>
        </motion.div>
      </div>
      <div className="flex items-center justify-center p-6">
        <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} onSubmit={(e) => { e.preventDefault(); setLoading(true); setTimeout(() => nav({ to: "/" }), 900); }} className="glass w-full max-w-md rounded-3xl p-8">
          <h2 className="text-2xl font-semibold">Connexion</h2>
          <p className="mt-1 text-sm text-muted-foreground">Accédez à votre cockpit opérationnel.</p>
          <label className="mt-6 block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <label className="mt-4 block text-sm font-medium">Mot de passe</label>
          <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} required className="mt-1.5 h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" defaultChecked className="accent-primary" />Mémoriser ma connexion</label>
            <button type="button" onClick={() => toast("Lien de réinitialisation envoyé", { description: email })} className="text-primary hover:underline">Mot de passe oublié ?</button>
          </div>
          <Button variant="primary" className="mt-6 h-11 w-full" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}</Button>
        </motion.form>
      </div>
    </div>
  );
}
