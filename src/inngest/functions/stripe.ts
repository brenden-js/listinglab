import {Stripe} from "stripe";
import {eq} from "drizzle-orm";
import {db} from "@/app/api/trpc/db";
import {inngest} from "@/inngest/client";
import {userApiLimits, userSubscriptions} from "@/app/api/trpc/db/schema";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
  typescript: true,
});

export const handleCheckoutSessionCompleted = inngest.createFunction(
  {id: 'Handle Checkout Session Completed Event'},
  {event: 'stripe/checkout.session.completed'},
  async ({event, step}) => {

    const checkoutSession = event.data.data.object as Stripe.Checkout.Session

    if (!checkoutSession.subscription) {
      throw new Error('No subscription data was found')
    }

    const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription as string)

    const subData = await step.run(
      {id: `savesub-${subscription.id}`},
      async () => {
        if (!checkoutSession.metadata?.userId) {
          throw new Error('No userId was found in metadata')
        }
        const end = subscription.current_period_end * 1000
        await db.insert(userSubscriptions).values({
          userId: checkoutSession.metadata.userId,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer as string,
          stripePriceId: subscription.items.data[0]!.price.id,
          stripeCurrentPeriodEnd: new Date(end),
        })
        return {userId: checkoutSession.metadata.userId, periodEnd: end, subId: subscription.id}
      }
    );

    await step.run(
      {id: `updatelimits-usr:${subData.userId}-sub:${subData.subId}`},
      async () => {
        await db.update(userApiLimits)
          .set({periodEnd: new Date(subData.periodEnd), housesQuota: 25, textQuota: 125})
          .where(eq(userApiLimits.userId, subData.userId))
      }
    )
  }
);


export const handleInvoicePaidEvent = inngest.createFunction(
  {id: "Handle Invoice Paid Event"},
  {event: "stripe/invoice.paid"},
  async ({event, step}) => {
    const session = event.data.data.object as Stripe.Invoice
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
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