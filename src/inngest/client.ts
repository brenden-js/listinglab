import {EventSchemas, Inngest} from "inngest";
import type {Stripe} from "stripe";

type CheckoutSessionCompletedEvent = {
  data: Stripe.Checkout.Session
}

type MonthlyInvoicePaidEvent = {
  data: Stripe.Invoice
}

type HouseEnrich = {
  data: {
    lookupId: string
    createdId: string
    userId: string
  }
}

type AddGenerationToHouse = {
  data: {
    houseId: string
    text: string
    model: string
    prompt: string
    userId: string
  }
}

type Events = {
    "house/add-generation": AddGenerationToHouse;
    "house/enrich": HouseEnrich;
    "stripe/checkout.session.completed": CheckoutSessionCompletedEvent;
    "stripe/invoice.paid": MonthlyInvoicePaidEvent
}
export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY!
    },
);
