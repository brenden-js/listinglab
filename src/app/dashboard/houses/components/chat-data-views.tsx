import React from 'react';
import {House} from "@/app/dashboard/contexts/prompts";
import {EquityLineChart} from "@/app/dashboard/houses/components/equity-chart";
import {MortgagePaymentChart} from "@/app/dashboard/houses/components/chart-mortgage";

// Utility types
type Maybe<T> = T | null | undefined;


// Property component
type PropertyViewProps = {
    house: House;
};

export const PropertyView: React.FC<PropertyViewProps> = ({house}) => {
        if (house) {
            return (
                <div>
                    <h3 className="text-xl font-bold mb-4">Property Details</h3>
                    <p><strong>Square Footage:</strong> {house.sqft} sq ft</p>
                    <p><strong>Lot Size:</strong> {house.lotSqft ? `${house.lotSqft} sq ft` : 'N/A'}</p>
                    <p><strong>Year Built:</strong> {house.yearBuilt || 'N/A'}</p>
                    <p><strong>Bedrooms:</strong> {house.beds || 'N/A'}</p>
                    <p><strong>Bathrooms:</strong> {house.baths || 'N/A'}</p>
                    <p><strong>Garage:</strong> {house.garage ? `${house.garage} car` : 'N/A'}</p>
                    <p><strong>Stories:</strong> {house.stories || 'N/A'}</p>
                    <p><strong>Style:</strong> {house.styles || 'N/A'}</p>
                    <p><strong>Price:</strong> ${house.price ? house.price.toLocaleString() : 'N/A'}</p>
                    <p><strong>Price per sq ft:</strong> ${house.pricePerSqft ? house.pricePerSqft.toFixed(2) : 'N/A'}</p>
                </div>
            )
        }
    }
;

// Location component
type NearbyPlace = {
    displayName: {
        text: string;
        languageCode: string;
    };
    types: string[];
    editorialSummary?: {
        text: string;
        languageCode: string;
    };
    goodForChildren?: boolean;
    liveMusic?: boolean;
};

type LocationViewProps = {
    nearbyPlaces: string; // JSON string
};

export const LocationView: React.FC<LocationViewProps> = ({nearbyPlaces}) => {
    const places: NearbyPlace[] = React.useMemo(() => JSON.parse(nearbyPlaces), [nearbyPlaces]);

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Neighborhood Information</h3>
            {places.map((place, index) => (
                <div key={index} className="mb-4">
                    <p><strong>{place.displayName.text}</strong></p>
                    <p>Type: {place.types.join(', ')}</p>
                    {place.editorialSummary && <p>{place.editorialSummary.text}</p>}
                    {place.goodForChildren !== undefined && (
                        <p>Good for children: {place.goodForChildren ? 'Yes' : 'No'}</p>
                    )}
                    {place.liveMusic !== undefined && (
                        <p>Live music: {place.liveMusic ? 'Yes' : 'No'}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

// Financial component
export type LoanInfo = {
    total: string;
    closingCosts: string
    mip: string;
    tax: string;
    principalAndInterest: string;
};

export type Investment = {
    fhaLoan: LoanInfo;
    conventionalLoan: LoanInfo;
};

type FinancialViewProps = {
    investment: Investment; // Correct prop type
};

export const FinancialView: React.FC<FinancialViewProps> = ({investment}) => {
    const {fhaLoan, conventionalLoan} = investment;

    return (
        <div className="flex flex-row gap-4">
            <div className="mb-4 w-1/2">
                <MortgagePaymentChart loan={fhaLoan} loanType="FHA"/>
            </div>
            <div className="mb-4 w-1/2">
                <MortgagePaymentChart loan={conventionalLoan} loanType="Conventional"/>
            </div>
        </div>
    );
};