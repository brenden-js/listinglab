import {Hero} from "@/app/(marketing)/components/hero";
import {PrimaryFeatures} from "@/app/(marketing)/components/primary-features";
import {SecondaryFeatures} from "@/app/(marketing)/components/secondary-features";
import {CallToAction} from "@/app/(marketing)/components/call-to-action";
import {Pricing} from "@/app/(marketing)/components/pricing";
import {Faqs} from "@/app/(marketing)/components/faqs";

export default function Home() {
  return (
    <>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      <Pricing />
      <Faqs />
    </>
  );
}
