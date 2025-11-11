import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

type PlanType = 'monthly' | 'yearly';

const priceIds: Record<PlanType, string> = {
  monthly: 'price_1SCen3LoGgvWK6MnDWLMVaFh',
  yearly: 'price_1SCeqyLoGgvWK6MnM21LNuAe',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Méthode non autorisée');
  }

  const { plan } = req.body;

  if (plan !== 'monthly' && plan !== 'yearly') {
    return res.status(400).json({ error: 'Plan invalide' });
  }

  const typedPlan: PlanType = plan;
  const priceId = priceIds[typedPlan];

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: { trial_period_days: 7 },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/settings?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erreur Stripe :', error);
    return res.status(500).json({ error: 'Erreur lors de la création de la session' });
  }
}