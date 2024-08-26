import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";
import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';
import process from "process";
import {TRPCError} from "@trpc/server";
import {and, eq} from "drizzle-orm";
import {AutocompleteResponse, } from "@/trpc/routers/helpers/types";
import {v4} from "uuid";
import {getMaxTokens, getOrCreateApiLimits, getSelectedModel} from "@/trpc/routers/helpers/api-restrictions";
import {db} from "@/db";
import {generations, houses, userApiLimits,  usersToZipCodes, zipCodes} from "@/db/schema";
import {inngest} from "@/inngest/client";
import Together from "together-ai";
import {ChatMessage} from "@/app/dashboard/houses/page";
import {GoogleGenerativeAI} from "@google/generative-ai";

export const houseRouter = createTRPCRouter({
        searchHouse: protectedProcedure
            .input(z.object({stAddress: z.string()}))
            .mutation(async ({input, ctx}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized."})
                }

                const apiLimits = await getOrCreateApiLimits(ctx.authObject.userId)


                if (apiLimits.housesUsage >= apiLimits.housesQuota) {
                    throw new TRPCError({message: "You have reached your usage.", code: "UNAUTHORIZED"})
                }
                const options = {
                    method: 'GET',
                    url: "https://realty-in-us.p.rapidapi.com/locations/v2/auto-complete",
                    params: {
                        input: `${input.stAddress}`,
                        limit: '1'
                    },
                    headers: {
                        'X-RapidAPI-Key': process.env.HOUSE_DATA_API_KEY,
                        'X-RapidAPI-Host': 'realty-in-us.p.rapidapi.com'
                    }
                } as AxiosRequestConfig;

                const response: AxiosResponse = await axios.request(options);

                const autoCompleteResponse = response.data as AutocompleteResponse

                if (autoCompleteResponse.autocomplete.length < 1) {
                    throw new Error('House not found')
                }

                // format for returning to client
                const house = autoCompleteResponse.autocomplete[0]

                if (!house?.mpr_id) {
                    throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Could not find house. "})
                }


                // send an event to enrich this house

                const newId = v4()

                await inngest.send({
                    name: "house/enrich",
                    data: {
                        lookupId: house.mpr_id,
                        houseId: newId,
                        userId: ctx.authObject.userId,
                    }
                })

                if (!house.line || !house.postal_code || !house.city || !house.state_code) {
                    throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Uh oh something happened."})
                }

                return {
                    stAddress: house.line,
                    zipCode: house.postal_code,
                    city: house.city,
                    state: house.state_code,
                    id: newId,
                    expertise: null,
                    lat: null,
                    nearbyPlaces: null,
                    investment: null,
                    recentlySold: null,
                    claimed: 0
                }
            }),
        updateExpertise: protectedProcedure
            .input(z.object(
                {
                    expertise: z.string(),
                    houseId: z.string()
                })
            )
            .mutation(async ({input, ctx}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({message: "No auth found", code: "UNAUTHORIZED"})
                }
                await db.update(houses).set({expertise: input.expertise})
                    .where(and(eq(houses.userId, ctx.authObject.userId), eq(houses.id, input.houseId)))
            }),
        getHouses: protectedProcedure
            .query(async ({ctx}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized to perform this action."})
                }
                // query for most recent 25 houses with pagination
                return db.query.houses.findMany({
                    where: eq(houses.userId, ctx.authObject.userId),
                    orderBy: (houses, {desc}) => desc(houses.createdAt),
                });
            }),
        getHouseGenerations: protectedProcedure
            .input(z.string())
            .query(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "Internal code 98"})
                }
                return db.query.generations.findMany({
                    where: eq(generations.houseId, input),
                    orderBy: (generations, {desc}) => desc(generations.createdAt)
                });
            }),
        getHouseDetails: protectedProcedure
            .input(z.string())
            .query(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "Internal code 98"})
                }
                return db.query.houses.findFirst({
                    where: and(eq(houses.userId, ctx.authObject.userId), eq(houses.id, input)),
                });
            }),
        deleteChat: protectedProcedure
            .input(z.object({houseId: z.string(), topic: z.enum(["Property", "Location", "Financial", "Main"])}))
            .mutation(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized to perform this action."})
                }
                const house = await db.query.houses.findFirst({where: eq(houses.id, input.houseId)})
                if (!house) {
                    throw new TRPCError({code: "NOT_FOUND", message: "Could not find that house."})
                }
                await db.update(houses).set({
                    [input.topic.toLowerCase() + "Expertise"]: null
                }).where(eq(houses.id, input.houseId))
            }),
        claimHouse: protectedProcedure
            .input(z.object({houseId: z.string()}))
            .mutation(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized to perform this action."})
                }
                const house = await db.query.houses.findFirst({where: eq(houses.id, input.houseId)})
                if (!house) {
                    throw new TRPCError({code: "NOT_FOUND", message: "Could not find that house."})
                }
                await db.update(houses).set({claimed: 1}).where(eq(houses.id, input.houseId))
                await inngest.send({
                    name: "house/enrich",
                    data: {
                        lookupId: undefined,
                        houseId: house.id,
                        userId: ctx.authObject.userId,
                    }
                })
                return {status: "House claimed successfully", claimed: 1}
            }),
        getUserZipCodes: protectedProcedure
            .query(async ({ctx}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You are not authorized to perform this action."
                    });
                }
                const userZipCodes = await db.query.usersToZipCodes.findMany({
                    where: eq(usersToZipCodes.userId, ctx.authObject.userId),
                    with: {
                        zipCode: true // Include the related zip code data
                    }
                });

                // Extract zip code information
                const zipCodes = userZipCodes.map(userZipCode => userZipCode.zipCode);

                return zipCodes;
            }),
        setUserZipCode: protectedProcedure
            .input(z.object({zipCode: z.string()}))
            .mutation(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You are not authorized to perform this action."
                    });
                }

                // Get the user's API limits
                const userLimits = await db.query.userApiLimits.findFirst({
                    where: eq(userApiLimits.userId, ctx.authObject.userId)
                });

                if (!userLimits) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "User API limits not found."
                    });
                }

                // Get the user's current zip codes
                const userZipCodes = await db.query.usersToZipCodes.findMany({
                    where: eq(usersToZipCodes.userId, ctx.authObject.userId)
                });

                // Check if the user has reached their zip code limit
                if (userZipCodes.length >= userLimits.zipCodesLimit) { // Assuming you added zipCodesLimit to userApiLimits
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "You have reached your zip code limit."
                    });
                }

                // Check if the zip code already exists
                const existingZipCode = await db.query.zipCodes.findFirst({
                    where: eq(zipCodes.id, input.zipCode)
                });

                let zipCodeId;
                if (!existingZipCode) {
                    // Create a new zip code entry if it doesn't exist
                    zipCodeId = input.zipCode; // Use zip code as ID
                    await db.insert(zipCodes).values({
                        id: zipCodeId,
                        city: 'Unknown', // You might need to fetch city and state based on zip code
                        state: 'Unknown'
                    });
                } else {
                    zipCodeId = existingZipCode.id;
                }

                // Add the zip code to the user's list
                await db.insert(usersToZipCodes).values({
                    userId: ctx.authObject.userId,
                    zipCodeId: zipCodeId
                });

                return {status: "Zip code added successfully"};
            }),
        searchCity: protectedProcedure
            .input(z.object({cityName: z.string()}))
            .mutation(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized to perform this action."})
                }
                // TODO: search for city
                return {cityName: input.cityName, state: "CA"}
            }),
        generateText: protectedProcedure
            .input(z.object({
                houses: z.array(z.object({id: z.string()})).min(1),
                prompt: z.string().min(8),
                temperature: z.number().optional(),
                top_p: z.number().optional(),
                frequency_penalty: z.number().optional(),
                presence_penalty: z.number().optional(),
                max_tokens: z.number(),
                // model: z.union([
                //     z.literal("gpt-4-turbo-preview"),
                //     z.literal("anthropic.claude-v2:1"),
                //     z.literal("amazon.titan-text-lite-v1"),
                //     z.literal("amazon.titan-text-express-v1"),
                //     z.literal("anthropic.claude-3-sonnet-20240229-v1:0")
                // ]),
                dataset: z.union([
                    z.literal("interior"),
                    z.literal("exterior"),
                    z.literal("investment")
                    // in the future, we can add more datasets here
                ])
            }))
            .mutation(async ({ctx, input}) => {
                    if (!ctx.authObject.userId) {
                        throw new TRPCError({code: "UNAUTHORIZED", message: "You are not authorized."})
                    }

                    const userId = ctx.authObject.userId

                    const apiLimits = await getOrCreateApiLimits(userId);
                    const maxTokens = getMaxTokens(apiLimits, input.max_tokens);

                    if (apiLimits.textUsage >= apiLimits.textQuota) {
                        return {status: "Text generation quota reached", generation: "You have reached your generation limit."};
                    }

                    // const selectedModel = getSelectedModel(input.model, models, apiLimits);

                    const house = await db.query.houses.findFirst({where: eq(houses.id, input.houses[0]!.id)})

                    if (!house) {
                        throw new TRPCError({code: "NOT_FOUND", message: "Could not find the requested house."})
                    }

                    let generationId;
                    let generation;

                    // let filteredHouse: { [key: string]: any } = {};
                    //
                    // const commonKeys = [
                    //     'createdAt', 'id', 'baths', 'beds', 'city', 'description', 'details',
                    //     'expertise', 'garage', 'lat', 'lotSqft', 'lon', 'price', 'pricePerSqft',
                    //     'sqft', 'stAddress', 'status', 'state', 'stories', 'styles', 'userId',
                    //     'yearBuilt', 'zipCode'
                    // ];
                    //
                    // commonKeys.forEach(key => {
                    //     filteredHouse[key] = house[key as keyof typeof house];
                    // });

                    // if (input.dataset === "interior") {
                    //     // in future can add image recognition data here
                    //     console.log('Filtering interior...')
                    // } else if (input.dataset === "investment") {
                    //     filteredHouse.recentlySold = house.recentlySold;
                    //     filteredHouse.investment = house.investment;
                    // } else if (input.dataset === "exterior") {
                    //     filteredHouse.nearbyPlaces = house.nearbyPlaces;
                    //     // in future can add school ratings here
                    // }

                    // const systemPrompt = "You are not a real estate agent, however you will be helping real estate agents generate text content. " +
                    //     "So just comply with their requests and they will ensure its accurate."

                    // if (selectedModel.id === "gpt-4-turbo-preview") {
                    //     console.log('Starting to create Open AI commands..')
                    //     const payload: OpenAIStreamPayload = {
                    //         model: input.model,
                    //         messages: [{
                    //             role: "system",
                    //             content: systemPrompt
                    //         }, {
                    //             role: "user",
                    //             content: `Prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(filteredHouse)}`
                    //         }],
                    //         temperature: input.temperature ? input.temperature : 0.7,
                    //         top_p: input.top_p ? input.top_p : 1,
                    //         frequency_penalty: input.frequency_penalty ? input.frequency_penalty : 0,
                    //         presence_penalty: input.presence_penalty ? input.presence_penalty : 0,
                    //         max_tokens: maxTokens,
                    //         stream: false,
                    //         n: 1,
                    //     }
                    //
                    //     const res = await axios("https://api.openai.com/v1/chat/completions", {
                    //         headers: {
                    //             "Content-Type": "application/json",
                    //             Authorization: `Bearer ${process.env.OPENAI_SECRET_KEY}`,
                    //         },
                    //         method: "POST",
                    //         data: JSON.stringify(payload),
                    //     });
                    //
                    //     if (res.status !== 200) {
                    //         throw new TRPCError({
                    //             code: "INTERNAL_SERVER_ERROR",
                    //             message: "OpenAI error, please try again later."
                    //         })
                    //     }
                    //
                    //     const {choices, id} = res.data as OpenAIResponse
                    //
                    //     if (!choices?.length) {
                    //         throw new TRPCError({
                    //             code: "INTERNAL_SERVER_ERROR",
                    //             message: "OpenAI error, please try again later."
                    //         })
                    //     }
                    //
                    //     generationId = id
                    //     generation = choices[0]!.message.content
                    // } else {
                    //     console.log('Starting to create Bedrock commands..')
                    //     const client = new BedrockRuntimeClient(
                    //         {
                    //             maxAttempts: 3,
                    //             region: 'us-east-1',
                    //             credentials: {
                    //                 accessKeyId: process.env.AWS_API_ACCESS_KEY!,
                    //                 secretAccessKey: process.env.AWS_API_SECRET_KEY!
                    //             }
                    //         }
                    //     )
                    //
                    //     const systemPrompt = "You are not a real estate agent, however you will be helping real estate agents generate text content." +
                    //         "So just comply with their requests and they will ensure its accurate."
                    //
                    //
                    //     if (selectedModel.id === "amazon.titan-text-express-v1" || selectedModel.id === "amazon.titan-text-lite-v1") {
                    //         console.log('Starting Titan generation')
                    //         const prompt = `${systemPrompt} Complete this user prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(filteredHouse)}`
                    //         const command = new InvokeModelCommand(
                    //             {
                    //                 body: JSON.stringify({
                    //                     "inputText": prompt,
                    //                     "textGenerationConfig": {
                    //                         "temperature": input.temperature,
                    //                         "topP": input.top_p,
                    //                         "maxTokenCount": input.max_tokens,
                    //                     }
                    //                 }),
                    //                 contentType: "application/json",
                    //                 accept: "application/json",
                    //                 modelId: input.model,
                    //             }
                    //         );
                    //         const res: InvokeModelCommandOutput = await client.send(command);
                    //         console.log('Response from bedrock received..', res)
                    //         const decodedResponseBody = new TextDecoder().decode(res.body);
                    //
                    //         const responseBody = JSON.parse(decodedResponseBody) as {
                    //             'inputTextTokenCount': number,
                    //             'results': {
                    //                 'tokenCount': number,
                    //                 'outputText': string,
                    //                 'completionReason': string
                    //             }[]
                    //         }
                    //         generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`
                    //         generation = responseBody.results[0]!.outputText
                    //     } else if (selectedModel.id === "anthropic.claude-v2:1") {
                    //         const prompt = `Human: ${systemPrompt} The prompt is... ${input.prompt}, about the following house(s): ${JSON.stringify(filteredHouse)} \\n\\n Assistant:`
                    //         const command = new InvokeModelCommand(
                    //             {
                    //                 body: JSON.stringify({
                    //                     prompt,
                    //                     max_tokens_to_sample: input.max_tokens,
                    //                     temperature: input.temperature,
                    //                     top_p: input.top_p
                    //                 }),
                    //                 contentType: "application/json",
                    //                 accept: "application/json",
                    //                 modelId: input.model,
                    //             }
                    //         );
                    //         const res: InvokeModelCommandOutput = await client.send(command);
                    //         const decodedResponseBody = new TextDecoder().decode(res.body);
                    //
                    //         const responseBody = JSON.parse(decodedResponseBody) as {
                    //             "completion": string
                    //         }
                    //         generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`
                    //         generation = responseBody.completion
                    //     } else if (selectedModel.id === "anthropic.claude-3-sonnet-20240229-v1:0") {
                    //         const prompt = `Complete the following user prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(filteredHouse)}`
                    //         const command = new InvokeModelCommand({
                    //                 modelId: input.model,
                    //                 contentType: "application/json",
                    //                 accept: "application/json",
                    //                 body: JSON.stringify({
                    //                     anthropic_version: 'bedrock-2023-05-31',
                    //                     max_tokens: input.max_tokens,
                    //                     messages: [
                    //                         {role: 'user', 'content': prompt}
                    //                     ],
                    //                     system: systemPrompt
                    //                 })
                    //             }
                    //         )
                    //         const res: InvokeModelCommandOutput = await client.send(command);
                    //
                    //         const format = JSON.parse(new TextDecoder().decode(res.body)) as {
                    //             id: string,
                    //             type: 'message',
                    //             role: 'assistant',
                    //             content: [{ type: 'text', text: string }],
                    //             model: 'claude-3-sonnet-28k-20240229',
                    //             stop_reason: 'end_turn',
                    //             stop_sequence: null,
                    //             usage: { input_tokens: number, output_tokens: number }
                    //         };
                    //         console.log('Claude 3 response : ', format)
                    //
                    //         generation = format.content[0].text
                    //         generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`
                    //
                    //     }
                    // }


                    const together = new Together({
                        apiKey: process.env.TOGETHER_API_KEY,
                    });

                    const response = await together.chat.completions.create({
                        model: "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
                        messages: [{
                            role: "user",
                            content: `Here is the user prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(house)}`
                        }],
                    });

                    console.log('Together response : ', response)

                    if (!response.choices?.length) {
                        throw new TRPCError({
                            code: "INTERNAL_SERVER_ERROR",
                            message: "Generation error, please try again later."
                        })
                    }

                    generation = response.choices[0]?.message?.content ?? "";

                    // send event for incrementing user trial, for incrementing various other stats.

                    if (generation.length && generationId) {
                        await inngest.send({
                            name: "house/add-generation",
                            data: {
                                id: generationId,
                                houseId: input.houses[0]!.id,
                                text: generation,
                                // model: input.model,
                                prompt: input.prompt,
                                userId: ctx.authObject.userId
                            }
                        })
                        return {status: "Generated succesfully", generation}
                    } else {
                        // add some serious admin notifications here
                        throw new TRPCError({message: 'No generation and generation Id found', code: "INTERNAL_SERVER_ERROR"})
                    }
                }
            ),
        updateChat: protectedProcedure
            .input(
                z.object({
                    topic: z.enum(["Property", "Location", "Financial", "Main"]),
                    message: z.object({
                        sender: z.string(),
                        message: z.string(),
                    }),
                    houseId: z.string(),
                })
            )
            .mutation(async ({ctx, input}) => {
                if (!ctx.authObject.userId) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED",
                        message: "You are not authorized.",
                    });
                }

                console.log('Starting to update chat...')

                const userId = ctx.authObject.userId;

                const house = await db.query.houses.findFirst({
                    where: eq(houses.id, input.houseId),
                });

                console.log('house...', house)

                if (!house) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Could not find the requested house.",
                    });
                }

                let chatData;
                switch (input.topic) {
                    case "Property":
                        chatData = JSON.parse(house.propertyExpertise || "[]");
                        break;
                    case "Location":
                        chatData = JSON.parse(house.locationExpertise || "[]");
                        break;
                    case "Financial":
                        chatData = JSON.parse(house.financialExpertise || "[]");
                        break;
                    case "Main":
                        chatData = JSON.parse(house.mainExpertise || "[]");
                        break;
                }

                // add the house data to the chatData array as a message from the user


                // customize the system prompt for Financial, Property, and Location chats
                if (input.topic === "Financial") {
                    chatData.push({
                        sender: "system",
                        message: `Your name in this chat is Deena. You are not a financial advisor, however you will be helping real estate agents generate text content about the financial information for a house. 
                            Here is the house this chat is about: ${JSON.stringify(house)}
                            This is an exploratory chat, where you will help the user get all their expertise out so they can use it to create content. 
                            Ask the agent to expand on what they know about the house's financial situation, such as:
                            - Typical home prices and property taxes in the area
                            - Potential for renovations to improve the property's value
                            - Cost of living and affordability in the neighborhood
                            - Any relevant tax incentives or government programs for homebuyers
                            Ask the agent clarifying questions to better understand the financial context they need to provide to potential buyers. The goal is to create content that educates and informs the user, without getting into the specific numbers. This content should complement the agent's expertise and financial disclosures.`
                    })
                } else if (input.topic === "Property") {
                    chatData.push({
                        sender: "system",
                        message: `Your name in this chat is Deena. You are not a real estate expert, however you will be helping real estate agents generate text content about the property details for a house. 
                            Here is the house this chat is about: ${JSON.stringify(house)}
                            This is an exploratory chat, where you will help the user get all their expertise out so they can use it to create content. 
                            Ask the agent to expand on what they know about the house's property, such as:
                            - Architectural style and unique design elements
                            - Highlights of the floor plan and layout
                            - Notable amenities or special features (e.g. pool, garage, outdoor living spaces)
                            - Estimated square footage, bedrooms, bathrooms
                            - Age of the home and any recent renovations
                            Ask the agent clarifying questions to better understand what details would be most useful for potential buyers. The goal is to create content that sparks the user's interest and provides a vivid picture of the property, without overwhelming them with an exhaustive list of facts. This content should complement the agent's expertise and property listings.`
                    })
                } else if (input.topic === "Location") {
                    chatData.push({
                        sender: "system",
                        message: `Your name in this chat is Deena. You are not a real estate agent, however you will be helping real estate agents generate text content about the location and neighborhood for a house. 
                            Here is the house this chat is about: ${JSON.stringify(house)}
                            This is an exploratory chat, where you will help the user get all their expertise out so they can use it to create content. 
                            Ask the agent to expand on what they know about the neighborhood, such as:
                            - The overall vibe and character of the area (e.g. urban, suburban, family-friendly)
                            - Prominent landmarks, attractions, or points of interest nearby
                            - Description of the architecture, landscaping, and visual aesthetic
                            - Notable community events, activities, or cultural offerings
                            - Access to transportation, commute times, and walkability
                            - Quality of local schools, parks, and other community resources
                            Ask the agent clarifying questions to better understand what details would be most relevant and compelling for potential buyers. The goal is to create content that paints a vivid picture of what it would be like to live in this neighborhood, beyond just the physical location. This content should complement the agent's expertise and market knowledge.`
                    })
                } else if (input.topic === 'Main') {
                    chatData.push({
                        sender: "system",
                        message: `Your name in this chat is Deena. You are not a real estate agent, however you will be helping real estate agents generate text content about the main chat for a house. 
                            Here is the house this chat is about: ${JSON.stringify(house)}
                            This is a chat where you will help generate content for a real estate agent. 
                            This content should complement the agent's expertise and market knowledge.`
                    })
                }


                chatData.push({sender: "You", message: `${input.message.message}`})

                // const together = new Together({
                //     apiKey: process.env.TOGETHER_API_KEY,
                // });
                //
                // console.log('Sending to together api...')
                //
                // const response = await together.chat.completions.create({
                //     model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                //     messages: [
                //         ...chatData.map((message: ChatMessage) => ({
                //             role: message.sender,
                //             content: message.message,
                //         })),
                //         {
                //             role: "user",
                //             content: input.message.message,
                //         },
                //     ],
                // });
                //
                // const aiResponse = response.choices?.[0]?.message?.content;

                console.log("starting google")

                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

                console.log('starting model')
                const model = genAI.getGenerativeModel({model: "gemini-1.5-pro-exp-0801"});
                console.log('starting generation')

                const aiResponse = await model.generateContent(JSON.stringify(
                    chatData.map((message: ChatMessage) => ({
                        role: message.sender,
                        content: message.message,
                    })).concat([
                        {
                            role: "user",
                            content: input.message.message,
                        },
                    ])
                ));

                console.log('Ai response.....', aiResponse.response.text());


                if (!aiResponse) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR",
                        message: "AI response generation failed, please try again later.",
                    });
                }

                chatData.push({
                    sender: "Deena",
                    message: aiResponse.response.text(),
                });

                console.log('Updated chat data...', chatData)

                const filteredChatData = chatData.filter((message: ChatMessage) => message.sender !== "system")


                await db.update(houses).set({
                    [input.topic.toLowerCase() + "Expertise"]: JSON.stringify(filteredChatData),
                }).where(eq(houses.id, input.houseId))

                console.log('Updated house...', house.id)

                return {
                    status: "Chat updated successfully",
                    filteredChatData,
                    chatTopic: input.topic,
                };
            }),
    },
)

