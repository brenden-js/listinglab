"use client"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {api} from "@/trpc/react";
import {useContext,  useState} from "react";
import {Input} from "@/components/ui/input";
import { ReloadIcon} from "@radix-ui/react-icons";
import clsx from "clsx";
import {CurrentPromptContext, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
import {toast} from "sonner";

export const AddHouse = () => {
  const {selectedHouses, addHouse, removeHouse} = useContext(CurrentPromptContext)
  const recentHouses = api.house.getHouses.useQuery(undefined, {})
  const houseMutation = api.house.searchHouse.useMutation({
    onSuccess: (data) => {
      addHouse(data)
      setRawAddress("")
      setNewHousePreview(data)
      toast.success('Found house, getting additional data!')
    },
    onError: ({message}) => {
      console.log('Error', message)
      toast.error('Unable to find this house, try again later.')
    }
  })
  const [rawAddress, setRawAddress] = useState("")
  const getHouseData = async () => {
    await houseMutation.mutateAsync({stAddress: rawAddress});
  };


  const [newHousePreview, setNewHousePreview] = useState<UnhydratedHouse>()
  return (
    <Drawer onClose={() => setNewHousePreview(undefined)}>
      <DrawerTrigger
        className=""
        asChild
      >
        <button
          type="button"
            className="sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4 relative duration-100 block w-full rounded-lg border-2 border-dashed border-gray-300 p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
            />
          </svg>
          <span className="mt-2 block text-sm font-medium text-gray-900">My houses</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className={"h-[80vh]"}>
        <DrawerHeader className={"max-w-xl mx-auto"}>
          <DrawerTitle className="text-center">Select a house</DrawerTitle>
          <DrawerDescription>Use the search bar to find a house or select a previously used house.</DrawerDescription>
        </DrawerHeader>
        <div className="flex justify-between w-[650px] mx-auto mb-4">
          <Input
            value={rawAddress}
            onChange={(e) => setRawAddress(e.target.value)}
            disabled={houseMutation.isPending || selectedHouses.length >= 1}
            className="w-[70%] rounded-md px-4 py-2 shadow-sm focus:border-black"
            placeholder={"12345 Main Street, Los Angeles CA 90210"}
          />
          <Button
            onClick={() => {
              void getHouseData()
            }}
            className={"w-[150px]"}
            disabled={houseMutation.isPending || selectedHouses.length >= 1 || rawAddress.length < 6}
          >
            {houseMutation.isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Get listing
          </Button>
        </div>
        {houseMutation.error && (
          <p className="mx-auto mb-4 text-red-600">
            {houseMutation.error.message}
          </p>
        )}
        {/* We check to see if the house has been removed after initial search and find of the house */}
        {newHousePreview && !!selectedHouses.length && (
          <div id="new-house-preview" className="mb-4 mt-2 items-center mx-auto flex-col w-[650px] rounded-md pr-4">
            <Card className={"min-w-[400px]"}>
              <CardHeader>
                <CardContent className="pt-5 flex items-center justify-between">
                  {newHousePreview.stAddress}, {newHousePreview.city} {newHousePreview.zipCode} found!
                  <DrawerClose asChild><Button variant={'secondary'}>Close and continue</Button></DrawerClose>
                </CardContent>
              </CardHeader>
            </Card>
          </div>
        )}
        <DrawerFooter className={"max-w-xl mx-auto"}>
          <DrawerClose
            asChild>
            <Button variant={"secondary"}>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}