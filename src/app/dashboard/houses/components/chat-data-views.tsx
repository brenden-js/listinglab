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
    baseMonthlyPayment: string;
    upfrontMIP?: string;
    monthlyMIP?: string;
    monthlyTax: string;
    combinedMonthlyPayment: string;
    valueAndEquityRange: {
        ownershipYear: number;
        valueRange: { estimatedMin: string; estimatedMax: string };
        equityRange: { estimatedMinEquity: string; estimatedMaxEquity: string };
    }[];
    appreciationRateRange: {
        min: number;
        max: number;
    };
};

export type Investment = {
    fhaLoan: LoanInfo;
    nonFhaLoan: LoanInfo;
};

type FinancialViewProps = {
    investment: Investment; // Correct prop type
};

export const FinancialView: React.FC<FinancialViewProps> = ({investment}) => {
    const {fhaLoan, nonFhaLoan} = investment;

    const getProjectionForYear = (loanType: 'fhaLoan' | 'nonFhaLoan', year: number) => {
        const projection = investment[loanType].valueAndEquityRange.find(
            (item) => item.ownershipYear === year
        );
        return projection || null;
    };

    const fhaProjection5Years = getProjectionForYear('fhaLoan', 5);
    const nonFhaProjection5Years = getProjectionForYear('nonFhaLoan', 5);

    return (
        <div>
            <EquityLineChart investment={investment}/>
            <div className="mb-4 w-1/2">
                <MortgagePaymentChart loan={fhaLoan}/>
            </div>
            <div className="mb-4 w-1/2">
                <MortgagePaymentChart loan={nonFhaLoan}/>
            </div>
            <h3 className="text-xl font-bold mb-4">Financial Analysis</h3>
            <div className="mb-4">
                <h4 className="text-lg font-semibold">FHA Loan</h4>
                <p><strong>Monthly Payment:</strong> ${parseFloat(fhaLoan.baseMonthlyPayment).toLocaleString()}</p>
                {fhaLoan.upfrontMIP &&
                    <p><strong>Upfront MIP:</strong> ${parseFloat(fhaLoan.upfrontMIP).toLocaleString()}</p>}
                {fhaLoan.monthlyMIP &&
                    <p><strong>Monthly MIP:</strong> ${parseFloat(fhaLoan.monthlyMIP).toLocaleString()}</p>}
                <p><strong>Combined Monthly
                    Payment:</strong> ${parseFloat(fhaLoan.combinedMonthlyPayment).toLocaleString()}</p>
            </div>
            <div className="mb-4">
                <h4 className="text-lg font-semibold">Conventional Loan</h4>
                <p><strong>Monthly Payment:</strong> ${parseFloat(nonFhaLoan.baseMonthlyPayment).toLocaleString()}</p>
                <p><strong>Combined Monthly
                    Payment:</strong> ${parseFloat(nonFhaLoan.combinedMonthlyPayment).toLocaleString()}</p>
            </div>
            <div>
                <h4 className="text-lg font-semibold">5-Year Projections</h4>
                {fhaProjection5Years && (
                    <>
                        <p>
                            <strong>FHA Value Range:</strong> $
                            {parseFloat(fhaProjection5Years.valueRange.estimatedMin).toLocaleString()} - $
                            {parseFloat(fhaProjection5Years.valueRange.estimatedMax).toLocaleString()}
                        </p>
                        <p>
                            <strong>FHA Possible Equity:</strong> $
                            {parseFloat(fhaProjection5Years.equityRange.estimatedMinEquity).toLocaleString()} - $
                            {parseFloat(fhaProjection5Years.equityRange.estimatedMaxEquity).toLocaleString()}
                        </p>
                    </>
                )}
                {nonFhaProjection5Years && (
                    <>
                        <p>
                            <strong>Conv. Value Range:</strong> $
                            {parseFloat(nonFhaProjection5Years.valueRange.estimatedMin).toLocaleString()} - $
                            {parseFloat(nonFhaProjection5Years.valueRange.estimatedMax).toLocaleString()}
                        </p>
                        <p>
                            <strong>Conv. Possible Equity:</strong> $
                            {parseFloat(nonFhaProjection5Years.equityRange.estimatedMinEquity).toLocaleString()} - $
                            {parseFloat(nonFhaProjection5Years.equityRange.estimatedMaxEquity).toLocaleString()}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};