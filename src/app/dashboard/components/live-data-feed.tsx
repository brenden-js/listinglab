import React, {useCallback, useEffect} from 'react';
import {CheckCircledIcon, CrossCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import {api} from "@/trpc/react";

export const LiveDataFeed = ({houseId, claimed}: { houseId: string, claimed: boolean }) => {

    const utils = api.useUtils()

    const {data: house, } = api.house.getHouseDetails.useQuery(houseId, {
        refetchInterval: (query) =>
            (query.state.data?.nearbyPlaces && query.state.data?.investment && query.state.data?.recentlySold)
            || !claimed
                ? false : 3000,
    });


    useEffect(() => {
        if (house?.investment || house?.nearbyPlaces || house?.recentlySold) {
            const currentHouses = utils.house.getHouses.getData();
            console.log('current houses...', currentHouses)
            if (currentHouses) {
                utils.house.getHouses.refetch()
            }
        }
    }, [house, houseId, utils.house.getHouses])

    if (!house) {
        return <div>Loading...</div>;
    }

    const getUpdateIcon = (field: keyof typeof house) => {
        if (house[field] !== null) {
            return <CheckCircledIcon className="h-4 w-4"/>;
        } else if (!claimed) {
            return <CrossCircledIcon className="h-4 w-4"/>
        } else if (claimed && house[field] === null) {
            return <ReloadIcon className="animate-spin h-4 w-4"/>
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex text-sm text-muted-foreground">Data aggregated</div>
            <div className="w-full">
                <div className="flex justify-between">
                    <p className="text-sm">Property</p>
                    <div className="text-sm">
                        {getUpdateIcon('lat')}
                    </div>
                </div>
                <div className="flex justify-between">
                    <p className="text-sm">Location</p>
                    <div className="text-sm">
                        {getUpdateIcon('nearbyPlaces')}
                    </div>
                </div>
                <div className="flex justify-between">
                    <p className="text-sm">Financial</p>
                    <div className="text-sm">
                        {getUpdateIcon('investment')}
                    </div>
                </div>
                <div className="flex justify-between">
                    <p className="text-sm">Comps</p>
                    <div className="text-sm">
                        {getUpdateIcon('recentlySold')}
                    </div>
                </div>
            </div>
        </div>
    );
};