import {type Stripe} from "stripe";


export type CheckoutSessionCompletedEvent = {
  name: "stripe/checkout.session.completed",
  data: Stripe.Event
}

export type MonthlyInvoicePaidEvent = {
  name: "stripe/invoice.paid",
  data: Stripe.Event
}