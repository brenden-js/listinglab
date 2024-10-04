import {Hero} from "@/app/(marketing)/components/hero";
import {PrimaryFeatures} from "@/app/(marketing)/components/primary-features";
import {SecondaryFeatures} from "@/app/(marketing)/components/secondary-features";
import {CallToAction} from "@/app/(marketing)/components/call-to-action";
import {Pricing} from "@/app/(marketing)/components/pricing";
import {Faqs} from "@/app/(marketing)/components/faqs";
import DataPoints from "@/app/(marketing)/components/vertical-chat-data";


export default function Home() {
  return (
    <>
      <Hero />
      <DataPoints />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      <Pricing />
      <Faqs />
    </>
  );
}
