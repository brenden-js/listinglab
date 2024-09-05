"use client"
import {ScrollArea} from "@/components/ui/scroll-area";
import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ChatInterface} from "@/app/dashboard/houses/components/chat-interface";
import React, {useState} from "react";
import {api} from "@/trpc/react";
import {HouseDialogProvider} from "@/app/dashboard/contexts/house-dialog-context";

const HouseDetailsPage = ({params}: { params: { houseId: string } }) => {
    const house = api.house.getHouseDetails.useQuery(params.houseId)

    const [currentChat, setCurrentChat] = useState('Main');
    const [showDataView, setShowDataView] = useState(false);

    const claimHouse = api.house.claimHouse.useMutation()

    const handleEnableSearch = () => {
        if (!house.data) return
        console.log('Claiming house...')
        claimHouse.mutate({houseId: house.data.id})
    };

    if (!house.data) return <div>Loading...</div>
    return (
        <HouseDialogProvider>
            <div className="w-full h-full flex flex-col">
                <div>
                    <div>{house.data.stAddress}</div>
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
                                <LiveDataFeed houseId={house.data.id} claimed={!!house.data.claimed}/>
                                <Button disabled={!!house.data.claimed || claimHouse.isPending}
                                        onClick={handleEnableSearch}>Get
                                    Data</Button>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="w-[75%] pt-4 flex flex-col">
                        <div className="px-4 pb-4 flex items-center">
                            <div className="bg-secondary rounded-lg p-1.5">
                                <Button variant="secondary"
                                        className={cn("w-[150px] hover:bg-secondary", currentChat === 'Main' && 'bg-white hover:bg-white text-black shadow')}
                                        onClick={() => setCurrentChat('Main')}>
                                    Main Chat
                                </Button>
                            </div>
                            <Tabs value={currentChat} onValueChange={setCurrentChat as any} className="pl-4">
                                <TabsList className={""}>
                                    <TabsTrigger value="Property">Property Chat</TabsTrigger>
                                    <TabsTrigger value="Location">Location Chat</TabsTrigger>
                                    <TabsTrigger value="Financial">Financial Chat</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <ChatInterface showDataView={showDataView} setShowDataView={setShowDataView}
                                       house={house.data}/>
                    </div>
                </div>
            </div>
        </HouseDialogProvider>
    )
}

export default HouseDetailsPage