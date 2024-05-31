"use client"
import {CheckCircledIcon, CrossCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import {House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/realtime-messages";


export const LiveDataFeed = ({house}: { house: House | UnhydratedHouse }) => {

    const { updates } = useHouseUpdateContext()
    if (!house) {
        return <div>No house found</div>
    }

    console.log('Updates here:', updates)

    if (!house) {
        return <p>Nothing found...</p>
    }

    return (
        <div className={"flex flex-col"}>
            <div className={"flex text-sm text-muted-foreground"}>Data aggregated</div>
            <div className={"w-full"}>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Listing</p>
                    <div className={"text-sm"}>
                        {house.lat ? (<CheckCircledIcon className={"h-5 w-5"}/>) : (
                            <div>
                                {/*{getUpdateStatus("basic") === "loading" && <ReloadIcon className={"animate-spin h-4 w-4"}/>}*/}
                                {/*{getUpdateStatus("basic") === "complete" && <CheckCircledIcon className={"h-4 w-4"}/>}*/}
                                {/*{getUpdateStatus("basic") === "fail" && <CrossCircledIcon className={"h-4 w-4"}/>}*/}
                            </div>
                        )}
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Neighborhood</p>
                    <div className={"text-sm"}>
                        {house.nearbyPlaces ? (<CheckCircledIcon className={"h-5 w-5"}/>) : (
                            <div>
                                {/*{getUpdateStatus("neighborhood") === "loading" &&*/}
                                {/*    <ReloadIcon className={"animate-spin h-4 w-4"}/>}*/}
                                {/*{getUpdateStatus("neighborhood") === "complete" &&*/}
                                {/*    <CheckCircledIcon className={"h-4 w-4"}/>}*/}
                                {/*{getUpdateStatus("neighborhood") === "fail" &&*/}
                                {/*    <CrossCircledIcon className={"h-4 w-4"}/>}*/}
                            </div>
                        )}
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Investment Data</p>
                    <div className={"text-sm"}>
                        {house.investment ? (<CheckCircledIcon className={"h-5 w-5"}/>) : (
                            <div>
                                {/*{getUpdateStatus("investment") === "loading" && (*/}
                                {/*    <ReloadIcon className={"animate-spin h-4 w-4"}/>*/}
                                {/*)}*/}
                                {/*{getUpdateStatus("investment") === "complete" && (*/}
                                {/*    <CheckCircledIcon className={"h-4 w-4"}/>*/}
                                {/*)}*/}
                                {/*{getUpdateStatus("investment") === "fail" && (*/}
                                {/*    <CrossCircledIcon className={"h-4 w-4"}/>*/}
                                {/*)}*/}
                            </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};