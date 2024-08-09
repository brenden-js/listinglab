import React from 'react';
import {House} from "@/app/dashboard/contexts/prompts";

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
type LoanInfo = {
    baseMonthlyPayment: string;
    upfrontMIP?: string;
    monthlyMIP?: string;
    monthlyTax: string;
    combinedMonthlyPayment: string;
    valueAndEquityRange: {
        valueRange5Years: { min: number; max: number };
        possibleEquity5Years: { min: number; max: number };
    };
};

type Investment = {
    fhaLoan: LoanInfo;
    nonFhaLoan: LoanInfo;
};

type FinancialViewProps = {
    investment: string; // JSON string
};

export const FinancialView: React.FC<FinancialViewProps> = ({investment}) => {
    const {fhaLoan, nonFhaLoan}: Investment = React.useMemo(() => JSON.parse(investment), [investment]);

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Financial Analysis</h3>
            <div className="mb-4">
                <h4 className="text-lg font-semibold">FHA Loan</h4>
                <p><strong>Monthly Payment:</strong> ${fhaLoan.baseMonthlyPayment}</p>
                <p><strong>Upfront MIP:</strong> ${fhaLoan.upfrontMIP}</p>
                <p><strong>Monthly MIP:</strong> ${fhaLoan.monthlyMIP}</p>
                <p><strong>Combined Monthly Payment:</strong> ${fhaLoan.combinedMonthlyPayment}</p>
            </div>
            <div className="mb-4">
                <h4 className="text-lg font-semibold">Conventional Loan</h4>
                <p><strong>Monthly Payment:</strong> ${nonFhaLoan.baseMonthlyPayment}</p>
                <p><strong>Combined Monthly Payment:</strong> ${nonFhaLoan.combinedMonthlyPayment}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold">5-Year Projections</h4>
                <p><strong>Value Range:</strong> ${fhaLoan.valueAndEquityRange.valueRange5Years.min.toLocaleString()} -
                    ${fhaLoan.valueAndEquityRange.valueRange5Years.max.toLocaleString()}</p>
                <p><strong>Possible
                    Equity:</strong> ${fhaLoan.valueAndEquityRange.possibleEquity5Years.min.toLocaleString()} -
                    ${fhaLoan.valueAndEquityRange.possibleEquity5Years.max.toLocaleString()}</p>
            </div>
        </div>
    );
};