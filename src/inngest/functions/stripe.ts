import {eq} from "drizzle-orm";

import {inngest} from "@/inngest/client";
import {userApiLimits, userSubscriptions} from "@/db/schema";
import {db} from "@/db";
import {stripe} from "@/lib/stripe";

export const handleCheckoutSessionCompleted = inngest.createFunction(
    {id: 'handle-checkout-session-completed'},
    {event: 'stripe/checkout.session.completed'},
    async ({event, step}) => {

        if (!event.data.subscription) {
            throw new Error('No subscription data was found')
        }

        if (typeof event.data.subscription !== "string") {
            throw new Error('An error happened when handling a checkout session completed event. The subscription type is not a string.')
        }

        const subscription = await stripe.subscriptions.retrieve(event.data.subscription)

        const subData = await step.run(
            {id: `savesub-${subscription.id}`},
            async () => {
                if (!event.data.metadata?.userId) {
                    throw new Error('No userId was found in metadata')
                }
                const end = subscription.current_period_end * 1000
                await db.insert(userSubscriptions).values({
                    userId: event.data.metadata.userId,
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    stripePriceId: subscription.items.data[0]!.price.id,
                    stripeCurrentPeriodEnd: new Date(end),
                })
                return {userId: event.data.metadata.userId, periodEnd: end, subId: subscription.id}
            }
        );

        await step.run(
            {id: `updatelimits-usr:${subData.userId}-sub:${subData.subId}`},
            async () => {
                await db.update(userApiLimits)
                    .set({periodEnd: new Date(subData.periodEnd), housesQuota: 25, textQuota: 125, maxTokens: 4000})
                    .where(eq(userApiLimits.userId, subData.userId))
            }
        )
    }
);


export const handleInvoicePaid = inngest.createFunction(
    {id: "handle-invoice-paid"},
    {event: "stripe/invoice.paid"},
    async ({event, step}) => {
        if (typeof event.data.subscription !== "string") {
            throw new Error('An error happened when handling an invoice paid event. The subscription type is not a string.')
        }
        const subscription = await stripe.subscriptions.retrieve(event.data.subscription)
        await db.update(userSubscriptions)
            .set({stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),})
            .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id))

        await step.run(
            {id: `updateApiLimit-usr:${subscription.metadata.userId!}-sub:${subscription.id}`},
            async () => {
                await db.update(userApiLimits)
                    .set({periodEnd: new Date(subscription.current_period_end * 1000)})
                    .where(eq(userApiLimits.userId, subscription.metadata.userId!))
            }
        )
    }
)