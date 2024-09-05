import React from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {House} from "@/app/dashboard/contexts/prompts";

interface HousePreviewCardProps {
  house: House;
}
export const HousePreviewCard: React.FC<HousePreviewCardProps> = ({ house }) => {
  if (!house) return null;
  return (
    <Card className={"hover:cursor-pointer"}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{house.stAddress}</CardTitle>
          <Badge variant="secondary">{house.price?.toLocaleString("en-US", { style: "currency", currency: "USD" })}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/*<div className="relative h-48 w-full">*/}
        {/*  <Image*/}
        {/*    src={house.imageUrl}*/}
        {/*    alt={house.address}*/}
        {/*    fill*/}
        {/*    objectFit="cover"*/}
        {/*  />*/}
        {/*</div>*/}
        <div className="mt-2">
          <div className="text-sm text-gray-600">
            {house.city}, {house.state} {house.zipCode}
          </div>
          <div className="text-sm text-gray-600">
            {house.beds} beds | {house.baths} baths | {house.sqft} sqft
          </div>
        </div>
      </CardContent>
    </Card>
  );
};