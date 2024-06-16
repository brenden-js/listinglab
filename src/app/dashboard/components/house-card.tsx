"use client"
import {useContext, useState} from "react";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AddExpertiseDrawer} from "@/app/dashboard/components/expertise-drawer";
import {RecentGenerations} from "@/app/dashboard/components/recent-generations";
import {CurrentPromptContext, House, UnhydratedHouse} from "@/app/dashboard/contexts/prompts";
// import {LiveDataFeed} from "@/app/dashboard/components/live-data-feed";


export const HouseCard = ({house}: { house: House | UnhydratedHouse }) => {
  const {removeHouse} = useContext(CurrentPromptContext)

  if (!house) {
    return <></>
  }

  return (
    <div key={house.id} className="flex flex-col">
      <div className={"w-full"}>
        <Card className="w-[400px]">
          <CardContent className="flex flex-col">
            <div className="flex justify-between my-6">
              <div>
                <CardTitle>{house.stAddress}</CardTitle>
                <CardDescription>{house.city} {house.zipCode}</CardDescription>
              </div>
              <Button
                variant="secondary"
                onClick={() => removeHouse(house)}
              >
                Remove house
              </Button>
            </div>
            <div>
              {/*<LiveDataFeed house={house}/>*/}
            </div>
          </CardContent>
        </Card>
        <div className="my-4">
          <AddExpertiseDrawer
            houseId={house.id}
          />
        </div>
        <RecentGenerations houseId={house.id} />
      </div>
    </div>
  )
}