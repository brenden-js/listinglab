"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {House} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

const HousePreviewCard = ({ house }: { house: House }) => {
    if (!house) return null;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>{house.stAddress}</CardTitle>
                <CardDescription>
                    {house.city} {house.zipCode}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="flex justify-between items-center">
                    <Button variant="secondary">Go to house</Button>
                </div>
            </CardContent>
        </Card>
    );
};

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
            <div className="px-4 py-6 sm:px-6 md:px-8 lg:px-10">
                {houses.isPending && <LoadingSkeletons/>}
                {!houses.isPending && houses.isSuccess && houses.data.length > 0 && (
                    <div className="flex flex-wrap -mx-2">
                        {houses.data.map((house) => (
                            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4" key={house.id}>
                                <HousePreviewCard house={house}/>
                            </div>
                        ))}
                    </div>
                )}
                {!houses.isPending && houses.isSuccess && houses.data.length === 0 && (
                    <div>No houses found.</div>
                )}
            </div>
        </div>
    )
}