import * as React from "react"
import {type SliderProps} from "@radix-ui/react-slider"

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {Label} from "@/components/ui/label"
import {Slider} from "@/components/ui/slider"
import {type Dispatch, type SetStateAction, useContext, useEffect} from "react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";


export function TemperatureSelector() {

  const {setTemperature, advOptions} = useContext(CurrentPromptContext)


  return (
    <div className="w-1/4 flex flex-col items-center px-4">
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="temperature" className={"truncate"}>Temperature</Label>
              <span
                className="rounded-md py-0.5 pl-0.5 text-right text-sm text-muted-foreground">
                {advOptions.temperature}
              </span>
            </div>
            <Slider
              id="temperature"
              max={1}
              defaultValue={[advOptions.temperature]}
              step={0.1}
              onValueChange={(value) => {
                setTemperature(value[0])
              }}
              className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
              aria-label="Temperature"
            />
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          align="start"
          className="w-[260px] text-sm"
          side="left"
        >
          Controls randomness: lowering results in less random completions. As
          the temperature approaches zero, the model will become deterministic
          and repetitive.
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}