import {EventSchemas, Inngest} from "inngest";
import type {Stripe} from "stripe";

type CheckoutSessionCompletedEvent = {
    data: {
        id: string
        object: "invoice"
        account_country: string | null
        account_name: string | null
        amount_due: number
        amount_paid: number
        amount_remaining: number
        amount_shipping: number
        attempt_count: number
        attempted: boolean
        auto_advance?: boolean
        charge: string
        created: number
        currency: string
        customer: string
        customer_email: string | null
        customer_name: string | null
        customer_phone: string | null
        deleted?: void
        description: string | null

        due_date: number | null
        effective_at: number | null
        ending_balance: number | null
        footer: string | null
        hosted_invoice_url?: string | null
        invoice_pdf?: string | null
        livemode: boolean
        metadata: { userId: string }
        next_payment_attempt: number | null
        number: string | null
        paid: boolean
        paid_out_of_band: boolean
        payment_intent: string
        period_end: number
        period_start: number
        post_payment_credit_notes_amount: number
        pre_payment_credit_notes_amount: number
        receipt_number: string | null
        starting_balance: number
        statement_descriptor: string | null
        subscription: string
        subscription_proration_date?: number
        subtotal: number
        subtotal_excluding_tax: number | null
        tax: number | null
        total: number
        total_excluding_tax: number | null
        webhooks_delivered_at: number | null
    }
}

type MonthlyInvoicePaidEvent = {
    data: {
        id: string
        object: "invoice"
        account_country: string | null
        account_name: string | null
        amount_due: number
        amount_paid: number
        amount_remaining: number
        amount_shipping: number
        application: string
        application_fee_amount: number | null
        attempt_count: number
        attempted: boolean
        charge: string
        created: number
        currency: string
        customer: string
        customer_email: string | null
        customer_name: string | null
        customer_phone: string | null
        default_payment_method: string
        deleted?: void
        description: string | null
        due_date: number | null
        effective_at: number | null
        ending_balance: number | null
        footer: string | null
        hosted_invoice_url?: string | null
        invoice_pdf?: string | null
        livemode: boolean
        metadata: { userId: string }
        next_payment_attempt: number | null
        number: string | null
        on_behalf_of: string
        paid: boolean
        paid_out_of_band: boolean
        payment_intent: string
        period_end: number
        period_start: number
        post_payment_credit_notes_amount: number
        pre_payment_credit_notes_amount: number
        receipt_number: string | null
        starting_balance: number
        statement_descriptor: string | null
        subscription: string
        subscription_proration_date?: number
        subtotal: number
        subtotal_excluding_tax: number | null
        tax: number | null
        test_clock: string | null
        total: number
        webhooks_delivered_at: number | null
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
    "payments/checkout-session-completed": CheckoutSessionCompletedEvent;
    "payments/invoice-paid": MonthlyInvoicePaidEvent
}
export const inngest = new Inngest(
    {
        id: "listinglab",
        schemas: new EventSchemas().fromRecord<Events>(),
        eventKey: process.env.INNGEST_EVENT_KEY!
    },
);
