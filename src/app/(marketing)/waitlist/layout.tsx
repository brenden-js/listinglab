// creat nextjs layout

import {headers} from "next/headers";
import {TRPCReactProvider} from "@/trpc/react";

const Layout = ({children}: { children: React.ReactNode }) => {
  return (
    <TRPCReactProvider headers={headers()}>
      {children}
    </TRPCReactProvider>
  )
}

export default Layout