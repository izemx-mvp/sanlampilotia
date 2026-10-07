import { useState } from "react";
import { toast } from "sonner";
import { Badge, Btn, Field, Modal, ProgressBar, Timeline, inputCls } from "./ui";
import { useStore } from "@/lib/store";
import { dh, fmtFull, payStatus } from "@/lib/data";

export function PaymentModal({ id, onClose, onFollow }: { id?: string; onClose: () => void; onFollow: (id: string) => void }) {
  const s = useStore();
  const [amt, setAmt] = useState("");
  const p = s.payments.find((x) => x.id === id);
  const c = p && s.clients.find((x) => x.id === p.clientId);
  return (
    <Modal open={!!p} onClose={onClose} title={`Paiement ${p?.contract ?? ""}`} description={c ? `${c.name} · ${c.phone}` : ""}>
      {p && <>
        <div className="rounded-xl bg-surface-2 p-4">
          <div className="mb-2 flex items-center justify-between"><Badge s={payStatus(p)} /><span className="text-xs text-muted-foreground">Échéance {fmtFull(p.due)}</span></div>
          <ProgressBar value={(p.paid / p.amount) * 100} className="h-3" />
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm"><p>Total<br /><b>{dh(p.amount)}</b></p><p>Payé<br /><b className="text-success">{dh(p.paid)}</b></p><p>Reste<br /><b className="text-destructive">{dh(p.amount - p.paid)}</b></p></div>
        </div>
        <div><p className="mb-2 text-sm font-semibold">Timeline de suivi</p><Timeline events={p.timeline} /></div>
        {p.paid < p.amount && <div className="flex flex-wrap items-end gap-2">
          <Field label="Enregistrer un paiement (DH)" className="flex-1"><input type="number" className={inputCls} value={amt} onChange={(e) => setAmt(e.target.value)} placeholder={String(p.amount - p.paid)} /></Field>
          <Btn variant="success" onClick={() => { const n = Number(amt || p.amount - p.paid); s.addPayment(p.id, n); setAmt(""); toast.success(`Paiement de ${dh(n)} enregistré`); }}>Enregistrer</Btn>
          <Btn variant="primary" onClick={() => onFollow(p.id)}>Ajouter une relance</Btn>
        </div>}
      </>}
    </Modal>
  );
}
