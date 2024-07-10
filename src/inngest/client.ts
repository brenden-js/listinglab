import {EventSchemas, Inngest} from "inngest";

export type SubscriptionPurchasedEvent = {
    data: {
        id: string
        metadata: { userId: string }
        subscription: string
    }
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
    "payments/checkout-session-completed": SubscriptionPurchasedEvent;
    "payments/invoice-paid": SubscriptionPurchasedEvent
}

export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY
    },
);
