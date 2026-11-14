"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Stripe from "stripe";

type ResultadoPortal = { ok: true; url: string } | { ok: false; erro: string };

// Abre o portal do cliente do Stripe (onde ele cancela ou troca o cartão) já
// autenticado, sem passar pela tela de login por e-mail. Retorna {ok, erro}
// em vez de lançar erro, porque em produção o Next esconde a mensagem do throw.
export const createStripePortal = async (): Promise<ResultadoPortal> => {
  const { userId } = await auth();
  if (!userId) return { ok: false, erro: "Faça login para continuar." };
  if (!process.env.STRIPE_SECRET_KEY) {
    return { ok: false, erro: "Stripe não configurado no servidor." };
  }

  try {
    const usuario = await clerkClient().users.getUser(userId);
    const customerId = usuario.privateMetadata?.stripeCustomerId;
    if (typeof customerId !== "string" || !customerId) {
      return {
        ok: false,
        erro: "Não encontramos uma assinatura vinculada à sua conta.",
      };
    }

    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const protocolo = h.get("x-forwarded-proto") ?? "https";
    const site =
      h.get("origin") ??
      (host ? `${protocolo}://${host}` : "http://localhost:3000");

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-10-28.acacia",
    });
    const sessao = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${site}/subscription`,
    });
    return { ok: true, url: sessao.url };
  } catch (err) {
    console.log("Erro ao abrir o portal do Stripe:", err);
    return {
      ok: false,
      erro: "Não foi possível abrir o portal de assinatura. Tente novamente.",
    };
  }
};
