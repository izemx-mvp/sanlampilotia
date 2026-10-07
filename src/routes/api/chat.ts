import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("Assistant IA non configuré.", { status: 500 });
        const body = (await request.json()) as { messages?: UIMessage[]; context?: string };
        if (!Array.isArray(body.messages)) return new Response("Requête invalide.", { status: 400 });
        const context = String(body.context ?? "").slice(0, 60000);
        const instructions = `Tu es l'assistant IA de PilotIA, l'outil de pilotage du cabinet Sanlam Assurances (Maroc). Réponds en français, de façon brève, claire et actionnable (listes courtes, montants en DH, dates JJ/MM). Aide l'opératrice à prioriser les relances clients (devis, paiements, informations manquantes) et le suivi des sinistres (experts, garages). Base-toi uniquement sur les données ci-dessous ; si une info manque, dis-le. Ne propose jamais d'appeler via l'application : donne seulement le numéro à appeler. Tu peux rédiger des messages de relance (SMS, WhatsApp, email) si on te le demande.\n\nDonnées actuelles (JSON) :\n${context}`;
        const messages = await convertToModelMessages(body.messages);
        return createResponsesCall(request, { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" }, messages, instructions).response();
      },
    },
  },
});
