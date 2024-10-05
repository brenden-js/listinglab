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
        lookupId: string | undefined // if this is undefined, it means the house was found via the listing scan, and we have the basic listing data already
        houseId: string
        userId: string
    }
}

type AddGenerationToHouse = {
    data: {
        houseId: string
        text: string
        model?: string
        prompt: string
        userId: string
    }
}

type ScanCity = {
    data: {
        zipId: string
        cityName: string
        state: string
    }
}

type AddHouseToUsers = {
    data: {
        zipId: string
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

type ZipCodeSubscribe = {
    data: {
        zipCodeId: string
        userId: string
    }
}

type ZipCodeScan = {
    data: {
        zipCodeId: string
        userId: string
    }
}

type Events = {
    "house/add-generation": AddGenerationToHouse;
    "house/enrich": HouseEnrich;
    "house/scan-city": ScanCity;
    "payments/checkout-session-completed": SubscriptionPurchasedEvent;
    "payments/invoice-paid": SubscriptionPurchasedEvent,
    "house/add-house-to-users": AddHouseToUsers,
    "zipcode/subscribe": ZipCodeSubscribe
    "zipcode/scan": ZipCodeScan
}

export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY
    },
);
