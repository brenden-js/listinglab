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
        const realtime = new sst.aws.Realtime("MyRealtime", {
            authorizer: "authorizer.handler",
        });
        new sst.aws.Nextjs("ListingLab", {
            link: [realtime],
            domain: {
                name: "listinglab.ai",
                dns: false,
                cert: "arn:aws:acm:us-east-1:479299194412:certificate/b80c91e2-e7aa-4c2e-95f0-7fce0a1eeed2"
            }
        });
    },
});
