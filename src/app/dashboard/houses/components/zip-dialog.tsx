import React, { useState } from "react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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

  const handleAddZipCode = async () => {
    try {
      const result = await addZipCode.mutateAsync({ zipCode });
      if (result.status === "Zip code added successfully") {
        toast.success("Zip code added successfully");
        onOpenChange(false);
        zipCodes.refetch(); // Refetch zip codes after adding
      }
    } catch (error) {
      // Handle errors, e.g., display an error message
      console.error("Error adding zip code:", error);
      toast.error("Failed to add zip code");
    }
  };

  const [selectedZipCode, setSelectedZipCode] = useState<string | undefined>(
    undefined
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[60vw] h-[90vh] max-w-[50vw] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Zip Codes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-full pt-4 overflow-y-auto">
            <ScrollArea className="h-full  max-w-sm mx-auto">
              <div className="space-y-4 p-4">
                <Input
                  placeholder="Zip Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    className={"ml-3"}
                    variant="default"
                    onClick={handleAddZipCode}
                  >
                    Add Zip Code
                  </Button>
                </div>
                {zipCodes.isPending && <div>Loading...</div>}
                {!zipCodes.isPending && zipCodes.isSuccess && zipCodes.data.length === 0 && (
                  <div>Use the input above to add your first zip code.</div>
                )}
                {!zipCodes.isPending && zipCodes.isSuccess && zipCodes.data.length > 0 && (
                  <div className="flex flex-wrap mx-2">
                    {zipCodes.data.map((zipCodeData) => (
                      <div className="w-full px-2 mb-4" key={zipCodeData.id}>
                        <ZipCodeCard // Updated component
                          zipCode={zipCodeData}
                          selected={selectedZipCode === zipCodeData.id}
                          onClick={() => setSelectedZipCode(zipCodeData.id)}
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
  selected: boolean;
  onClick: () => void;
}

const ZipCodeCard: React.FC<ZipCodeCardProps> = ({
  zipCode,
  selected,
  onClick,
}) => {
  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer hover:bg-gray-100 ${
        selected ? "bg-blue-100 border-blue-500" : "border-gray-300"
      }`}
      onClick={onClick}
    >
      <div className="font-medium">{zipCode.id}</div>
      <div className="text-sm text-gray-600">
        {zipCode.city}, {zipCode.state}
      </div>
    </div>
  );
};