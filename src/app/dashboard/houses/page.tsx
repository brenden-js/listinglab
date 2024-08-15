"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {House} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import React, { useEffect, useState} from "react";
import {HouseDialogProvider, } from "@/app/dashboard/contexts/house-dialog-context";
import {HouseDialog} from "@/app/dashboard/houses/components/house-dialog";
import {AddCityForm, CityCard} from "@/app/dashboard/houses/components/city-popover";

export interface ChatMessage {
    sender: string;
    message: string;
}

const HousePreviewCard = ({house}: { house: House }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (!house) return null;

    return (
        <>
            <Card
                className="h-full transition-all duration-300 hover:shadow-sm cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <CardHeader>
                    <CardTitle>{house.stAddress}</CardTitle>
                    <CardDescription>
                        {house.city} {house.zipCode}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    {`Listed at $${house.price?.toLocaleString()} Found at
                    ${house.createdAt.toLocaleDateString()}`}
                </CardContent>
            </Card>
            <HouseDialog house={house} open={isDialogOpen} onOpenChange={setIsDialogOpen}/>
        </>
    );
};

const LoadingSkeletons = () => (
    <div className="grid grid-cols-4 gap-4">
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
    //
    const currentCities = api.house.getUserCities.useQuery()

    // function that invalidates the currentCities query and when a new city is added, it will update the selectedCity state
    const onAddCitySuccess = () => {
        currentCities.refetch()
    }

    useEffect(() => {
        if (currentCities.isSuccess && currentCities.data.length > 0) {
            setSelectedCity(currentCities.data[0].cityName)
        }
    }, [currentCities])

    const houses = api.house.getHouses.useQuery()

    const [open, setOpen] = useState(false)
    const [openAddCity, setOpenAddCity] = useState(false)
    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined)

    return (
        <HouseDialogProvider>
            <div className={"h-full flex flex-col"}>
                <div className={"ml-3 flex items-center flex-row h-16"}>
                    <h2 className="text-lg font-semibold">Houses</h2>
                    {/*// show current city*/}
                    {currentCities.isPending && <div className={"animate-pulse h-5 w-16 rounded-xl"}></div>}
                    {!currentCities.isPending && currentCities.isSuccess && currentCities.data.length > 0 && (
                        <div className="ml-3 flex items-center gap-2">
                            <div className="text-lg font-semibold">
                                {currentCities.data[0].cityName}, {currentCities.data[0].state}
                            </div>
                        </div>
                    )}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button variant="secondary" className={"ml-3"}>
                                Change City
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px]">
                            {openAddCity &&
                                <AddCityForm onSuccess={onAddCitySuccess} onClose={() => setOpenAddCity(false)}/>}
                            {!openAddCity && <>
                                <h4 className="font-medium mt-2">My Cities</h4>
                                {/*// create a list of a users cities, and a plus button to add a new city at the bottom*/}
                                {/* add a search box to look for a new city, which will then display the found city and ask for a confirmation*/}
                                <div className="flex flex-col gap-2">
                                    {currentCities.isPending && <LoadingSkeletons/>}
                                    {!currentCities.isPending && currentCities.isSuccess && currentCities.data.length > 0 && (
                                        <div className="flex flex-wrap -mx-2">
                                            {currentCities.data.map((city) => (
                                                <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
                                                     key={city.id}>
                                                    <CityCard city={city} selected={selectedCity === city.cityName}
                                                              onClick={() => setSelectedCity(city.cityName)}/>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {!currentCities.isPending && currentCities.isSuccess && currentCities.data.length === 0 && (
                                        <div>No cities found.</div>
                                    )}
                                </div>
                                <div className="flex justify-end">
                                    <Button variant="secondary" className={"ml-3"}
                                            onClick={() => setOpenAddCity(true)}
                                    >
                                        Add City
                                    </Button>
                                </div>
                            </>}
                        </PopoverContent>
                    </Popover>
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
        </HouseDialogProvider>
    )
}