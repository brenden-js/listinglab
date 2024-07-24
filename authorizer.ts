import {Resource, RealtimeAuthHandler} from "sst";
import {verifyToken} from '@clerk/backend';

export const handler = RealtimeAuthHandler(async (token) => {
    const prefix = `${Resource.App.name}/${Resource.App.stage}`;
    console.log("token....", token);

    const decoded = await verifyToken(token, {secretKey: Resource.ClerkSecretKey.value});

    console.log("decoded....", decoded);

    if (!decoded.sub) {
        throw new Error("Invalid token");
    }
    return {
        subscribe: [`${decoded.sub}-house-updates`],
    }
});