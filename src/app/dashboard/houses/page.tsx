"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {CurrentPromptContext, House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import clsx from "clsx";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import {Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {HouseDialogProvider, useHouseDialog} from "@/app/dashboard/contexts/house-dialog-context";
import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";
import {motion, AnimatePresence} from 'framer-motion';
import {ScrollArea} from "@/components/ui/scroll-area";

interface ChatInterfaceProps {
    showDataView: boolean;
    setShowDataView: (show: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({showDataView, setShowDataView}) => {
    const {currentChat} = useHouseDialog();

    // Dummy data for different chats
    const chatData = {
        Property: [
            {sender: 'Deena', message: 'Welcome! How can I assist you with information about this property?'},
            {sender: 'You', message: 'Can you tell me more about the interior features?'},
            {sender: 'Deena', message: 'Certainly! This property features...'},
        ],
        Location: [
            {sender: 'Deena', message: 'What would you like to know about the neighborhood?'},
            {sender: 'You', message: 'Are there any parks nearby?'},
            {sender: 'Deena', message: 'Yes, there are several parks in the area...'},
        ],
        Financial: [
            {sender: 'Deena', message: 'How can I help you with the financial aspects of this property?'},
            {sender: 'You', message: 'What are the estimated mortgage payments?'},
            {sender: 'Deena', message: 'Based on the current price, the estimated monthly mortgage payment is...'},
        ],
    };

    // Dummy data for different data views
    const dataViews = {
        Property: (
            <div>
                <h3 className="text-xl font-bold mb-4">Property Details</h3>
                <p><strong>Square Footage:</strong> 2,500 sq ft</p>
                <p><strong>Lot Size:</strong> 0.25 acres</p>
                <p><strong>Year Built:</strong> 1995</p>
                <p><strong>Renovations:</strong> Kitchen (2018), Bathrooms (2020)</p>
            </div>
        ),
        Location: (
            <div>
                <h3 className="text-xl font-bold mb-4">Neighborhood Information</h3>
                <p><strong>School District:</strong> Oakwood Public Schools</p>
                <p><strong>Nearest Park:</strong> Sunset Park (0.5 miles)</p>
                <p><strong>Public Transportation:</strong> Bus stop (0.2 miles)</p>
                <p><strong>Shopping Centers:</strong> Downtown Mall (1.5 miles)</p>
            </div>
        ),
        Financial: (
            <div>
                <h3 className="text-xl font-bold mb-4">Financial Analysis</h3>
                <p><strong>Estimated Monthly Mortgage:</strong> $2,500</p>
                <p><strong>Property Tax (Annual):</strong> $5,000</p>
                <p><strong>Homeowners Insurance (Annual):</strong> $1,200</p>
                <p><strong>Estimated Utilities (Monthly):</strong> $300</p>
            </div>
        ),
    };

    return (
        <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {showDataView ? (
                        <motion.div
                            key="data"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.1}}
                        >
                            <Button variant="outline" onClick={() => setShowDataView(false)} className="mb-4">Back to Chat</Button>
                            {dataViews[currentChat]}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            exit={{opacity: 0, y: -20}}
                            transition={{duration: 0.1}}
                        >
                            <Button variant="outline" onClick={() => setShowDataView(true)}
                                    className="mb-4">View {currentChat} Data</Button>
                            <h3 className="font-bold mb-2">{currentChat} Chat</h3>
                            {chatData[currentChat].map((message, index) => (
                                <div key={index}
                                     className={`p-3 my-2 rounded-lg ${message.sender === 'You' ? 'bg-blue-100 ml-auto max-w-[80%]' : 'bg-gray-100'}`}>
                                    <p className="font-semibold">{message.sender}</p>
                                    <p>{message.message}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ScrollArea>
    );
};

const HouseDialog: React.FC<{
    house: House,
    open: boolean,
    onOpenChange: (open: boolean) => void
}> = ({house, open, onOpenChange}) => {
    const {currentChat, setCurrentChat} = useHouseDialog();
    const [showDataView, setShowDataView] = useState(false);

    if (!house) return null;

    const handleEnableSearch = () => {
        // Implement the logic to enable searching for additional data
        // This could trigger a backend process and update the LiveDataFeed
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{house.stAddress}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-[38.2%] border-r border-gray-200 pr-5 overflow-y-auto">
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
                                        Sqft:</strong> {house.pricePerSqft ? `$${house.pricePerSqft.toFixed(2)}` : 'N/A'}
                                    </p>
                                </div>
                                <LiveDataFeed house={house}/>
                                <Button onClick={handleEnableSearch}>Enable Data Search</Button>
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="w-[61.8%] flex flex-col">
                        <Tabs value={currentChat} onValueChange={setCurrentChat as any} className="pl-4 w-full">
                            <TabsList>
                                <TabsTrigger value="Property">Property Chat</TabsTrigger>
                                <TabsTrigger value="Location">Location Chat</TabsTrigger>
                                <TabsTrigger value="Financial">Financial Chat</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex-1 overflow-hidden">
                            <ChatInterface showDataView={showDataView} setShowDataView={setShowDataView}/>
                        </div>
                        <div className="p-4 border-t">
                            <form className="flex space-x-2">
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="flex-grow p-2 border rounded-lg"
                                />
                                <Button type="submit">Send</Button>
                            </form>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

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


const CityCard = ({city, selected, onClick}: {
    city: { userId: string, id: number, state: string, cityId: string, cityName: string },
    selected: boolean,
    onClick: () => void
}) => {
    return (
        <button
            key={city.id}
            className={clsx("w-[360px] rounded-md mt-2 mb-4 cursor-pointer hover:border-gray-400 duration-100 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
                selected ? 'border-indigo-500 ring-1 ring-indigo-500 hover:border-indigo-600 border-2 border-transparent' : 'border-2 border-gray-300'
            )}
            onClick={onClick}
        >
            <div className={"flex flex-row items-center justify-between py-5 px-5"}>
                <div className="flex-col items-start">
                    <h4 className={"font-semibold leading-none tracking-tight"}>{city.cityName}</h4>
                    <span className={"text-sm text-muted-foreground"}>{city.state}</span>
                </div>
                <div className={clsx("block h-5 w-5 rounded-full border-2 ",
                    selected ? 'bg-indigo-500' : ''
                )}></div>
            </div>
        </button>
    )
}

const AddCityForm = ({onClose, onSuccess}: { onClose: () => void, onSuccess: () => void }) => {
    const [cityName, setCityName] = useState("")

    const [searchResult, setSearchResult] = useState<{ cityName: string, state: string } | undefined>(undefined)
    const searchCity = api.house.searchCity.useMutation()

    const addCity = api.house.setUserCity.useMutation()

    const handleSearchCity = async () => {
        const result = await searchCity.mutateAsync({cityName})
        setSearchResult(result)
    }

    const handleAddCity = async () => {
        const result = await addCity.mutateAsync({cityName})
        if (result.status === "City set successfully") {
            onClose()
            toast.success("City set successfully")
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <h4 className="font-medium">Add City</h4>
            <div className="flex flex-col gap-2">
                <Input disabled={searchCity.isPending} placeholder="City Name"
                       value={cityName} onChange={(e) => setCityName(e.target.value)}/>
            </div>
            {searchResult && (
                <div className="flex flex-col gap-2">
                    <h4 className="font-medium">Found City</h4>
                    <div className="text-sm mb-1">
                        {searchResult.cityName}, {searchResult.state}
                    </div>
                    <Button variant="default" disabled={addCity.isPending} onClick={async () => {
                        await handleAddCity()
                        setSearchResult(undefined)
                        onSuccess()
                        onClose()
                    }}>
                        Accept and continue
                    </Button>
                    <Button variant="secondary" onClick={() => setSearchResult(undefined)}>
                        Try another city
                    </Button>
                </div>
            )}
            {!searchResult && (
                <div className="flex justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button className={"ml-3"} variant="default" onClick={handleSearchCity}>
                        Search City
                    </Button>
                </div>
            )}
        </div>
    )
}

const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

export default function HousesPageOverview() {
    const {updates} = useHouseUpdateContext()
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
    // use effect that invalidates the houses query when a new update is added where the messageCategory
    // is equal to new-house-found

    const debouncedRefetch = useCallback(
        debounce(() => {
            houses.refetch();
        }, 3000),
        [houses]
    );

    useEffect(() => {
        if (updates.length > 0 && updates[0].messageCategory === 'new-house-found') {
            debouncedRefetch();
        }
    }, [updates, debouncedRefetch]);
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