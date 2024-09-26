import {and, eq} from "drizzle-orm";
import axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";
import process from "process";
import {v4 as uuidv4} from "uuid";
import {generations, houses, userApiLimits, zipCodeSubscriptions} from "@/db/schema";
import {db} from "@/db";
import {HouseDetailsResponse, RecentlySoldResponse} from "@/trpc/routers/helpers/types";
import {GoogleNearbyPlacesAPIResponse} from "@/inngest/functions/helpers/types";
import {inngest} from "@/inngest/client";
import {ListingSearchInCityResponse} from "@/inngest/functions/helpers/house-search-type";
import {calculateTotalMonthlyPayment} from "@/inngest/functions/helpers/investment-calcs";


export const incrementHouseUsage = inngest.createFunction(
  {id: "Handle incrementing a user's house usage."},
  {event: "house/enrich"},
  async ({event}) => {
    const userApiLimit = await db.query.userApiLimits.findFirst({where: eq(userApiLimits.userId, event.data.userId)})
    if (!userApiLimit) {
      throw new Error('No user Api Limit found')
    }
    await db.update(userApiLimits)
      .set({housesUsage: userApiLimit.housesUsage + 1})
      .where(eq(userApiLimits.userId, event.data.userId))
  }
)

export const handleEnrichHouse = inngest.createFunction(
  {id: "Handle enriching house"},
  {event: "house/enrich"},
  async ({event, step}) => {
    const foundListing = await step.run("Get house details", async () => {

      if (!event.data.lookupId) {
        // No lookup id, this means the house was found via the listing scan, and we have the basic listing data already
        const house = await db.query.houses.findFirst({where: eq(houses.id, event.data.houseId)})
        if (!house) {
          throw new Error('Could not find house in database')
        }
        return {
          lat: house.lat,
          lon: house.lon,
          price: house.price,
          stAddress: house.stAddress,
          zipCode: house.zipCode
        }
      }

      const options: AxiosRequestConfig = {
        method: 'GET',
        url: 'https://realty-in-us.p.rapidapi.com/properties/v3/detail',
        params: {property_id: event.data.lookupId},
        headers: {
          'X-RapidAPI-Key': process.env.HOUSE_DATA_API_KEY,
          'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com'
        }
      }

      const anotherResponse: AxiosResponse = await axios.request(options);
      const formatted = anotherResponse.data as HouseDetailsResponse

      console.log('Formatted.................', formatted)

      await db.insert(houses).values({
        id: event.data.houseId,
        createdAt: new Date(),
        baths: formatted.data.home.description.baths,
        beds: formatted.data.home.description.beds,
        city: formatted.data.home.location.address.city,
        description: formatted.data.home.description.text,
        details: JSON.stringify(formatted.data.home.details),
        garage: formatted.data.home.description.garage,
        lat: formatted.data.home.location.address.coordinate.lat,
        lon: formatted.data.home.location.address.coordinate.lon,
        lotSqft: formatted.data.home.description.lot_sqft,
        price: formatted.data.home.list_price,
        pricePerSqft: formatted.data.home.price_per_sqft,
        sqft: formatted.data.home.description.sqft,
        stAddress: formatted.data.home.location.address.line,
        status: formatted.data.home.status,
        state: formatted.data.home.location.address.state,
        stories: formatted.data.home.description.stories,
        styles: JSON.stringify(formatted.data.home.description.styles),
        userId: event.data.userId,
        yearBuilt: formatted.data.home.description.year_built,
        zipCode: formatted.data.home.location.address.postal_code
      })
      console.log("Succesfully added house.")

      return {
        lat: formatted.data.home.location.address.coordinate.lat,
        lon: formatted.data.home.location.address.coordinate.lon,
        price: 100,
        stAddress: formatted.data.home.location.address.line,
        zipCode: formatted.data.home.location.address.postal_code
      }
    })

    await step.run("Get google places data",
      async () => {
        const response = await axios(
          "https://places.googleapis.com/v1/places:searchNearby",
          {
            headers: {
              "X-Goog-FieldMask": "places.displayName,places.location,places.goodForChildren,places.liveMusic,places.goodForWatchingSports,places.editorialSummary,places.types",
              "X-Goog-Api-Key": process.env.GOOGLE_API_KEY!
            },
            method: "POST",
            data: {
              "includedTypes": [],
              "maxResultCount": 20,
              "locationRestriction": {
                "circle": {
                  "center": {
                    "latitude": foundListing.lat,
                    "longitude": foundListing.lon
                  },
                  "radius": 4000.0
                }
              }
            }
          }
        )

        const places = response.data as GoogleNearbyPlacesAPIResponse
        await db.update(houses)
          .set({nearbyPlaces: JSON.stringify(places.places)})
          .where(eq(houses.id, event.data.houseId))
      })

    await step.run("Get mortgage and investment info", async () => {
      if (foundListing.price === null) {
        console.log('No price was found, cannot get mortgage info')
        throw new Error('No price was found, cannot get mortgage info')
      }

      const conventionalLoan = calculateTotalMonthlyPayment('conventional', foundListing.price, 5.49)
      // need to add the upfrontMIP in future
      const fhaLoan = calculateTotalMonthlyPayment('fha', foundListing.price, 5.49)

      await db.update(houses).set({investment: JSON.stringify({conventionalLoan, fhaLoan})})
        .where(eq(houses.id, event.data.houseId))
    })

    // await step.run("Get recently sold listings", async () => {
    //     const data = JSON.stringify({
    //         limit: 10,
    //         offset: 0,
    //         postal_code: foundListing.zipCode,
    //         status: [
    //             'sold'
    //         ],
    //         sort: {
    //             direction: 'desc',
    //             field: 'list_date'
    //         }
    //     });
    //
    //     let response;
    //
    //     try {
    //         response = await axios.post('https://realty-in-us.p.rapidapi.com/properties/v3/list', data, {
    //             headers: {
    //                 'x-rapidapi-key': process.env.HOUSE_DATA_API_KEY,
    //                 'x-rapidapi-host': 'realty-in-us.p.rapidapi.com',
    //                 'Content-Type': 'application/json'
    //             },
    //             withCredentials: true
    //         });
    //
    //         if (!response) {
    //             return new Error('Could not get api response')
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    //     const formatted = response!.data as RecentlySoldResponse
    //
    //     const minimizedArray = formatted.data.home_search.results.map((soldListing) => {
    //         return {
    //             soldPrice: soldListing.last_sold_price,
    //             soldDate: soldListing.last_sold_date,
    //             beds: soldListing.description.beds,
    //             baths: soldListing.description.baths,
    //             lotSqft: soldListing.description.lot_sqft,
    //             sqft: soldListing.description.sqft,
    //             pricePerSqft: (soldListing.last_sold_price / soldListing.description.sqft).toFixed(2),
    //             stAddress: soldListing.location.address.line
    //         }
    //     })
    //
    //     console.log("minimzedArray...................", minimizedArray)
    //
    //     await db.update(houses).set({recentlySold: JSON.stringify(minimizedArray)}).where(eq(houses.id,
    // event.data.houseId)) })
  }
)

