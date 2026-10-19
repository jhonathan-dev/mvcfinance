import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const text = await request.text();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-10-28.acacia",
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.log("Erro no constructEvent:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      try {
        const session = event.data.object;
        const subscription = session.subscription;

        if (!subscription) {
          console.log("Sessão sem subscription, ignorando...");
          break;
        }

        const subscriptionData = await stripe.subscriptions.retrieve(
          subscription as string,
        );

        const clerkUserId = subscriptionData.metadata?.clerk_user_id;
        console.log("clerkUserId:", clerkUserId);

        if (!clerkUserId) {
          console.log("clerkUserId não encontrado no metadata");
          break;
        }

        // updateUserMetadata faz MERGE com o que já existe (ex.: role "admin").
        // O updateUser antigo substituía o publicMetadata inteiro e apagaria
        // o papel de admin de quem assina ou cancela o premium.
        await clerkClient().users.updateUserMetadata(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: subscription,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });

        console.log("Usuário atualizado com sucesso!");
      } catch (err) {
        console.log("Erro no webhook:", err);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
      }
      break;
    }
    case "customer.subscription.deleted": {
      // Remover plano premium do usuário
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUserMetadata(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
};
