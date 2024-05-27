import Image from 'next/image'

import backgroundImage from '@/images/background-call-to-action.jpg'
import {Button} from "@/components/ui/button";
import Link from "next/link";

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Start now with our free tier.
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Join us in creating real estate content that goes beyond the data, and brings local expertise directly to clientele.
          </p>
          <Link href={'/sign-up'}>
            <Button className="mt-10">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
