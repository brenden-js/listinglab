// import {stripe} from "@/lib/stripe";
// import {headers} from "next/headers";
import {NextResponse} from "next/server";
// import {inngest} from "@/inngest/client";
// import type {Stripe} from 'stripe';

export async function POST(req: Request) {
  // const body = await req.text()
  // const signature = headers().get("Stripe-Signature")
  //
  // if (!signature) {
  //   return new NextResponse(`Unauthorized please add signature to request`, {status: 401})
  // }
  //
  // let event: Stripe.Event
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     body,
  //     signature,
  //     process.env.STRIPE_WEBHOOK_SECRET!
  //   )
  //   console.log('Webhook successfully constructed event')
  // } catch (error) {
  //   return new NextResponse(`Could not construct event ${JSON.stringify(error)}`, {status: 502})
  // }
  //
  // if (event.type === 'checkout.session.completed') {
  //   await inngest.send({name: "stripe/checkout.session.completed", data: event.data.object})
  //   return new NextResponse(`Success`, {status: 200})
  // }
  //
  // else if (event.type === 'invoice.paid') {
  //   await inngest.send({name: "stripe/invoice.paid", data: event.data.object})
  //   return new NextResponse(`Success`, {status: 200})
  // }

  return new NextResponse(`Success`, {status: 200})
}