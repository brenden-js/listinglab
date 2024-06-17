import {EventSchemas, Inngest} from "inngest";
import type {Stripe} from "stripe";

// Create a client to send and receive events
type CheckoutSessionCompletedEvent = {
  data: Stripe.Event
}

type MonthlyInvoicePaidEvent = {
  data: Stripe.Event
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
    "stripe/checkout-session-completed": CheckoutSessionCompletedEvent;
    "stripe/invoice-paid": MonthlyInvoicePaidEvent
}
export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY!
    },
);
