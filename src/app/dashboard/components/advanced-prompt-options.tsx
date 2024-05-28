"use client"

import {useContext, useEffect, useState} from "react";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {ModelSelector} from "@/app/dashboard/components/model-selector";
import {TemperatureSelector} from "@/app/dashboard/components/temperature-selector";
import {MaxLengthSelector} from "@/app/dashboard/components/maxlength-selector";
import {TopPSelector} from "@/app/dashboard/components/top-p-selector";

export default function AdvancedPromptOptions() {
    const [showAdvOptions, setShowAdvOptions] = useState("0")
    return (
            <Accordion value={showAdvOptions} type={"single"} collapsible>
            <AccordionItem value={'1'}>
                <AccordionTrigger onClick={() => setShowAdvOptions(showAdvOptions === "1" ? "0" : "1")}>
                    Advanced options
                </AccordionTrigger>
                <AccordionContent>
                    <div className="flex mb-10 items-center">
                        <ModelSelector />
                        <TemperatureSelector/>
                        <MaxLengthSelector/>
                        <TopPSelector/>
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}