import { Resource, RealtimeAuthHandler } from "sst";
import jwt from "jsonwebtoken";


export const handler = RealtimeAuthHandler(async (token) => {
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;
  console.log('usertoken...',token)

  // get the user id from the token
  const claims = jwt.verify(token, Resource.ClerkPublicKey.value)
  console.log('claims...',claims)

  return {
    publish: [`house-updates`],
    subscribe: [`house-updates`],
  };
});