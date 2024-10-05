import React, {useEffect, useState} from "react";
import {api} from "@/trpc/react";
import {toast} from "sonner";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Card, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Loader} from "lucide-react";

export const AddZipCodeDialog = ({
                                   open,
                                   onOpenChange,
                                 }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [zipCode, setZipCode] = useState("");
  const addZipCode = api.house.setUserZipCode.useMutation(); // Updated mutation
  const zipCodes = api.house.getUserZipCodes.useQuery();
  const searchZipCode = api.house.searchZipCode.useMutation();

  const handleAddZipCode = async () => {
    if (searchZipCode.isSuccess && searchZipCode.data) {
      const {city, state, id} = searchZipCode.data;
      const result = await addZipCode.mutateAsync({zipCode: id, city, state});
      if (result.status === "Zip code added successfully") {
        toast.success("Zip code added successfully");
        setZipCode("");
        searchZipCode.reset();
        onOpenChange(false);
        zipCodes.refetch(); // Refetch zip codes after adding
      }
    }
  };

  useEffect(() => {
    if (addZipCode.isError) {
      toast.error(addZipCode.error.message);
    }
  }, [addZipCode.isError]);

  useEffect(() => {
    if (searchZipCode.isError) {
      toast.error(searchZipCode.error.message);
    }
  }, [searchZipCode.isError]);


  const handleSearchZipCode = async () => {
    await searchZipCode.mutateAsync({zipCode});
  }


  const apiLimits = api.user.getSubscription.useQuery();

  const handleResetSearch = () => {
    setZipCode("");
    searchZipCode.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] h-[90vh] max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Zip Codes</DialogTitle>
          <DialogDescription>
            {apiLimits.isLoading && <div>Loading...</div>}
            {!apiLimits.isLoading && apiLimits.data?.zipCodesLimit === null && (
              <div>You have no zip codes available, go to subscriptions to increase your limit.</div>
            )}
            {!apiLimits.isLoading && apiLimits.data?.zipCodesLimit !== null && apiLimits.data !== undefined && (
              <>
                <div>
                  {apiLimits.data.zipCodesUsage} / {apiLimits.data.zipCodesLimit} zip code
                  subscriptions used.
                </div>
                {apiLimits.data?.zipCodesLimit === 0 && (
                  <div>You have no zip codes available, go to subscriptions to increase your
                    limit.
                  </div>
                )}
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full pt-4 overflow-y-auto">
            <ScrollArea className="h-full max-w-sm mx-auto">
              <div className="space-y-4 p-4">
                {!searchZipCode.isPending && searchZipCode.isError && (
                  <div className={"w-full text-center text-gray-800 mx-auto"}>Check your input and try
                    again.</div>
                )}
                <Input
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  disabled={searchZipCode.isPending || searchZipCode.isSuccess}
                />
                <div className="flex justify-end">
                  {!searchZipCode.isPending && searchZipCode.isSuccess && (
                    <Button variant="secondary" onClick={handleResetSearch}>
                      Search A Different Zip Code
                    </Button>
                  )}
                  {searchZipCode.isPending || !searchZipCode.isSuccess && (
                    <Button
                      className={"ml-3"}
                      variant="default"
                      onClick={handleSearchZipCode}
                      disabled={searchZipCode.isPending}
                    >
                      Search Zip Code
                    </Button>
                  )}
                </div>
                {searchZipCode.isPending && <div>Loading...</div>}
                {searchZipCode.isSuccess && searchZipCode.data && (
                  <>
                    <div>Results:</div>
                    <div
                      className={`p-4 flex justify-between rounded-lg border border-gray-300`}
                    >
                      <div>
                        <div className="font-medium">{searchZipCode.data.id}</div>
                        <div className="text-sm text-gray-600">
                          {searchZipCode.data.city}, {searchZipCode.data.state}
                        </div>
                      </div>
                      <Button disabled={addZipCode.isPending} variant="default"
                              onClick={handleAddZipCode}>
                        Subscribe
                      </Button>
                    </div>
                  </>
                )}
                {zipCodes.isPending && <div>Loading...</div>}
                {!zipCodes.isPending && zipCodes.isSuccess && zipCodes.data.length === 0 && (
                  <div className={"text-gray-800 text-center"}>You are not subscribed to any zip codes.</div>
                )}
                {!zipCodes.isPending && zipCodes.isSuccess && zipCodes.data.length > 0 && (
                  <div className="flex flex-wrap mx-2">
                    {zipCodes.data.map((zipCodeData) => (
                      <div className="w-full px-2 mb-4" key={zipCodeData.id}>
                        <ZipCodeCard // Updated component
                          zipCode={zipCodeData}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


interface ZipCodeCardProps {
  zipCode: { id: string; city: string; state: string };
}

const ZipCodeCard: React.FC<ZipCodeCardProps> = ({zipCode,}) => {
  const utils = api.useUtils()

  const handleUnsubscribeZipCode = api.house.unsubscribeZipCode.useMutation({
    onSuccess: () => {
      toast.success("Zip code unsubscribed successfully");
      utils.house.getUserZipCodes.invalidate()
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>{zipCode.id}</CardTitle>
        <CardDescription className="text-sm text-gray-600">
          {zipCode.city}, {zipCode.state}
        </CardDescription>
        <CardFooter>
          <Button
            variant="default"
            disabled={handleUnsubscribeZipCode.isPending}
            onClick={() => handleUnsubscribeZipCode.mutate({zipCodeId: zipCode.id})}
          >
            {handleUnsubscribeZipCode.isPending ? "Unsubscribing..." : "Unsubscribe"}
            {handleUnsubscribeZipCode.isPending && (
              <Loader className="ml-2 h-4 w-4 animate-spin"/>
            )}
          </Button>
        </CardFooter>
      </CardHeader>

    </Card>
  );
};