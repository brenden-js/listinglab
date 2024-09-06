"use client"
import {ScrollArea} from "@/components/ui/scroll-area";
import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";
import {Button} from "@/components/ui/button";
import {ChatInterface} from "@/app/dashboard/houses/components/chat-interface";
import React, {useState} from "react";
import {api} from "@/trpc/react";
import Link from "next/link";
import {ArrowLeftIcon} from "@radix-ui/react-icons";

const HouseDetailsPage = ({params}: { params: { houseId: string } }) => {
    const house = api.house.getHouseDetails.useQuery(params.houseId)
    const [showDataView, setShowDataView] = useState(false);

    if (!house.data) return <div></div>

    return (
            <div className="w-full h-full max-h-[100vh] flex flex-col">
                <div className={'flex pt-4'}>
                    <Link href={`/dashboard/houses`} passHref>
                        <Button variant="secondary" size="sm" className={"ml-3"}>
                            <ArrowLeftIcon className="mr-2"/>
                            Houses
                        </Button>
                    </Link>
                    <h1 className={"text-2xl font-bold ml-4"}>
                        {`${house.data.stAddress}, ${house.data.city}, ${house.data.state} ${house.data.zipCode}`}
                    </h1>
                </div>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[25%] pt-4 border-r border-gray-200 pr-5 overflow-y-auto">
                        <ScrollArea className="h-full">
                            <div className="space-y-4 p-4">
                                <h2 className="text-2xl font-bold">{house.data.price ? `$${house.data.price.toLocaleString()}` : 'Price not available'}</h2>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Beds: {house.data.beds || 'N/A'}</div>
                                    <div>Baths: {house.data.baths || 'N/A'}</div>
                                    <div>Sqft: {house.data.sqft?.toLocaleString() || 'N/A'}</div>
                                    <div>Year Built: {house.data.yearBuilt || 'N/A'}</div>
                                </div>
                                <div className="text-sm">
                                    <p>
                                        <strong>Address:</strong> {house.data.stAddress}, {house.data.city}, {house.data.state} {house.data.zipCode}
                                    </p>
                                    <p><strong>Lot
                                        Size:</strong> {house.data.lotSqft ? `${house.data.lotSqft.toLocaleString()} sqft` : 'N/A'}
                                    </p>
                                    <p><strong>Price per
                                        Sqft:</strong> {house.data.pricePerSqft ? `$${house.data.pricePerSqft}` : 'N/A'}
                                    </p>
                                </div>
                                {house.data && (<LiveDataFeed houseId={house.data.id} house={house.data} isPending={house.isPending}/>)}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="w-[75%] pt-4 flex flex-col">
                        <ChatInterface showDataView={showDataView} setShowDataView={setShowDataView}
                                       house={house.data}/>
                    </div>
                </div>
            </div>
    )
}

export default HouseDetailsPage