export const incrementTextUsage = inngest.createFunction(
  {id: "increment-text-usage"},
  {event: "house/add-generation"},
  async ({event}) => {
    const userApiLimit = await db.query.userApiLimits.findFirst({where: eq(userApiLimits.userId, event.data.userId)})
    if (!userApiLimit) {
      throw new Error('No user Api Limit found')
    }
    await db.update(userApiLimits)
      .set({textUsage: userApiLimit.textUsage + 1})
      .where(eq(userApiLimits.userId, event.data.userId))
  }
)

export const handleAddGeneration = inngest.createFunction(
  {id: 'add-generation'},
  {event: 'house/add-generation'},
  async ({event}) => {
    await db.insert(generations).values({
      id: uuidv4(),
      createdAt: new Date(),
      houseId: event.data.houseId,
      prompt: event.data.prompt,
      text: event.data.text,
      model: event.data.model,
    });
  }
)

export const scheduledNewListingsScan = inngest.createFunction(
  {id: 'handle-scheduled-new-listings-scan'},
  {cron: '1/30 4-23 * * *'},
  async () => {
    console.log('Running scheduled new listings scan...')
    const zipCodes = await db.query.zipCodes.findMany()
    if (!zipCodes.length) {
      console.log('No zipCodes found, exiting...')
      return
    }
    for (const zipCode of zipCodes) {
      // create an event for each zipCode
      const event = {
        cityId: zipCode.id,
        cityName: zipCode.city,
        state: zipCode.state
      }
      await inngest.send({name: 'house/scan-city', data: event})
    }
  }
)

export const newListingsInCityScan = inngest.createFunction(
  {id: 'handle-new-listings-in-city-scan', concurrency: 1},
  {event: 'house/scan-city'},
  async ({event}) => {
    const options = {
      method: 'GET',
      url: 'https://zillow-com4.p.rapidapi.com/properties/search',
      params: {
        location: `${event.data.cityName}, ${event.data.state}`,
        limit: 5,
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

    // if (process.env.NODE_ENV === 'development') {
    //     console.log('Shortening response in development...')
    //     const shortened = formatted.data[0]
    //     formatted.data = [shortened]
    // }

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
        console.log('Could not find house in database, sending event...')

        const addHouseEvent = {
          cityId: event.data.cityId,
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
        await inngest.send({name: 'house/add-house-to-users', data: addHouseEvent})
      } else {
        console.log('House already exists in database, stopping the loop...')
        break;
      }
    }
  }
)

export const handleAddHouseToUsers = inngest.createFunction(
  {id: 'handle-add-house-to-users', concurrency: 10},
  {event: 'house/add-house-to-users'},
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
        pricePerSqft: null,
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

      // const message = {
      //     houseId: event.data.houseId,
      //     stAddress: event.data.stAddress,
      //     updateType: 'ListingScanUpdate',
      // } as ListingScanUpdate
      //
      // await publishStatusFromServer(message, user.userId)
    }
  }
)