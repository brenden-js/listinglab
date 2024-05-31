import { Resource, RealtimeAuthHandler } from "sst";

export const handler = RealtimeAuthHandler(async (token) => {
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;

  return {
    publish: [`house-updates`],
    subscribe: [`house-updates`],
  };
});