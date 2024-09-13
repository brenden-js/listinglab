import {serve} from "inngest/next";
import {inngest} from "@/inngest/client";
import {handleSubscriptionPurchased} from "@/inngest/functions/stripe";
import {
    handleAddGeneration, handleAddHouseToUsers,
    handleEnrichHouse,
    incrementHouseUsage,
    incrementTextUsage, newListingsInCityScan,
} from "@/inngest/functions/house";


export const {GET, POST, PUT} = serve({
    client: inngest,
    functions: [
        handleAddGeneration,
        handleEnrichHouse,
        incrementHouseUsage,
        incrementTextUsage,
        handleSubscriptionPurchased,
        // scheduledNewListingsScan,
        newListingsInCityScan,
        handleAddHouseToUsers
    ],
    serveHost: process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : `https://listinglab.ai`,
});