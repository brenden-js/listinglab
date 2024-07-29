"use client"
import {useContext} from "react";
import {CurrentPromptContext} from "@/app/dashboard/contexts/prompts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

export default function DatasetSelection() {
    const {dataset, setDataset} = useContext(CurrentPromptContext)
    return (
        <div className="flex w-full gap-2 mt-4">
            <Tabs defaultValue="interior" className="w-[700px]">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="interior" onClick={() => setDataset('interior')}>House Data</TabsTrigger>
                    <TabsTrigger value="exterior" onClick={() => setDataset('exterior')}>Neighborhood Data</TabsTrigger>
                    <TabsTrigger value="investment" onClick={() => setDataset('investment')}>Mortgage & Investment Data</TabsTrigger>
                </TabsList>
                <TabsContent value="interior">
                    <Card>
                        <CardHeader>
                            <CardTitle>House and listing details</CardTitle>
                            <CardDescription>
                                Create content using listing data and house data. Includes
                                details about the house like square footage, property features, and more.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="exterior">
                    <Card>
                        <CardHeader>
                            <CardTitle>Neighborhood and business data</CardTitle>
                            <CardDescription>
                                Create content using places nearby the house. Searches for the nearest 20 places.
                                Includes restaurants, grocery stores, parks, and other
                                notable places.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
                <TabsContent value="investment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mortgage and investment data</CardTitle>
                            <CardDescription>
                                Create content that analyzes the numbers on the house. Includes recently sold listings,
                                estimated FHA and traditional mortgage estimates, down payment, and more.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}