"use client";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {httpBatchLink, loggerLink, } from "@trpc/client";
import {createTRPCReact} from "@trpc/react-query";
import {useState} from "react";

import {getUrl, transformer} from "./shared";
import {AppRouter} from "@/app/api/trpc/root";

export const api = createTRPCReact<AppRouter>();

export function TRPCReactProvider(props: {
    children: React.ReactNode;
    headers: Headers;
}) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                retry: 2,
                staleTime: Infinity,
            },
        },
    }));

    const [trpcClient] = useState(() =>
        api.createClient({
            links: [
                loggerLink({
                    enabled: (op) =>
                        process.env.NODE_ENV === "development" ||
                        (op.direction === "down" && op.result instanceof Error),
                }),
                httpBatchLink({
                    transformer,
                    url: getUrl(),
                    headers() {
                        const heads = new Map(props.headers);
                        heads.set("x-trpc-source", "react");
                        return Object.fromEntries(heads);
                    },
                }),
            ],
        })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <api.Provider client={trpcClient} queryClient={queryClient}>
                {props.children}
            </api.Provider>
        </QueryClientProvider>
    );
}
