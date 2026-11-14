"use server";

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import Stripe from "stripe";

// Descobre a URL do site que está atendendo a requisição (localhost em dev,
// domínio da Vercel em produção), para o Stripe devolver o usuário ao lugar certo.
const urlDoSite = () => {
  const h = headers();
  const origem = h.get("origin");
  if (origem) return origem;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocolo = h.get("x-forwarded-proto") ?? "https";
  return host ? `${protocolo}://${host}` : "http://localhost:3000";
};

export const createStripeCheckout = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });
  const site = urlDoSite();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    success_url: `${site}/`,
    cancel_url: `${site}/subscription`,
    subscription_data: {
      metadata: {
        clerk_user_id: userId,
      },
    },
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
        quantity: 1,
      },
    ],
  });
  return { sessionId: session.id };
};
