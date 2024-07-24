"use client"

import {useContext, useEffect, useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {ModelSelector} from "@/app/dashboard/components/model-selector";
import {TemperatureSelector} from "@/app/dashboard/components/temperature-selector";
import {MaxLengthSelector} from "@/app/dashboard/components/maxlength-selector";
import {TopPSelector} from "@/app/dashboard/components/top-p-selector";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {CaretSortIcon} from "@radix-ui/react-icons";
import {Button} from "@/components/ui/button";
import * as React from "react";

export default function AdvancedPromptOptions() {
    const [showAdvOptions, setShowAdvOptions] = useState("0")
    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button
                    variant="outline"
                >
                    Advanced
                </Button>
            </DrawerTrigger>
            <DrawerContent className={"h-[40vh]"}>
                <DrawerHeader className={"max-w-xl mx-auto"}>
                    <DrawerTitle className="text-center">Advanced options</DrawerTitle>
                    <DrawerDescription>Fine tune your generation to make content more random, or more
                        controlled.</DrawerDescription>
                </DrawerHeader>
                <div className="flex items-center justify-center w-[650px] mx-auto mb-4">
                    <div className="flex flex-col gap-5 mb-10 items-center max-w-xl min-w-[650px]">
                        <TemperatureSelector/>
                        <MaxLengthSelector/>
                        <TopPSelector/>
                    </div>
                </div>
            </DrawerContent>

        </Drawer>
    )
}