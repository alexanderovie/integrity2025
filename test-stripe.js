import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const account = await stripe.accounts.retrieve();
console.log("Conectado a:", account.id);
