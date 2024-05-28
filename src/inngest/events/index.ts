import {CheckoutSessionCompletedEvent, MonthlyInvoicePaidEvent} from "@/inngest/events/stripe";
import {AddGenerationToHouse, HouseEnrich} from "@/inngest/events/house";


export type AllInngestEvents = 
  CheckoutSessionCompletedEvent | 
  MonthlyInvoicePaidEvent | 
  HouseEnrich |
  AddGenerationToHouse
