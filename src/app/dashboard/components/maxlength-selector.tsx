import * as React from "react"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {Label} from "@/components/ui/label"
import {Slider} from "@/components/ui/slider"
import {useContext} from "react";
import {api} from "@/trpc/react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";
export function MaxLengthSelector() {
  const userSubscription = api.user.getSubscription.useQuery()

  const {advOptions, setMaxTokens} = useContext(CurrentPromptContext)

  return (
    <div className="w-1/4 flex flex-col items-center px-4 ">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="maxlength" className={"truncate"}>Max Length</Label>
              <span
                className="rounded-md py-0.5 pl-0.5 text-right text-sm text-muted-foreground">
                {advOptions.max_tokens}
              </span>
            </div>
            <Slider
              id="maxlength"
              max={4000}
              defaultValue={[advOptions.max_tokens]}
              step={10}
              onValueChange={(value) => {
                setMaxTokens(value[0])
              }}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Maximum Length"
              disabled={!userSubscription.data?.isPremium}
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          {userSubscription.data?.isPremium ? "The maximum number of tokens to generate. Requests can use up to 2,048\n" +
            "            or 4,000 tokens, shared between prompt and completion. The exact limit\n" +
            "            varies by model." : "Upgrading your account allows you to increase the max token length to up to 4k tokens."}
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}