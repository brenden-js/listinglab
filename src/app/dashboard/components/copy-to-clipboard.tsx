
import { TooltipTrigger, TooltipContent, Tooltip, TooltipProvider } from "@/components/ui/tooltip"
import {type ReactNode} from "react";
import {Button} from "@/components/ui/button";
import {toast} from "sonner";

export function CopyToClipboard({children} : { children: ReactNode}) {
  const handleClick = async () => {
    if (typeof children !== 'string') {
      // toast.error('Could not copy to clipboard');
      return;  // exits if `children` is not a string
    }
    await navigator.clipboard.writeText(children.toString())
    toast.success("Copied to clipboard.")
  }
  return (

          <div className="mb-6 px-8 transition-colors flex flex-col w-full rounded-md min-h-[196px] p-3 border bg-muted items-center gap-2">
            <Button variant={"ghost"} onClick={handleClick} className={"flex items-center hover:bg-gray-200"}>
              <CopyIcon className="mr-2 w-4 h-4" />
              <span>Copy</span>
            </Button>
            {children}
          </div>
  )
}


function CopyIcon(props: { className: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}
