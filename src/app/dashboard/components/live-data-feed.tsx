"use client"
import {CheckCircledIcon, CrossCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import {House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import {useEffect, useState} from "react";


export const LiveDataFeed = ({house}: { house: House | UnhydratedHouse }) => {

    const {updates} = useHouseUpdateContext()
    const [updateStatus, setUpdateStatus] = useState({
        Property: 'in-progress',
        Financial: 'in-progress',
        Location: 'in-progress',
    });

    useEffect(() => {
        // Find the latest update for the house
        const houseUpdates = updates.filter(update => update.houseId === house!.id);

        // Update the status based on the latest update
        houseUpdates.forEach(update => {
            if (update.updateType === 'LiveDataFeedUpdate') {
                setUpdateStatus(prevStatus => ({
                    ...prevStatus,
                    [update.dataCategory]: update.jobStatus,
                }));
            }
        });
    }, [updates, house]);

    if (!house) {
        return <div>No house found</div>
    }

    const getUpdateIcon = (category: 'Property' | 'Financial' | 'Location') => {
        if (updateStatus[category] === 'in-progress') {
            return <ReloadIcon className="animate-spin h-4 w-4"/>;
        } else if (updateStatus[category] === 'complete') {
            return <CheckCircledIcon className="h-4 w-4"/>;
        } else {
            return <CrossCircledIcon className="h-4 w-4"/>;
        }
    };

    return (
        <div className={"flex flex-col"}>
            <div className={"flex text-sm text-muted-foreground"}>Data aggregated</div>
            <div className={"w-full"}>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Property</p>
                    <div className={"text-sm"}>
                        <div className="text-sm">{house.lat ?
                            <CheckCircledIcon className="h-4 w-4"/> : getUpdateIcon('Property')}</div>
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Location</p>
                    <div className={"text-sm"}>
                        <div className="text-sm">{house.nearbyPlaces ?
                            <CheckCircledIcon className="h-4 w-4"/> : getUpdateIcon('Location')}</div>
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Financial</p>
                    <div className={"text-sm"}>
                        <div className="text-sm">{house.investment ?
                            <CheckCircledIcon className="h-4 w-4"/> : getUpdateIcon('Financial')}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};