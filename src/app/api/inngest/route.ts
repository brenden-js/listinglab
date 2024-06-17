import {serve} from "inngest/next";
import {inngest} from "@/inngest/client";
import {handleCheckoutSessionCompleted, handleInvoicePaid} from "@/inngest/functions/stripe";
import {
    handleAddGeneration,
    handleEnrichHouse,
    incrementHouseUsage,
    incrementTextUsage
} from "@/inngest/functions/house";


export const {GET, POST, PUT} = serve({
    client: inngest,
    functions: [
        handleAddGeneration,
        handleEnrichHouse,
        incrementHouseUsage,
        incrementTextUsage,
        handleCheckoutSessionCompleted, handleInvoicePaid
    ],
    serveHost: process.env.NODE_ENV === "production"
        ? `https://listinglab.ai`
        : "http://localhost:3000",
});