"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {CurrentPromptContext, House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useCallback, useContext, useEffect, useState} from "react";
import clsx from "clsx";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import {Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle} from "@/components/ui/dialog";
import {Textarea} from "@/components/ui/textarea";
import {useQueryClient} from "@tanstack/react-query";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";


const ExpertiseFeed = ({house}: { house: House | UnhydratedHouse }) => {
    const {updateExpertise} = useContext(CurrentPromptContext)

    const [expertise, setExpertise] = useState('')

    if (!house) {
        return <></>
    }
    const onSubmit = async () => {
        await updateExpertise(expertise, house.id)
    }

    return (
        <>
            <Tabs defaultValue="interior" className="w-full group">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="interior">House Data</TabsTrigger>
                    <TabsTrigger value="exterior">Neighborhood Data</TabsTrigger>
                    <TabsTrigger value="investment">Mortgage & Investment Data</TabsTrigger>
                </TabsList>
                <TabsContent value="interior">
                    <Card
                        className="transition-opacity duration-300 opacity-70 group-hover:opacity-100 hover:opacity-100">
                        <CardHeader>
                            <CardTitle>House and listing details</CardTitle>
                            <CardDescription>
                                Create content using listing data and house data. Includes
                                details about the house like square footage, property features, and more.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="exterior">
                    <Card
                        className="transition-opacity duration-300 opacity-70 group-hover:opacity-100 hover:opacity-100">
                        <CardHeader>
                            <CardTitle>Neighborhood and business data</CardTitle>
                            <CardDescription>
                                Create content using places nearby the house. Searches for the nearest 20 places.
                                Includes restaurants, grocery stores, parks, and other
                                notable places.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="investment">
                    <Card
                        className="transition-opacity duration-300 opacity-70 group-hover:opacity-100 hover:opacity-100">
                        <CardHeader>
                            <CardTitle>Mortgage and investment data</CardTitle>
                            <CardDescription>
                                Create content that analyzes the numbers on the house. Includes recently sold listings,
                                estimated FHA and traditional mortgage estimates, down payment, and more.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
        </>
    )
}

const HouseDialog = ({house, open, onOpenChange}: {
    house: House,
    open: boolean,
    onOpenChange: (open: boolean) => void
}) => {
    const {claimSelectedHouse} = useContext(CurrentPromptContext)

    const claimHouse = api.house.claimHouse.useMutation()
    const queryClient = useQueryClient();

    const onClaimMutation = async (houseId: string) => {
        console.log('Claiming house...')
        claimHouse.mutate({houseId})
        claimSelectedHouse(houseId)
    }


    if (!house) return null;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogOverlay asChild>
            </DialogOverlay>
            <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw]">
                <DialogHeader>
                    <DialogTitle>{house.stAddress}</DialogTitle>
                </DialogHeader>
                <div className="flex">
                    <div className="w-[38.2%] border-r border-gray-200 pr-5">
                        <div className="space-y-4">
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
                            {house.claimed ? (
                                <ExpertiseFeed house={house}/>
                            ) : (
                                <Button>
                                    Gather data
                                </Button>
                            )}
                        </div>
                    </div>
                    <div className="w-[61.8%]">
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {/* Message history */}
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="font-semibold">AI</p>
                                <p>Welcome! How can I assist you with information about this property?</p>
                            </div>
                            <div className="bg-blue-100 p-3 rounded-lg ml-auto max-w-[80%]">
                                <p className="font-semibold">You</p>
                                <p>Can you tell me more about the neighborhood?</p>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <p className="font-semibold">AI</p>
                                <p>Certainly! This property is located in a vibrant area with many amenities nearby.
                                    There are several parks within walking distance, and the neighborhood is known for
                                    its excellent schools. Would you like more specific information about any particular
                                    aspect of the neighborhood?</p>
                            </div>
                        </div>
                        <div className="p-4 border-t">
                            <form className="flex space-x-2">
                                <Textarea
                                    placeholder="Type your message here..."
                                    className="flex-grow p-2 border rounded-lg"
                                />
                                <Button
                                    type="submit"
                                >
                                    Send
                                </Button>
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
                                            <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4" key={city.id}>
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
    )
}