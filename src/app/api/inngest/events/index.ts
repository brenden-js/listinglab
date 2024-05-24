import {CheckoutSessionCompletedEvent, MonthlyInvoicePaidEvent} from "@/app/api/inngest/events/stripe";
import {AddGenerationToHouse, HouseEnrich} from "@/app/api/inngest/events/house";


export type AllInngestEvents = 
  CheckoutSessionCompletedEvent | 
  MonthlyInvoicePaidEvent | 
  HouseEnrich |
  AddGenerationToHouse
