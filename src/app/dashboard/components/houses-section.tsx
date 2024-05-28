"use client"
import {cn} from "@/lib/utils";
import {HousesDrawer} from "@/app/dashboard/components/houses-drawer";
import {HouseCard} from "@/app/dashboard/components/house-card";
import {useContext} from "react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";

export const HousesSection = () => {
    const { selectedHouses } = useContext(CurrentPromptContext)
    return (
        <>
            <div className="pl-8 max-w-[500px] mt-10">
                <h3
                    className={`text-left font-medium mb-4 truncate`}>
                    Select house to generate with.
                </h3>
            </div>
            <div
                className="px-8 flex">
                <div className={cn(
                    "w-full min-w-[300px] min-h-[162px] max-w-[400px]",
                    !selectedHouses.length ? "block" : "hidden",
                )}>
                    <HousesDrawer/>
                </div>
                {selectedHouses.map((house) => {
                    if (house === undefined) {
                        return <></>
                    }
                    return (
                        <HouseCard key={house.id} house={house}/>
                    )
                })}
            </div>
        </>
    )
}