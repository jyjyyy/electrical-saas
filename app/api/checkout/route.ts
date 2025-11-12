import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

type PlanType = "monthly" | "yearly";

const priceIds: Record<PlanType, string> = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
};

type CheckoutBody = {
  plan: PlanType;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const { plan } = body;

    if (!plan || !(plan in priceIds)) {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    const priceId = priceIds[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
    });

    if (!session.url) {
      console.error("❌ session.url est vide !");
      return NextResponse.json(
        { error: "Erreur : session URL manquante." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { url: session.url },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Erreur Stripe :", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session Stripe" },
      { status: 500 }
    );
  }
}