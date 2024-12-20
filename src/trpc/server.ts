import {
  createTRPCProxyClient, httpBatchLink,
  loggerLink,
} from "@trpc/client";
import { headers } from "next/headers";

import { getUrl, transformer } from "./shared";
import {AppRouter} from "@/trpc/root";

export const api = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    httpBatchLink({
      url: getUrl(),
      headers() {
        const heads = new Map(headers());
        heads.set("x-trpc-source", "rsc");
        return Object.fromEntries(heads);
      },
      transformer
    }),
  ],
});
