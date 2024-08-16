import clsx from "clsx";
import React, { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";


export const AddCityDialog = (open: boolean,
    onOpenChange: (open: boolean) => void) => {
  const [cityName, setCityName] = useState("")
  const [searchResult, setSearchResult] = useState<{ cityName: string, state: string } | undefined>(undefined)
  const searchCity = api.house.searchCity.useMutation()
  const addCity = api.house.setUserCity.useMutation()

  const handleSearchCity = async () => {
    const result = await searchCity.mutateAsync({ cityName })
    setSearchResult(result)
  }

  const handleAddCity = async () => {
    const result = await addCity.mutateAsync({ cityName })
    if (result.status === "City set successfully") {
      toast.success("City set successfully")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="w-[90vw] h-[90vh] max-w-[90vw] flex flex-col">
    <DialogHeader>
      <DialogTitle>Add City</DialogTitle>
    </DialogHeader>
    <div className="flex flex-1 overflow-hidden">
      <div className="w-full pt-4 overflow-y-auto">
        <ScrollArea className="h-full">
          <div className="space-y-4 p-4">
            <Input
              disabled={searchCity.isPending}
              placeholder="City Name"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
            />
            {searchResult && (
              <div className="flex flex-col gap-2">
                <h4 className="font-medium">Found City</h4>
                <div className="text-sm mb-1">
                  {searchResult.cityName}, {searchResult.state}
                </div>
                <Button
                  variant="default"
                  disabled={addCity.isPending}
                  onClick={async () => {
                    await handleAddCity();
                    setSearchResult(undefined);
                    onOpenChange(false);
                  }}
                >
                  Accept and continue
                </Button>
                <Button variant="secondary" onClick={() => setSearchResult(undefined)}>
                  Try another city
                </Button>
              </div>
            )}
            {!searchResult && (
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button className={"ml-3"} variant="default" onClick={handleSearchCity}>
                  Search City
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  </DialogContent>
</Dialog>
  )
}