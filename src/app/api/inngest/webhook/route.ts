import {stripe} from "@/lib/stripe";
import {headers} from "next/headers";
import {NextResponse} from "next/server";
import {inngest} from "@/inngest/client";


export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature")

  if (!signature) {
    return new NextResponse(`Unauthorized please add signature to request`, {status: 401})
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('Webhook successfully constructed event')
  } catch (error) {
    return new NextResponse(`Webhook Error ${JSON.stringify(error)}`, {status: 400})
  }

  if (event.type === 'checkout.session.completed') {
    await inngest.send({name: "stripe/checkout.session.completed", data: event})
    console.log('Sent stripe/checkout.session.completed event from webhook')
    return new NextResponse(`Success`, {status: 200})
  }

  else if (event.type === 'invoice.paid') {
    await inngest.send({name: "stripe/invoice.paid", data: event})
    console.log('Sent stripe/invoice.paid event from webhook')
    return new NextResponse(`Success`, {status: 200})
  }

  return new NextResponse(`Success`, {status: 200})
}