import { useMemo, useRef, useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit, type PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { useStore } from "@/lib/store";
import { buildActions } from "@/lib/actions";
import { fmt, TODAY } from "@/lib/data";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Qui dois-je relancer en priorité aujourd'hui ?",
  "Quels paiements sont en retard ?",
  "Quels sinistres attendent un rapport d'expert ?",
  "Rédige un SMS de relance pour un devis en attente",
];

function useContext() {
  const s = useStore();
  return useMemo(() => {
    const name = (id: string) => s.clients.find((c) => c.id === id)?.name ?? id;
    const actions = buildActions(s).map((a) => ({ type: a.kind, client: a.clientName, sinistre: a.claimId, ville: a.city, motif: a.motif, dernier: a.lastLabel, prochaine: fmt(a.next), priorite: a.priority, contact: `${a.contact.name} ${a.contact.phone}` }));
    return JSON.stringify({
      aujourdhui: fmt(TODAY) + "/2026",
      actions,
      clients: s.clients.map((c) => ({ id: c.id, nom: c.name, tel: c.phone, ville: c.city })),
      devis: s.quotes.map((q) => ({ id: q.id, client: name(q.clientId), produit: q.product, montant: q.amount, statut: q.status, envoye: fmt(q.date) })),
      paiements: s.payments.map((p) => ({ client: name(p.clientId), contrat: p.contract, montant: p.amount, paye: p.paid, echeance: fmt(p.due) })),
      infosManquantes: s.missing.map((m) => ({ client: name(m.clientId), info: m.info, depuis: fmt(m.since), statut: m.status })),
      sinistres: s.claims.map((c) => ({ id: c.id, client: name(c.clientId), type: c.type, ville: c.city, statut: c.status, expert: s.experts.find((e) => e.id === c.expertId)?.name, statutExpert: c.expertStatus, garage: s.garages.find((g) => g.id === c.garageId)?.name, statutGarage: c.garageStatus })),
      experts: s.experts.map((e) => ({ nom: e.name, cabinet: e.cabinet, ville: e.city, tel: e.phone, statut: e.status })),
      garages: s.garages.map((g) => ({ nom: g.name, ville: g.city, tel: g.phone, statut: g.status })),
    });
  }, [s]);
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const context = useContext();
  const ctxRef = useRef(context);
  ctxRef.current = context;
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: () => ({ context: ctxRef.current }) }), []);
  const { messages, sendMessage, status, stop, setMessages, error } = useChat({
    transport,
    onError: (e) => {
      const m = e.message || "";
      toast.error(m.includes("402") ? "Crédits IA épuisés." : m.includes("429") ? "Trop de demandes, réessayez dans un instant." : "L'assistant IA n'a pas pu répondre.");
    },
  });
  const busy = status === "submitted" || status === "streaming";
  const taRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (open && !busy) taRef.current?.focus(); }, [open, busy]);

  const send = (text: string) => { if (!text.trim() || busy) return; sendMessage({ text }); setInput(""); };
  const onSubmit = (m: PromptInputMessage) => send(m.text ?? "");

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Ouvrir l'assistant IA" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-105">
          <Bot className="size-5" /> Assistant IA
        </button>
      )}
      {open && (
        <div className="fixed inset-x-2 bottom-2 z-50 flex h-[min(640px,85vh)] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[420px]">
          <div className="flex items-center gap-3 border-b bg-sidebar px-4 py-3 text-sidebar-foreground">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Bot className="size-5" /></div>
            <div className="flex-1">
              <div className="text-sm font-semibold">Assistant PilotIA</div>
              <div className="text-xs opacity-70">Sanlam Assurances · connaît vos dossiers</div>
            </div>
            <button onClick={() => setMessages([])} aria-label="Nouvelle conversation" className="rounded-lg p-1.5 opacity-80 hover:bg-white/10 hover:opacity-100"><RotateCcw className="size-4" /></button>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="rounded-lg p-1.5 opacity-80 hover:bg-white/10 hover:opacity-100"><X className="size-4" /></button>
          </div>
          <Conversation className="flex-1">
            <ConversationContent className="gap-4 p-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Bonjour ! Posez-moi une question sur vos clients, devis, paiements ou sinistres.</p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((q) => (
                      <button key={q} onClick={() => send(q)} className="rounded-xl border bg-secondary/50 px-3 py-2 text-left text-sm hover:border-primary hover:bg-accent">{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m) => (
                <Message key={m.id} from={m.role}>
                  <MessageContent className={cn(m.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent p-0 text-foreground")}>
                    {m.parts.map((p, i) => (p.type === "text" ? (m.role === "user" ? <span key={i} className="whitespace-pre-wrap">{p.text}</span> : <MessageResponse key={i}>{p.text}</MessageResponse>) : null))}
                  </MessageContent>
                </Message>
              ))}
              {status === "submitted" && <Shimmer className="text-sm">Analyse de vos dossiers…</Shimmer>}
              {error && !busy && <p className="text-sm text-destructive">L'assistant n'a pas pu répondre. Réessayez.</p>}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>
          <div className="border-t p-3">
            <PromptInput onSubmit={onSubmit}>
              <PromptInputTextarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre question…" />
              <PromptInputFooter className="justify-end">
                <PromptInputSubmit status={status} disabled={!busy && !input.trim()} onStop={stop} />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      )}
    </>
  );
}
