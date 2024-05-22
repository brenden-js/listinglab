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
            link: [realtime]
        });
    },
});
