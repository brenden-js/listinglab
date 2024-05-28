import {useCallback, useEffect, useMemo, useState} from "react";
import {CheckCircledIcon, CrossCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import {iot, mqtt} from "aws-iot-device-sdk-v2";
import {Resource} from "sst";
import {useAuth} from "@clerk/nextjs";
import {House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";


export const LiveDataFeed = ({house}: { house: House | UnhydratedHouse }) => {

    // const statusStates = useMemo(() => {
    //   const states = {
    //     basic: 'loading',
    //     neighborhood: 'loading',
    //     investment: 'loading',
    //   };
    //
    //   messages.forEach((message) => {
    //     const { type, status } = message as MessageData;
    //
    //     if (type === 'basic' && (status === 'complete' || status === 'not_found')) {
    //       states.basic = status;
    //     } else if (type === 'neighborhood' && (status === 'complete' || status === 'not_found')) {
    //       states.neighborhood = status;
    //     } else if (type === 'investment' && (status === 'complete' || status === 'not_found')) {
    //       states.investment = status;
    //     }
    //   });
    //
    //   return states;
    // }, [messages]);

    // useEffect(() => {
    //   const shouldDisconnect =
    //     statusStates.basic !== 'loading' &&
    //     statusStates.neighborhood !== 'loading' &&
    //     statusStates.investment !== 'loading';
    //
    //   if (shouldDisconnect) {
    //     channel.unsubscribe();
    //   }
    //
    //   return () => {
    //     channel.unsubscribe();
    //   };
    // }, [statusStates]);

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
                                {/*{statusStates.basic === 'loading' && <ReloadIcon className={"animate-spin h-4 w-4"} />}*/}
                                {/*{statusStates.basic === 'complete' && <CheckCircledIcon className={"h-4 w-4"} />}*/}
                                {/*{statusStates.basic === 'not_found' && <CrossCircledIcon className={"h-4 w-4"} />}*/}
                            </div>
                        )}
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Neighborhood</p>
                    <div className={"text-sm"}>
                        {house.nearbyPlaces ? (<CheckCircledIcon className={"h-5 w-5"}/>) : (
                            <div>
                                {/*{statusStates.neighborhood === 'loading' && <ReloadIcon className={"animate-spin h-4 w-4"} />}*/}
                                {/*{statusStates.neighborhood === 'complete' && <CheckCircledIcon className={"h-4 w-4"} />}*/}
                                {/*{statusStates.neighborhood === 'not_found' && <CrossCircledIcon className={"h-4 w-4"} />}*/}
                            </div>
                        )}
                    </div>
                </div>
                <div className={"flex justify-between"}>
                    <p className={"text-sm"}>Investment Data</p>
                    <div className={"text-sm"}>
                        {house.investment ? (<CheckCircledIcon className={"h-5 w-5"}/>) : (
                            <div>
                                {/*{statusStates.investment === 'loading' && (*/}
                                {/*  <ReloadIcon className={"animate-spin h-4 w-4"} />*/}
                                {/*)}*/}
                                {/*{statusStates.investment === "complete" && (*/}
                                {/*  <CheckCircledIcon className={"h-4 w-4"} />*/}
                                {/*)}*/}
                                {/*{statusStates.investment === "not_found" && (*/}
                                {/*  <CrossCircledIcon className={"h-4 w-4"} />*/}
                                {/*)}*/}
                            </div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};