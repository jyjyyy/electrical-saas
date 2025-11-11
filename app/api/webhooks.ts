import { buffer } from "micro";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import type { NextApiRequest, NextApiResponse } from "next";

// ✅ Stripe avec typage propre
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
} as unknown as Stripe.StripeConfig);

// ✅ Initialisation Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = admin.firestore();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string;
  const buf = await buffer(req);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error("🔥 Erreur traitement webhook:", err.message);
    return res.status(500).send("Internal Server Error");
  }
  console.error("🔥 Erreur inconnue webhook:", err);
  return res.status(500).send("Internal Server Error");
}

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email = session.customer_email;
        const subscriptionId = session.subscription?.toString();

        if (email && subscriptionId) {
          await db.collection("users").doc(email).set(
            {
              premium: true,
              subscriptionId: subscriptionId,
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log(`✅ Abonnement activé pour ${email}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const subscriptionId = subscription.id;
        const usersRef = db.collection("users");
        const snapshot = await usersRef
          .where("subscriptionId", "==", subscriptionId)
          .get();

        snapshot.forEach(async (doc) => {
          await doc.ref.update({
            premium: false,
            subscriptionId: null,
            updatedAt: new Date(),
          });
          console.log(`⚠️ Abonnement terminé pour ${doc.id}`);
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Paiement réussi:", invoice.id);
        break;
      }

      default:
        console.log(`ℹ️ Event Stripe ignoré: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("🔥 Erreur traitement webhook:", err);
    res.status(500).send("Internal Server Error");
  }
}