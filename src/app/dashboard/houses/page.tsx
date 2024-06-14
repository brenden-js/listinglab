"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {House} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

const HousePreviewCard = (house: House) => {
    if (!house) return
    return (
        <Card className="w-[400px]">
            <CardContent className="flex flex-col">
                <div className="flex justify-between my-6">
                    <div>
                        <CardTitle>{house.stAddress}</CardTitle>
                        <CardDescription>{house.city} {house.zipCode}</CardDescription>
                    </div>
                    <Button
                        variant="secondary"
                    >
                        Go to house
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

const LoadingSkeletons = () => (
    <div className="grid grid-cols-3 gap-4">
        {Array.from({length: 6}).map((_, index) => (
            <div
                key={index}
                className="bg-gray-200 animate-pulse rounded-md p-4"
                style={{height: "150px"}}
            />
        ))}
    </div>
);


export default function HousesPageOverview() {
    const currentCity = "Temecula"
    const houses = api.house.getHouses.useQuery()
    return (
        <div className={"h-full flex flex-col"}>
            <div className={"ml-3 flex items-center flex-row h-16"}>
                <h2 className="text-lg font-semibold">Houses</h2>
                <h4 className={"ml-3"}>{`Currently showing: ${currentCity}`}</h4>
            </div>
            <Separator/>
            {houses.isPending && <LoadingSkeletons/>}u
            {!houses.isPending && houses.isSuccess && houses.data.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                    {houses.data.map((house) => (
                        <HousePreviewCard key={house.id} house={house}/>
                    ))}
                </div>
            )}
            {!houses.isPending && houses.isSuccess && houses.data.length === 0 && (
                <div>No houses found.</div>
            )}
        </div>
    )
}