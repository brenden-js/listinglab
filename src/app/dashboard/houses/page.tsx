"use client"
import React, {useState, useEffect} from "react";
import {api} from "@/trpc/react";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";

import {HouseDialogProvider} from "@/app/dashboard/contexts/house-dialog-context";
import {AddZipCodeDialog} from "@/app/dashboard/houses/components/zip-dialog";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {House} from "@/app/dashboard/contexts/prompts";
import {Badge} from "@/components/ui/badge";
import {HouseDialog} from "@/app/dashboard/houses/components/house-dialog";
import {HousePreviewCard} from "@/app/dashboard/houses/components/house-preview-card";
import {LoadingSkeletons} from "@/app/dashboard/houses/components/house-preview-skeletons";
import Link from "next/link";
import {HousesDrawer} from "@/app/dashboard/components/houses-drawer";
import {AddHouse} from "@/app/dashboard/houses/components/add-house";

export default function HousesPageOverview() {
    const currentZipCodes = api.house.getUserZipCodes.useQuery();

    useEffect(() => {
        if (currentZipCodes.isSuccess && currentZipCodes.data.length > 0) {
            setSelectedZipCode(currentZipCodes.data[0].id);
        }
    }, [currentZipCodes]);

    const { data: housesData, isLoading: housesLoading } = api.house.getHouses.useQuery();
    const [selectedZipCode, setSelectedZipCode] = useState<string | undefined>(
        undefined
    );
    const [openZipCodeDialog, setOpenZipCodeDialog] = useState(false);
    const [activeFilter, setActiveFilter] = useState<"all" | "today" | "new">("all");

    const getFilteredHouses = () => {
        if (!housesData) return [];

        switch (activeFilter) {
            case "today":
                return housesData.filter(
                    (house) =>
                        house.createdAt &&
                        new Date(house.createdAt).toDateString() ===
                        new Date().toDateString()
                );
            case "new":
                return housesData.filter((house) => house.seen === 0 || !house.seen);
            default:
                return housesData;
        }
    };

    const filteredHouses = getFilteredHouses();

    return (
        <HouseDialogProvider>
            <div className={"h-full flex flex-col"}>
                <div className={"ml-3 flex items-center flex-row h-16"}>
                    <h2 className="text-lg font-semibold">Houses</h2>
                    <Button
                        variant="secondary"
                        className={"ml-3"}
                        onClick={() => setOpenZipCodeDialog(true)}
                    >
                        Zip Codes
                    </Button>
                    <AddZipCodeDialog
                        open={openZipCodeDialog}
                        onOpenChange={setOpenZipCodeDialog}
                    />
                </div>
                <Separator/>
                <div className="p-3">
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={activeFilter === "all" ? "default" : "outline"}
                            onClick={() => setActiveFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={activeFilter === "today" ? "default" : "outline"}
                            onClick={() => setActiveFilter("today")}
                        >
                            Today
                        </Button>
                        <Button
                            variant={activeFilter === "new" ? "default" : "outline"}
                            onClick={() => setActiveFilter("new")}
                        >
                            New
                        </Button>
                    </div>

                    {housesLoading && <LoadingSkeletons/>}
                    {!housesLoading && filteredHouses.length > 0 && (
                        <div className="flex flex-wrap">
                            <div className={"px-2 w-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 mb-4"}>
                                <AddHouse />
                            </div>
                            {filteredHouses.map((house) => (
                                <div
                                    className="w-full lg:w-1/2 xl:w-1/3 2xl:w-1/4 px-2 mb-4"
                                    key={house.id}
                                >
                                    <Link href={`/dashboard/houses/${house.id}`} passHref>
                                        <HousePreviewCard house={house} />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                    {!housesLoading && filteredHouses.length === 0 && (
                        <div>No houses found.</div>
                    )}
                </div>
            </div>
        </HouseDialogProvider>
    );
}