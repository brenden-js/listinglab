import {EventSchemas, Inngest} from "inngest";
import {AllInngestEvents} from "@/app/api/inngest/events";

// Create a client to send and receive events
export const inngest = new Inngest(
  {
    id: "listinglab",
    schemas: new EventSchemas().fromUnion<AllInngestEvents>(),
    eventKey: process.env.INNGEST_EVENT_KEY!
  },
);
