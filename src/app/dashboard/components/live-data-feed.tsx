"use client"
import {CheckCircledIcon, CrossCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import {House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import {useEffect, useState} from "react";


export const LiveDataFeed = ({house}: { house: House | UnhydratedHouse }) => {

    const { updates } = useHouseUpdateContext()
     const [updateStatus, setUpdateStatus] = useState({
        basic: 'loading',
        neighborhood: 'loading',
        investment: 'loading',
    });

    useEffect(() => {
        // Find the latest update for the house
        const houseUpdates = updates.filter(update => update.houseId === house.id);

        // Update the status based on the latest update
        houseUpdates.forEach(update => {
            setUpdateStatus(prevStatus => ({
                ...prevStatus,
                [update.updateCategory]: update.updateType,
            }));
        });
    }, [updates, house.id]);

    if (!house) {
        return <div>No house found</div>
    }

    const getUpdateIcon = (category: 'basic' | 'investment' | 'neighborhood') => {
        if (updateStatus[category] === 'loading') {
            return <ReloadIcon className="animate-spin h-4 w-4" />;
        } else if (updateStatus[category] === 'complete') {
            return <CheckCircledIcon className="h-4 w-4" />;
        } else {
            return <CrossCircledIcon className="h-4 w-4" />;
        }
    };

    return (
        <div className={"flex flex-col"}>
            <div className={"flex text-sm text-muted-foreground"}>Data aggregated</div>
            <div className={"w-full"}>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Listing</p>
                    <div className={"text-sm"}>
                        <div className="text-sm">{house.lat ? <CheckCircledIcon className="h-5 w-5"/> : getUpdateIcon('basic')}</div>
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Neighborhood</p>
                    <div className={"text-sm"}>
                        <div className="text-sm">{house.nearbyPlaces ?
                            <CheckCircledIcon className="h-5 w-5"/> : getUpdateIcon('neighborhood')}</div>
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Investment Data</p>
                    <div className={"text-sm"}>
                                            <div className="text-sm">{house.investment ? <CheckCircledIcon className="h-5 w-5" /> : getUpdateIcon('investment')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};