/// <reference path="./.sst/platform/config.d.ts" />


export default $config({
    app(input) {
        return {
            name: "listinglab",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {

        const clerkPublic = new sst.Secret("ClerkPublicKey")
        const clerkSecret = new sst.Secret("ClerkSecretKey")

        const dbUrl = new sst.Secret("DbUrl")
        const dbToken = new sst.Secret("DbToken")

        const openAiKey = new sst.Secret("OpenAiKey")
        const googleApiKey = new sst.Secret("GoogleApiKey")
        const houseApiKey = new sst.Secret("HouseApiKey")

        const stripePublicKey = new sst.Secret("StripePublicKey")
        const stripeSecretKey = new sst.Secret("StripeSecretKey")
        const stripeWebhookSecret = new sst.Secret("StripeWebhookSecret")

        const awsApiAccessKey = new sst.Secret("AwsApiAccessKey")
        const awsApiSecretKey = new sst.Secret("AwsApiSecretKey")

        const inngestSigningKey = new sst.Secret("InngestSigningKey")
        const inngestEventKey = new sst.Secret("InngestEventKey")

        const togetherApiKey = new sst.Secret("TogetherApiKey")

        const prodDomain = {
            name: "listinglab.ai",
            dns: undefined,
            cert: "arn:aws:acm:us-east-1:479299194412:certificate/b80c91e2-e7aa-4c2e-95f0-7fce0a1eeed2"
        }

        const getDomain = () => {
            if ($app.stage === 'snoob') return prodDomain
            return undefined
        }

         const realtime = new sst.aws.Realtime("RealtimeLink", {
            authorizer: { handler: "authorizer.handler", link: [clerkSecret] },
        });

        const next = new sst.aws.Nextjs("ListingLab", {
            link: [
                realtime, clerkPublic, clerkSecret, dbUrl, dbToken, openAiKey, houseApiKey, googleApiKey, stripeSecretKey,
                stripePublicKey, stripeWebhookSecret, awsApiAccessKey, inngestSigningKey, inngestEventKey
            ],
            domain: getDomain(),
            environment: {
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: clerkPublic.value,
                CLERK_SECRET_KEY: clerkSecret.value,
                NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
                NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
                NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dashboard',
                NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dashboard',
                DATABASE_URL: dbUrl.value,
                DATABASE_TOKEN: dbToken.value,
                OPENAI_SECRET_KEY: openAiKey.value,
                GOOGLE_API_KEY: googleApiKey.value,
                HOUSE_DATA_API_KEY: houseApiKey.value,
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_API_KEY: stripePublicKey.value,
                STRIPE_SECRET_KEY: stripeSecretKey.value,
                STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
                NEXT_PUBLIC_APP_URL: $app.stage === 'snoob' ? 'https://listinglab.ai' : 'http://localhost:3000',
                AWS_API_ACCESS_KEY: awsApiAccessKey.value,
                AWS_API_SECRET_KEY: awsApiSecretKey.value,
                INNGEST_SIGNING_KEY: inngestSigningKey.value,
                INNGEST_EVENT_KEY: inngestEventKey.value,
                TOGETHER_API_KEY: togetherApiKey.value,
            },
            permissions: [
                {
                    actions: ["iot:Publish"],
                    resources: ["arn:aws:iot:us-west-2:479299194412:topic/*"]
                }
            ]
        });
    },
});
