import { Resource, RealtimeAuthHandler } from "sst";

export const handler = RealtimeAuthHandler(async (token) => {
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;

  // get the user id from the token

  return {
    publish: [`house-updates`],
    subscribe: [`house-updates`],
  };
});