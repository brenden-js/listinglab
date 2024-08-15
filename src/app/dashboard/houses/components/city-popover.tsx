import clsx from "clsx";
import React, {useState} from "react";
import {api} from "@/trpc/react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export const CityCard = ({city, selected, onClick}: {
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

export const AddCityForm = ({onClose, onSuccess}: { onClose: () => void, onSuccess: () => void }) => {
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