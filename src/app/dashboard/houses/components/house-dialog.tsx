import React, {useState} from "react";
import {House} from "@/app/dashboard/contexts/prompts";
import {useHouseDialog} from "@/app/dashboard/contexts/house-dialog-context";
import {api} from "@/trpc/react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";
import {Button} from "@/components/ui/button";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ChatInterface} from "@/app/dashboard/houses/components/chat-interface";

export const HouseDialog: React.FC<{
    house: House,
    open: boolean,
    onOpenChange: (open: boolean) => void
}> = ({house, open, onOpenChange}) => {
    const {currentChat, setCurrentChat} = useHouseDialog();
    const [showDataView, setShowDataView] = useState(false);

    if (!house) return null;
    const claimHouse = api.house.claimHouse.useMutation()

    const utils = api.useUtils()


    const handleEnableSearch = () => {
        console.log('Claiming house...')
        claimHouse.mutate({houseId: house.id})
        // use update the house as claimed using useUtils from api
        utils.house.getHouses.setData(undefined, (old) => {
            return old?.map(h => {
                if (h?.id === house?.id) {
                    const claimedHouse = {
                        ...h,
                        claimed: 1
                    }
                    return claimedHouse
                }
                return h
            })
        })
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{house.stAddress}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[38.2%] pt-4 border-r border-gray-200 pr-5 overflow-y-auto">
                        <ScrollArea className="h-full">
                            <div className="space-y-4 p-4">
                                <h2 className="text-2xl font-bold">{house.price ? `$${house.price.toLocaleString()}` : 'Price not available'}</h2>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Beds: {house.beds || 'N/A'}</div>
                                    <div>Baths: {house.baths || 'N/A'}</div>
                                    <div>Sqft: {house.sqft?.toLocaleString() || 'N/A'}</div>
                                    <div>Year Built: {house.yearBuilt || 'N/A'}</div>
                                </div>
                                <div className="text-sm">
                                    <p>
                                        <strong>Address:</strong> {house.stAddress}, {house.city}, {house.state} {house.zipCode}
                                    </p>
                                    <p><strong>Lot
                                        Size:</strong> {house.lotSqft ? `${house.lotSqft.toLocaleString()} sqft` : 'N/A'}
                                    </p>
                                    <p><strong>Price per
                                        Sqft:</strong> {house.pricePerSqft ? `$${house.pricePerSqft}` : 'N/A'}
                                    </p>
                                </div>
                                <LiveDataFeed houseId={house.id} claimed={!!house.claimed}/>
                                <Button disabled={!!house.claimed || claimHouse.isPending} onClick={handleEnableSearch}>Get
                                    Data</Button>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="w-[61.8%] pt-4 flex flex-col">
                        <div className="px-4 pb-4 flex items-center justify-between">
                            <Button variant="secondary" className="w-[150px]" onClick={() => setCurrentChat('Main')}>
                                Main Chat
                            </Button>
                            <Tabs value={currentChat} onValueChange={setCurrentChat as any} className="pl-4">
                                <TabsList className={""}>
                                    <TabsTrigger value="Property">Property Chat</TabsTrigger>
                                    <TabsTrigger value="Location">Location Chat</TabsTrigger>
                                    <TabsTrigger value="Financial">Financial Chat</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                        <ChatInterface showDataView={showDataView} setShowDataView={setShowDataView} house={house}/>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};