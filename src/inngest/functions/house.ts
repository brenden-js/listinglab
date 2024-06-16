import {eq} from "drizzle-orm";
import axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";
import process from "process";
import {v4 as uuidv4} from "uuid";
import {inngest} from "@/inngest/client";
import {generations, houses, userApiLimits} from "@/app/api/trpc/db/schema";
import {db} from "@/app/api/trpc/db";
import {HouseDetailsResponse, RecentlySoldResponse} from "@/trpc/routers/types";
import {GoogleNearbyPlacesAPIResponse} from "@/inngest/types";
import {getMortgageAndEquity} from "@/inngest/functions/helpers/equity-principal-equations";
import {publishStatusFromServer} from "@/inngest/functions/helpers/mqtt";
import {HouseUpdateContextValue} from "@/app/dashboard/contexts/house-updates-context";


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
                id: event.data.createdId,
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
            const message: HouseUpdateContextValue['updates'][0] = {
                houseId: event.data.createdId,
                messageCategory: 'house-update',
                updateType: 'complete',
                updateCategory: 'basic'
            }
            await publishStatusFromServer(message)

            return {
                lat: formatted.data.home.location.address.coordinate.lat,
                lon: formatted.data.home.location.address.coordinate.lon,
                price: 100,
                stAddress: formatted.data.home.location.address.line
            }
        })

        await step.run("Get google places data",
            async () => {
                const response = await axios(
                    "https://places.googleapis.com/v1/places:searchNearby",
                    {
                        headers: {
                            "X-Goog-FieldMask": "places.displayName,places.goodForChildren,places.liveMusic,places.goodForWatchingSports,places.editorialSummary,places.types",
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
                    .where(eq(houses.id, event.data.createdId))

                const message: HouseUpdateContextValue['updates'][0] = {
                    houseId: event.data.createdId,
                    messageCategory: 'house-update',
                    updateType: 'complete',
                    updateCategory: 'neighborhood'
                }
                await publishStatusFromServer(message)
            })

        await step.run("Get mortgage and investment info", async () => {
            if (!foundListing.price) {
                console.log('No price was found, cannot get mortgage info')
            }

            const data = getMortgageAndEquity(foundListing.price)

            await db.update(houses).set({investment: JSON.stringify(data)})
            const message: HouseUpdateContextValue['updates'][0] = {
                houseId: event.data.createdId,
                messageCategory: 'house-update',
                updateType: 'complete',
                updateCategory: 'investment'
            }
            await publishStatusFromServer(message)
        })

        await step.run("Get recently sold listings", async () => {
            const data = JSON.stringify({
                limit: 10,
                offset: 0,
                postal_code: '90004',
                status: [
                    'sold'
                ],
                sort: {
                    direction: 'desc',
                    field: 'list_date'
                }
            });

            let response;

            try {
                response = await axios.post('https://realty-in-us.p.rapidapi.com/properties/v3/list', data, {
                    headers: {
                        'x-rapidapi-key': process.env.HOUSE_DATA_API_KEY,
                        'x-rapidapi-host': 'realty-in-us.p.rapidapi.com',
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                });

                console.log('response...........',response.data);

                if (!response) {
                    return new Error('Could not get api response')
                }
            } catch (error) {
                console.error(error);
            }
            const formatted = response!.data as RecentlySoldResponse

            const minimizedArray = formatted.data.home_search.results.map((soldListing) => {
                return {
                    soldPrice: soldListing.last_sold_price,
                    soldDate: soldListing.last_sold_date,
                    beds: soldListing.description.beds,
                    baths: soldListing.description.baths,
                    lotSqft: soldListing.description.lot_sqft,
                    sqft: soldListing.description.sqft,
                    pricePerSqft: (soldListing.last_sold_price / soldListing.description.sqft).toFixed(2),
                    stAddress: soldListing.location.address.line
                }
            })

            console.log("minimzedArray...................",minimizedArray)

            await db.update(houses).set({recentlySold: minimizedArray.toString()}).where(eq(houses.id, event.data.createdId))
            const message: HouseUpdateContextValue['updates'][0] = {
                houseId: event.data.createdId,
                messageCategory: 'house-update',
                updateType: 'complete',
                updateCategory: 'recentlySold'
            }
            await publishStatusFromServer(message)
        })
    }
)

export const incrementTextUsage = inngest.createFunction(
    {id: "Handle incrementing a user's text usage."},
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
