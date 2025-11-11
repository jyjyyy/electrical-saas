import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

type PlanType = "monthly" | "yearly";

// ✅ Typage strict
const priceIds: Record<PlanType, string> = {
  monthly: "price_1SCen3LoGgvWK6MnDWLMVaFh",
  yearly: "price_1SCeqyLoGgvWK6MnM21LNuAe",
};

// ✅ Typage du body de la requête
type CheckoutBody = {
  plan: PlanType;
};

export async function POST(req: NextRequest) {
  try {
    // ✅ Lecture sécurisée du JSON
    const body = (await req.json()) as unknown as CheckoutBody;
    const { plan } = body;

    // ✅ Vérification runtime
    if (plan !== "monthly" && plan !== "yearly") {
      return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
    }

    // ✅ Ici TS sait que plan est un PlanType
    const priceId = priceIds[plan];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur Stripe :", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session" },
      { status: 500 }
    );
  }
}