"use client"

import * as React from "react"
import {Button} from "@/components/ui/button"
import { useContext } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {Card,  CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {ScrollArea} from "@/components/ui/scroll-area";
import {models} from "@/lib/data/models";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";

export function ModelSelector() {
  const { setModelName, setModelId, advOptions }= useContext(CurrentPromptContext)
  return (
    <div className="w-1/4 flex flex-col items-center pr-4 truncate">
      <Drawer>
        <DrawerTrigger
          className="w-full"
          asChild
        >
          <Button variant="outline">
            {advOptions.modelName}
          </Button>
        </DrawerTrigger>
        <DrawerContent className={"h-[80vh]"}>
          <DrawerHeader className={"max-w-xl mx-auto"}>
            <DrawerTitle className="text-center">Select a model</DrawerTitle>
            <DrawerDescription>Different models have different costs and power.</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col w-[650px] mx-auto mb-4">
            <ScrollArea className={"flex items-center mx-auto max-h-[500px] flex-col w-[650px] rounded-md pr-4"}>
              {models.map((model) => {
                return (
                  <DrawerClose key={model.id} asChild>
                    <Card
                      onClick={() => {
                        setModelName(model.name)
                        setModelId(model.id)
                      }}
                      className="my-3 transition-colors hover:bg-gray-100 cursor-pointer"
                    >
                      <CardHeader>
                        <CardTitle>
                          {model.name}
                          {model.pro ? <div className={" inline-block text-xs rounded-lg ml-2 px-2 py-1 bg-gray-200"}>Pro</div> : <div className={" inline-block text-xs rounded-lg ml-2 px-2 py-1 bg-gray-200"}>Free</div> }
                        </CardTitle>
                        <CardDescription>
                          {model.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </DrawerClose>
                )
              })}
            </ScrollArea>
          </div>
          <DrawerFooter className={"max-w-xl mx-auto"}>
            <DrawerClose
              asChild>
              <Button variant={"secondary"}>Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}