import * as React from "react"
import { type SliderProps } from "@radix-ui/react-slider"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {type Dispatch, type SetStateAction, useContext, useEffect} from "react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";



export function TopPSelector() {
  const {advOptions, setTopP} = useContext(CurrentPromptContext)

  return (
    <div className="w-1/4 flex flex-col items-center pl-4">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="top-p" className={"truncate"}>Top P</Label>
              <span className="w-12 rounded-md border border-transparent pl-0.5 py-0.5 text-right text-sm text-muted-foreground hover:border-border">
                {advOptions.top_p}
              </span>
            </div>
            <Slider
              id="top-p"
              max={1}
              defaultValue={[advOptions.top_p]}
              step={0.1}
              onValueChange={(value) => {
                setTopP(value[0])
              }}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Top P"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Control diversity via nucleus sampling: 0.5 means half of all
          likelihood-weighted options are considered.
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}