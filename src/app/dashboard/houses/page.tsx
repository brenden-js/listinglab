"use client"
import {api} from "@/trpc/react";
import {Separator} from "@/components/ui/separator";
import {House} from "@/app/dashboard/contexts/prompts";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {useCallback, useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import clsx from "clsx";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";
import {useHouseUpdateContext} from "@/app/dashboard/contexts/house-updates-context";
import {HouseUpdateContextValue} from "@/lib/contexts/house-updates";

const HousePreviewCard = ({house}: { house: House }) => {
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
                {`Listed at $${house.price?.toLocaleString()} Found at
                ${house.createdAt.toLocaleDateString()}`} </CardContent>
            <CardFooter>
                <div className="flex justify-between items-center">
                    <Button variant="secondary">Go to house</Button>
                </div>
            </CardFooter>
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
                    <span className={"text-sm text-muted-foreground"}>{city.id}</span>
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