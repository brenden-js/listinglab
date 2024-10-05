import {db} from "@/db";
import {eq} from "drizzle-orm";
import {houses, userApiLimits, zipCodes, zipCodeSubscriptions} from "@/db/schema";
import {inngest} from "@/inngest/client";
import process from "process";
import axios from "axios";
import {ListingSearchInCityResponse} from "@/inngest/functions/helpers/house-search-type";

export const handleNewZipCodeSubscription = inngest.createFunction(
  {id: 'handle-new-zipcode-subscription'},
  {event: 'zipcode/subscribe'},
  async ({event}) => {
    const user = await db.query.userApiLimits.findFirst({where: eq(userApiLimits.userId, event.data.userId)})
    if (!user) {
      throw new Error('No user found')
    }

    await db.insert(zipCodeSubscriptions).values({
      userId: user.userId,
      zipCodeId: event.data.zipCodeId,
    })

    await db.update(userApiLimits)
      .set({zipCodesUsage: user.zipCodesUsage + 1})
      .where(eq(userApiLimits.userId, event.data.userId))

    await inngest.send({name: 'zipcode/initial-scan', data: {zipCodeId: event.data.zipCodeId, userId: user.userId}})
  }
)

export const handleInitialZipCodeScan = inngest.createFunction(
  {id: 'handle-initial-zipcode-scan'},
  {event: 'zipcode/initial-scan'},
  async ({event}) => {

    const options = {
      method: 'GET',
      url: 'https://zillow-com4.p.rapidapi.com/properties/search',
      params: {
        location: `${event.data.zipCodeId}`,
        limit: 25,
        status: 'forSale',
        sort: 'daysOn',
        sortType: 'asc',
        priceType: 'listPrice',
        listingType: 'agent'
      },
      headers: {
        'x-rapidapi-key': process.env.HOUSE_DATA_API_KEY,
        'x-rapidapi-host': 'zillow-com4.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);

    if (!response) {
      return new Error('Could not get api response')
    }

    // need a new type for recently listed houses search

    let formatted = response.data as ListingSearchInCityResponse

    const housesToAdd = []

    for (const listing of formatted.data) {
      housesToAdd.push({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        baths: listing.bathrooms,
        beds: listing.bedrooms,
        city: listing.address.city,
        description: null,
        details: null,
        garage: null,
        lat: listing.location.latitude,
        lotSqft: listing.lotSizeWithUnit?.lotSize,
        lon: listing.location.longitude,
        price: listing.price.value,
        pricePerSqft: parseFloat((listing.price.value / listing.livingArea).toFixed(2)),
        sqft: listing.livingArea,
        stAddress: listing.address.streetAddress,
        status: null,
        state: listing.address.state,
        stories: null,
        styles: null,
        userId: event.data.userId,
        yearBuilt: listing.yearBuilt,
        zipCode: listing.address.zipcode,
      })
    }

    await db.insert(houses).values(housesToAdd)
  }
)
