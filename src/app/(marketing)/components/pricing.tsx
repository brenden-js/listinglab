import clsx from 'clsx'
import {Button} from "@/components/ui/button";
import Link from "next/link";

function CheckIcon({className}: { className: string }) {
    return (
        <svg
            aria-hidden="true"
            className={clsx(
                'h-6 w-6 flex-none fill-current stroke-current',
                className
            )}
        >
            <path
                d="M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z"
                strokeWidth={0}
            />
            <circle
                cx={12}
                cy={12}
                r={8.25}
                fill="none"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

interface PlanProps {
    name: string;
    price: string;
    description: string;
    href: string;
    features: string[];
    featured?: boolean;
}

function Plan({name, price, description, href, features, featured = false}: PlanProps) {
    return (
        <section
            className={clsx(
                'flex flex-col rounded-3xl px-6 sm:px-8',
                featured ? 'order-first bg-blue-600 py-8 lg:order-none' : 'lg:py-8'
            )}
        >
            <h3 className="mt-5 font-display text-lg text-white">{name}</h3>
            <p
                className={clsx(
                    'mt-2 text-base',
                    featured ? 'text-white' : 'text-slate-400'
                )}
            >
                {description}
            </p>
            <p className="order-first font-display text-5xl font-light tracking-tight text-white">
                {price}
            </p>
            <ul
                role="list"
                className={clsx(
                    'order-last mt-10 flex flex-col gap-y-3 text-sm',
                    featured ? 'text-white' : 'text-slate-200'
                )}
            >
                {features.map((feature) => (
                    <li key={feature} className="flex">
                        <CheckIcon className={featured ? 'text-white' : 'text-slate-400'}/>
                        <span className="ml-4">{feature}</span>
                    </li>
                ))}
            </ul>
            <Link href={'/sign-up'}>
                <Button
                    className="mt-8"
                    aria-label={`Get started with the ${name} plan for ${price}`}
                    variant={"secondary"}
                >
                    Sign up
                </Button>
            </Link>
        </section>
    )
}

export function Pricing() {
    return (
        <section
            id="pricing"
            aria-label="Pricing"
            className="bg-slate-900 py-20 sm:py-32"
        >
            <div className={"mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"}>
                <div className="md:text-center">
                    <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            <span className="relative whitespace-nowrap">
              <span className="relative">Simple pricing,</span>
            </span>{' '}
                        advanced capabilities.
                    </h2>
                    <p className="mt-4 text-lg text-slate-400">
                        Packages designed to accommodate you on all stages of your AI journey.
                    </p>
                </div>
                <div
                    className="-mx-4 mt-16 grid max-w-2xl grid-cols-1 gap-y-10 sm:mx-auto lg:-mx-8 lg:max-w-none lg:grid-cols-3 xl:mx-0 xl:gap-x-8">
                    <Plan
                        name="Free"
                        price="$0"
                        description="Dip your toes in the water."
                        href="/register"
                        features={[
                            '10x 1 shot generations',
                            'Up to 5 anywhere listings w/ full data gathering',
                            'Up to 2048 token max length generations',
                            'Brand voice settings',
                            'Custom prompts'
                        ]}
                    />
                    <Plan
                        featured
                        name="Pro"
                        price="$25"
                        description="Become a trusted authority for your market."
                        href="/register"
                        features={[
                            '100x 1 shot generations',
                            'Up to 25 anywhere listings w/ full data gathering',
                            'Auto scan 3 zipcodes w/ full data gathering on all listings',
                            'Chat mode',
                            'Brand voice settings',
                            'Custom prompts',
                            'Large 8,192 token length generations',
                        ]}
                    />
                    <Plan
                        name="Custom"
                        price="Contact"
                        description="For organizations looking to transform their business with AI."
                        href="/register"
                        features={[
                            'Completely customizable to your goals.',
                        ]}
                    />
                </div>
            </div>
        </section>
    )
}
