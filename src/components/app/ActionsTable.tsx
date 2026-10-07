import { useNavigate } from "@tanstack/react-router";
import type { ActionItem } from "@/lib/actions";
import { Avatar, Badge, NextDate, Phone, Prio, Table, rowCls, td } from "./ui";
import { cn } from "@/lib/utils";

const KIND: Record<string, string> = { Devis: "bg-primary/10 text-primary", Paiement: "bg-warning/12 text-warning", "Info manquante": "bg-cyan/15 text-cyan", Sinistre: "bg-navy/10 text-navy" };

export function ActionsTable({ items }: { items: ActionItem[] }) {
  const nav = useNavigate();
  const open = (i: ActionItem) => (i.claimId ? nav({ to: "/sinistres/$id", params: { id: i.claimId } }) : nav({ to: "/clients/$id", params: { id: i.clientId } }));
  return (
    <Table head={["Client", "Type", "Motif", "Dernière action", "Prochaine relance", "Statut", "Priorité"]} empty={!items.length}>
      {items.map((i) => (
        <tr key={i.key} onClick={() => open(i)} className={rowCls}>
          <td className={td}>
            <div className="flex items-center gap-3"><Avatar name={i.clientName} /><div className="min-w-0"><p className="font-semibold">{i.clientName}</p><Phone n={i.contact.phone} label={i.target !== "Client" ? i.contact.name : undefined} /></div></div>
          </td>
          <td className={td}><span className={cn("whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold", KIND[i.kind])}>{i.kind}{i.target !== "Client" ? ` · ${i.target}` : ""}</span></td>
          <td className={cn(td, "min-w-[220px]")}><p className="font-medium">{i.motif}</p>{i.claimId && <p className="text-xs text-muted-foreground">{i.claimId}</p>}</td>
          <td className={cn(td, "whitespace-nowrap text-muted-foreground")}>{i.lastLabel}</td>
          <td className={td}><NextDate d={i.next} /></td>
          <td className={td}><Badge s={i.status} /></td>
          <td className={td}><Prio p={i.priority} /></td>
        </tr>
      ))}
    </Table>
  );
}
