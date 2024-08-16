"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {House} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import React, {useEffect, useState} from "react";
import {HouseDialogProvider,} from "@/app/dashboard/contexts/house-dialog-context";
import {HouseDialog} from "@/app/dashboard/houses/components/house-dialog";
import {ChatBubbleIcon} from "@radix-ui/react-icons";
import {AddCityDialog} from "@/app/dashboard/houses/components/city-dialog";

export interface ChatMessage {
    sender: string;
    message: string;
}
const HousePreviewCard = ({ house }: { house: House }) => {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  if (!house) return null;

  const expertiseData = getExpertiseData(house);
  const totalMessages =  expertiseData ? getTotalMessages(expertiseData) : 0;

  return (
    <>
      <Card
        className="h-full transition-all duration-300 hover:shadow-sm cursor-pointer"
        onClick={() => setIsDialogOpen(true)}
      >
        {totalMessages > 0 && (
          <MessageIndicator messages={totalMessages} />
        )}
        <CardHeader className="flex">
          <CardTitle className="text-lg font-bold">
            {house.stAddress}
          </CardTitle>
          <CardDescription className="text-sm text-gray-500">
            {house.city}, {house.state} {house.zipCode}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <HouseDetails house={house} />
        </CardContent>
      </Card>
      <HouseDialog house={house} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </>
  );
};

const getExpertiseData = (house: House) => {
    if (!house) return {
        mainExpertise: 0,
        locationExpertise: 0,
        financialExpertise: 0,
        propertyExpertise: 0,
    }
  const mainExpertise = house.mainExpertise ? JSON.parse(house.mainExpertise).filter((message: ChatMessage) => message.sender === 'You').length : 0;
  const locationExpertise = house.locationExpertise ? JSON.parse(house.locationExpertise).filter((message: ChatMessage) => message.sender === 'You').length : 0;
  const financialExpertise = house.financialExpertise ? JSON.parse(house.financialExpertise).filter((message: ChatMessage) => message.sender === 'You').length : 0;
  const propertyExpertise = house.propertyExpertise ? JSON.parse(house.propertyExpertise).filter((message: ChatMessage) => message.sender === 'You').length : 0;

  return {
    mainExpertise,
    locationExpertise,
    financialExpertise,
    propertyExpertise,
  };
};

const getTotalMessages = (expertiseData: { [key: string]: number } | undefined) => {
    if (!expertiseData) return 0;
  return Object.values(expertiseData).reduce((acc, messages) => acc + messages, 0);
};

const MessageIndicator = ({ messages }: { messages: number }) => {
  return (
    <div className="relative">
      <div
        className="absolute text-gray-500 top-6 right-6 p-1 rounded-md flex justify-center items-center"
      >
        <ChatBubbleIcon className="pr-0.5 h-5 w-5 text-lg text-gray-400" />
        <span className="text-sm font-semibold text-gray-500">{messages}</span>
      </div>
    </div>
  );
};

const HouseDetails = ({ house }: { house: House }) => {
    if (!house) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <span className="text-lg font-bold">${house.price?.toLocaleString()}</span>
        <span className="text-sm text-gray-500 block">Listed at {house.createdAt.toLocaleDateString()}</span>
      </div>
      <div>
        <span className="text-md">{house.beds} Beds | {house.baths} Baths</span>
        <span className="text-md block">{house.sqft.toLocaleString()} Sqft</span>
      </div>
    </div>
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

    const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined)


    const [openCityDialog, setOpenCityDialog] = useState(false)

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
                    <Button variant="secondary" className={"ml-3"} onClick={() => setOpenCityDialog(true)}>
                        Change City 1
                    </Button>
                    <AddCityDialog open={openCityDialog} onOpenChange={setOpenCityDialog} />
                </div>
                <Separator/>
                <div className="p-3">
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