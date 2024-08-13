"use client"
import {useContext, useEffect} from "react";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AddExpertiseDrawer} from "@/app/dashboard/components/expertise-drawer";
import {RecentGenerations} from "@/app/dashboard/components/recent-generations";
import {CurrentPromptContext, House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";
import {api} from "@/trpc/react";
import {toast} from "sonner";
import {clsx} from "clsx";
import {useQueryClient} from "@tanstack/react-query";


export const HouseCard = ({house}: { house: House | UnhydratedHouse }) => {
    const {removeHouse, claimSelectedHouse} = useContext(CurrentPromptContext)

    const claimHouse = api.house.claimHouse.useMutation()
    const queryClient = useQueryClient();

    useEffect(() => {
        if (claimHouse.isSuccess) {
            toast.success('House claimed successfully.')
            // Refresh the api.house.getHouses list
            queryClient.refetchQueries({ queryKey: ['house', 'getHouses'] });

        }
    }, [claimHouse.isSuccess])

    const onClaim = async (houseId: string) =>{
        console.log('Claiming house...')
        claimHouse.mutate({houseId})
        claimSelectedHouse(houseId)
    }

    if (!house) {
        return <></>
    }

    return (
        <div key={house.id} className="flex flex-col">
            <div className={"w-full"}>
                <Card className="w-[400px]">
                    <CardContent className="flex flex-col">
                        <div className="flex justify-between my-6">
                            <div>
                                <CardTitle>{house.stAddress}</CardTitle>
                                <CardDescription>{house.city} {house.zipCode}</CardDescription>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => removeHouse(house)}
                            >
                                Remove house
                            </Button>
                        </div>
                        {!house.claimed ?
                            <Button disabled={claimHouse.isPending} className={clsx(claimHouse.isPending && "animate-pulse")} onClick={() => onClaim(house.id)}>Get data for this house</Button>
                            : <LiveDataFeed houseId={house.id} claimed={!!house.claimed}/>
                        }
                    </CardContent>
                </Card>
                <div className="my-4">
                    <AddExpertiseDrawer
                        houseId={house.id}
                    />
                </div>
                <RecentGenerations houseId={house.id}/>
            </div>
        </div>
    )
}