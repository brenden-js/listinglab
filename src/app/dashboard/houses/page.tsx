"use client"
import React, {useState, useEffect} from "react";
import {api} from "@/trpc/react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";

import {HouseDialogProvider} from "@/app/dashboard/contexts/house-dialog-context";
import {AddZipCodeDialog} from "@/app/dashboard/houses/components/zip-dialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {House} from "@/app/dashboard/contexts/prompts"; // Updated import
import {Badge} from "@/components/ui/badge";
import {HouseDialog} from "@/app/dashboard/houses/components/house-dialog";
import {HousePreviewCard} from "@/app/dashboard/houses/components/house-preview-card";
import {LoadingSkeletons} from "@/app/dashboard/houses/components/house-preview-skeletons";
import Link from "next/link";
import {HousesDrawer} from "@/app/dashboard/components/houses-drawer";
import {AddHouse} from "@/app/dashboard/houses/components/add-house";

export default function HousesPageOverview() {
    const currentZipCodes = api.house.getUserZipCodes.useQuery(); // Updated query

    useEffect(() => {
        if (currentZipCodes.isSuccess && currentZipCodes.data.length > 0) {
            // Select the first zip code by default
            setSelectedZipCode(currentZipCodes.data[0].id);
        }
    }, [currentZipCodes]);

    const houses = api.house.getHouses.useQuery();

    const [selectedZipCode, setSelectedZipCode] = useState<string | undefined>(
        undefined
    );

    const [openZipCodeDialog, setOpenZipCodeDialog] = useState(false);

    const [houseDialogOpen, setHouseDialogOpen] = useState(false);

    return (
        <HouseDialogProvider>
            <div className={"h-full flex flex-col"}>
                <div className={"ml-3 flex items-center flex-row h-16"}>
                    <h2 className="text-lg font-semibold">Houses</h2>
                    {/* Display current zip code */}
                    {currentZipCodes.isPending && (
                        <div className={"animate-pulse h-5 w-16 rounded-xl"}></div>
                    )}
                    {!currentZipCodes.isPending &&
                        currentZipCodes.isSuccess &&
                        currentZipCodes.data.length > 0 && (
                            <div className="ml-3 flex items-center gap-2">
                                <div className="text-lg font-semibold">
                                    {currentZipCodes.data[0].id},{" "}
                                    {currentZipCodes.data[0].state}
                                </div>
                            </div>
                        )}
                    <Button
                        variant="secondary"
                        className={"ml-3"}
                        onClick={() => setOpenZipCodeDialog(true)}
                    >
                        Manage Zip Codes
                    </Button>
                    <AddZipCodeDialog
                        open={openZipCodeDialog}
                        onOpenChange={setOpenZipCodeDialog}
                    />
                </div>
                <Separator/>
                <div className="p-3">
                    <AddHouse />
                    {houses.isPending && <LoadingSkeletons/>}
                    {!houses.isPending && houses.isSuccess && houses.data.length > 0 && (
                        <div className="flex flex-wrap -mx-2">
                            {houses.data.map((house) => (
                                <div
                                    className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4"
                                    key={house.id}
                                >
                                    <Link href={`/dashboard/houses/${house.id}`} passHref>
                                        <HousePreviewCard house={house} />
                                    </Link>
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
    );
}

