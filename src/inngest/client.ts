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

type ScanCity = {
    data: {
        cityId: string
        cityName: string
    }
}

type AddHouseToUsers = {
    data: {
        cityId: string
        cityName: string
        houseId: string
        zipCode: string
        foundAt: Date
        baths: number
        beds: number
        city: string
        lat: number
        lotSqft: number | undefined
        lon: number
        price: number
        sqft: number
        stAddress: string
        state: string
        yearBuilt: number
    }
}

type Events = {
    "house/add-generation": AddGenerationToHouse;
    "house/enrich": HouseEnrich;
    "house/scan-city": ScanCity;
    "payments/checkout-session-completed": SubscriptionPurchasedEvent;
    "payments/invoice-paid": SubscriptionPurchasedEvent,
    "house/add-house-to-users": AddHouseToUsers
}

export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY
    },
);
