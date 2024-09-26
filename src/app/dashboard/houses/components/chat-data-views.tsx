import React from 'react';
import {House} from "@/app/dashboard/contexts/prompts";
import {MortgagePaymentChart} from "@/app/dashboard/houses/components/chart-mortgage";
import {Place} from "@/inngest/functions/helpers/types";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';


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

type LocationViewProps = {
  nearbyPlaces: string; // JSON string
  lat: number;
  lon: number;
};

export const LocationView: React.FC<LocationViewProps> = ({nearbyPlaces, lat, lon}) => {
  const places: Place[] = React.useMemo(() => JSON.parse(nearbyPlaces), [nearbyPlaces]);

  return (
    <div style={{ height: '500px', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{ height: '100%', width: '100%' }}
          center={{ lat, lng: lon }}
          zoom={12}
        >
          {places.map((place) => (
            <Marker
              key={place.displayName.text}
              position={{ lat: place.location.latitude, lng: place.location.longitude }}
              title={place.displayName.text}
            />
          ))}
        </GoogleMap>
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