// pages/api/stripe-webhook.ts
import { buffer } from 'micro';
import Stripe from 'stripe';
import { saveUser } from '../../lib/user';
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false, // Stripe envoie du raw body
  },
};

// Utilise `as unknown as Stripe.StripeConfig` pour éviter l'erreur de version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
} as unknown as Stripe.StripeConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Méthode non autorisée');
  }

  let event: Stripe.Event;

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'] as string;

    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    console.error('Erreur webhook Stripe :', err);
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const customerEmail = session.customer_email;
    const subscriptionId = session.subscription?.toString();

    if (customerEmail && subscriptionId) {
      await saveUser(subscriptionId, customerEmail, true, 'premium');
    }
  }

  res.status(200).json({ received: true });
}