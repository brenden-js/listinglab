"use client"
import {type JSX, type SVGProps, useContext, useEffect, useState} from "react"
import {
  Drawer, DrawerClose,
  DrawerContent,
  DrawerDescription, DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {api} from "@/trpc/react";
import {CheckCircledIcon, ReloadIcon} from "@radix-ui/react-icons";
import clsx from "clsx";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";

interface ExpertiseProps {
  houseId: string;
}

export function AddExpertiseDrawer(
  {houseId}:
    ExpertiseProps) {
  const {selectedHouses, updateExpertise} = useContext(CurrentPromptContext)
  const [newExpertise, setNewExpertise] = useState('')
  const [currentExpertise, setCurrentExpertise] = useState('');
  const expertiseMutation = api.house.updateExpertise.useMutation({
    onSuccess() {
      updateExpertise(newExpertise, houseId)
    }
  })

  useEffect(() => {
    const currentHouse = selectedHouses.find((house) => house?.id === houseId);
    const expertise = currentHouse?.expertise ?? '';
    setNewExpertise(expertise);
    setCurrentExpertise(expertise);
  }, [selectedHouses, houseId]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          className={clsx("relative block w-full rounded-lg border-2 border-gray-300 p-6 text-center duration-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
            !newExpertise && "border-dashed")
          }
        >
          {!newExpertise ? <PlusIcon /> : <CheckCircledIcon className={"mx-auto h-[24px] w-[24px]"} />}
          <span
            className="mt-2 block text-sm font-medium text-gray-900">{!newExpertise ? "Add local expertise" : "Edit local expertise"}</span>
        </button>
      </DrawerTrigger>
      <DrawerContent className={"h-[80vh]"}>
        <DrawerHeader className={"max-w-xl mx-auto"}>
          <DrawerTitle className="mx-auto">
            Add local expertise
          </DrawerTitle>
          <DrawerDescription>
            Neighborhood Personality/Vibe, Popular Neighborhood Amenities, Transportation Options,
            Notable Schools,
            Up-and-Coming Areas,
            Potential Detractors to Address

          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col justify-between w-[650px] mx-auto mb-4">
          <Textarea
            value={newExpertise}
            onChange={(e) => setNewExpertise(e.target.value)}
            className="rounded-md mb-2 px-4 py-2 shadow-sm focus:border-black min-h-64"
          />
          <Button
            onClick={() => {
              expertiseMutation.mutate({houseId, expertise: newExpertise});
            }}
            disabled={expertiseMutation.isPending|| newExpertise === currentExpertise}
          >
            {expertiseMutation.isPending && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Save expertise
          </Button>
        </div>
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


function PlusIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={"mx-auto text-gray-400"}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
