import {db} from "@/db";
import {and, eq} from "drizzle-orm";
import {houses, userApiLimits, zipCodes, zipCodeSubscriptions} from "@/db/schema";
import {inngest} from "@/inngest/client";
import process from "process";
import axios from "axios";
import {ListingSearchInCityResponse} from "@/inngest/functions/helpers/house-search-type";
import {v4 as uuidv4} from "uuid";

export const newZipCodeSubscribe = inngest.createFunction(
  {id: 'zipcode-subscribe'},
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

    await inngest.send({name: 'zipcode/new-subscription-scan', data: {zipCodeId: event.data.zipCodeId, userId: user.userId}})
  }
)

export const newSubscriptionZipCodeScan = inngest.createFunction(
  {id: 'zipcode-new-subscription-scan'},
  {event: 'zipcode/new-subscription-scan'},
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


export const scheduledZipCodeScan = inngest.createFunction(
  { id: 'zipcode-get-all-zipcodes' },
  { cron: '0 19 * * *' },
  async () => {
    const zipCodes = await db.query.zipCodes.findMany()
    if (!zipCodes.length) {
      console.log('No zipCodes found, exiting...')
      return
    }
    for (const zipCode of zipCodes) {
      // create an event for each zipCode
      const event = {
        zipId: zipCode.id,
        cityName: zipCode.city,
        state: zipCode.state
      }
      await inngest.send({ name: 'zipcode/scheduled-new-listings-scan', data: event })
    }
  }
)


export const scheduledFindNewListings = inngest.createFunction(
  {id: 'zipcode-scheduled-new-listings-scan', concurrency: 1},
  {event: 'zipcode/scheduled-new-listings-scan'},
  async ({event}) => {
    const options = {
      method: 'GET',
      url: 'https://zillow-com4.p.rapidapi.com/properties/search',
      params: {
        location: `${event.data.zipId}, ${event.data.state}`,
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

    let formatted = response.data as ListingSearchInCityResponse

    for (const listing of formatted.data) {
      const foundListing = await db.query.houses.findFirst(
        {
          where: (houses, {eq, and}) => and(
            eq(houses.stAddress, listing.address.streetAddress),
            eq(houses.zipCode, listing.address.zipcode)
          )
        }
      )
      if (!foundListing) {
        console.log('Could not find house in database, sending add new listingevent...')

        const addHouseEvent = {
          zipId: event.data.zipId,
          cityName: event.data.cityName,
          houseId: uuidv4(),
          foundAt: new Date(),
          baths: listing.bathrooms,
          beds: listing.bedrooms,
          city: listing.address.city,
          lat: listing.location.latitude,
          lon: listing.location.longitude,
          lotSqft: listing.lotSizeWithUnit?.lotSize,
          price: listing.price.value,
          sqft: listing.livingArea,
          stAddress: listing.address.streetAddress,
          state: listing.address.state,
          yearBuilt: listing.yearBuilt,
          zipCode: listing.address.zipcode,
        }
        await inngest.send({name: 'zipcode/add-listing-to-subscribers', data: addHouseEvent})
      } else {
        console.log('House already exists in database, stopping the loop...')
        break;
      }
    }
  }
)



export const scheduledAddListingToSubscribers = inngest.createFunction(
  {id: 'zipcode-add-listing-to-subscribers', concurrency: 10},
  {event: 'zipcode/add-listing-to-subscribers'},
  async ({event}) => {

    // search for all recards in usersToCities using the composite index on cityName and state
    const usersSubscribedToCity = await db.query.zipCodeSubscriptions.findMany({
      where: and(
        eq(zipCodeSubscriptions.zipCodeId, event.data.zipCode)
      )
    })

    if (!usersSubscribedToCity.length) {
      console.log('No users subscribed to this city, exiting...')
      // throw an error because there are no users subscribed to this city
      return
    }

    console.log('usersSubscribedToCity...', usersSubscribedToCity)

    for (const user of usersSubscribedToCity) {
      const house = {
        id: event.data.houseId,
        createdAt: new Date(),
        baths: event.data.baths,
        beds: event.data.beds,
        city: event.data.city,
        description: null,
        details: null,
        garage: null,
        lat: event.data.lat,
        lotSqft: event.data.lotSqft,
        lon: event.data.lon,
        price: event.data.price,
        pricePerSqft: parseFloat((event.data.price / event.data.sqft).toFixed(2)),
        sqft: event.data.sqft,
        stAddress: event.data.stAddress,
        status: null,
        state: event.data.state,
        stories: null,
        styles: null,
        userId: user.userId,
        yearBuilt: event.data.yearBuilt,
        zipCode: event.data.zipCode,
      }
      await db.insert(houses).values(house)
    }
  }
)
