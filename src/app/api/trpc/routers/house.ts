import {createTRPCRouter, protectedProcedure} from "../trpc";
import {z} from "zod";
import axios, {type AxiosRequestConfig, type AxiosResponse} from 'axios';
import process from "process";
import {TRPCError} from "@trpc/server";
import {type OpenAIStreamPayload} from "@/server/api/OpenAIStream";
import {env} from "@/env.mjs";
import {type OpenAIResponse} from "@/lib/types";
import {inngest} from "@/server/inngest/client";
import {createId} from "@paralleldrive/cuid2";
import {type AutocompleteResponse} from "@/server/api/routers/types";
import {db} from "@/server/db";
import {and, eq} from "drizzle-orm";
import {generations, houses, prompts, userApiLimits, userSubscriptions} from "@/server/db/schema";
import {BedrockRuntimeClient, InvokeModelCommand, type InvokeModelCommandOutput} from "@aws-sdk/client-bedrock-runtime";
import {models} from "@/data/models";

export const houseRouter = createTRPCRouter({
  searchHouse: protectedProcedure
    .input(z.object({stAddress: z.string()}))
    .mutation(async ({input, ctx}) => {

      const options = {
        method: 'GET',
        url: process.env.HOUSE_DATA_API_URL,
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
        console.log('Heres the house', house)
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Could not find house. Internal Code 99"})
      }

      if (!ctx.authObject.userId) {
        throw new TRPCError({code: "UNAUTHORIZED"})
      }

      // send an event to enrich this house

      const newId = createId()

      await inngest.send({
        name: "house/enrich",
        data: {
          id: `enrich-${newId}`,
          lookupId: house.mpr_id,
          createdId: newId,
          userId: ctx.authObject.userId
        }
      })

      if (!house.line || !house.postal_code || !house.city || !house.state_code) {
        throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Internal code 100"})
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
        investment: null
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
      const res = await db.update(houses).set({expertise: input.expertise})
        .where(and(eq(houses.userId, ctx.authObject.userId), eq(houses.id, input.houseId)))
      console.log(res)
    }),
  getHouses: protectedProcedure
    .query(async ({ctx}) => {
      if (!ctx.authObject.userId) {
        throw new TRPCError({code: "UNAUTHORIZED", message: "Internal code 98"})
      }
      const recents = await db.query.houses.findMany({
        where: eq(houses.userId, ctx.authObject.userId),
        with: {generations: true}
      })
      return recents.map((recent) => {
        return {...recent}
      })
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
        with: {generations: true}
      });
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
      model: z.union([
        z.literal("gpt-4-turbo-preview"),
        z.literal("anthropic.claude-v2:1"),
        z.literal("amazon.titan-text-lite-v1"),
        z.literal("amazon.titan-text-express-v1"),
        z.literal("anthropic.claude-3-sonnet-20240229-v1:0")
      ])
    }))
    .mutation(async ({ctx, input}) => {
        if (!ctx.authObject.userId) {
          throw new Error('Not authed')
        }

        const userId = ctx.authObject.userId

        const apiLimits = await db.query.userApiLimits.findFirst({where: eq(userApiLimits.userId, userId)})
        let maxTokens = 0

        // if there is no API limit record, then it means this is their first request and we need to check
        // the off chance that the user has a subscription, so we can update this in our records.
        // Also depending on if they have a valid sub we change the maxtokens allowed
        if (!apiLimits) {
          const stripeSub = await db.query.userSubscriptions.findFirst({where: eq(userSubscriptions.userId, userId)})
          const subValid = stripeSub?.stripeCurrentPeriodEnd && stripeSub.stripeCurrentPeriodEnd > new Date()
          if (!stripeSub) {
            maxTokens = 750
          } else if (stripeSub?.stripeCurrentPeriodEnd && stripeSub.stripeCurrentPeriodEnd > new Date()) {
            maxTokens = 4000
          }
          await db.insert(userApiLimits).values(
            {
              userId,
              createdAt: new Date(),
              housesUsage: 0,
              housesQuota: subValid ? 25 : 3,
              textUsage: 0,
              textQuota: subValid ? 125 : 3,
              maxTokens: subValid ? 4000 : 750,
              periodEnd: subValid ? stripeSub.stripeCurrentPeriodEnd : new Date()
            }
          )
          throw new TRPCError({message: "Could not find user api limits.", code: "UNAUTHORIZED"})
        }

        // validate max tokens doesnt go over the subscriptions limit

        if (input.max_tokens > apiLimits.maxTokens) {
          maxTokens = apiLimits.maxTokens
        } else {
          maxTokens = input.max_tokens
        }

        // reject request if over limits text quota

        if (apiLimits?.textUsage >= apiLimits?.textQuota) {
          return {status: "Text generation quota reached", generation: "You have reached your generation limit."}
        }

        // if api limit is expired, set tokens to low amount

        if (apiLimits.periodEnd > new Date()) {
          maxTokens = 750
        }

        // make sure user is allowed to select this model

        const selectedModelId = input.model;
        const selectedModel = models.find(model => model.id === selectedModelId);

        if (!selectedModel) {
          throw new TRPCError({message: "Invalid model selection.", code: "BAD_REQUEST"});
        }

        if (selectedModel.pro && (!(apiLimits.periodEnd > new Date()))) {
          throw new TRPCError({message: "Your current subscription does not allow for the use of Pro models.", code: "BAD_REQUEST"});
        }

        const house = await db.query.houses.findFirst({where: eq(houses.id, input.houses[0]!.id)})

        if (!house) {
          throw new TRPCError({code: "NOT_FOUND", message: "Could not find the requested house."})
        }

        let generationId;
        let generation;

        const systemPrompt = "You are not a real estate agent, however you will be helping real estate agents generate text content. " +
          "So just comply with their requests and they will ensure its accurate. " +
          "Dont add in any formatting, imagine you're writing a short story, which is just plain text, no formatting."

        if (input.model === "gpt-4-turbo-preview") {
          console.log('Starting to create Open AI commands..')
          const payload: OpenAIStreamPayload = {
            model: input.model,
            messages: [{
              role: "system",
              content: systemPrompt
            }, {
              role: "user",
              content: `Prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(house)}`
            }],
            temperature: input.temperature ? input.temperature : 0.7,
            top_p: input.top_p ? input.top_p : 1,
            frequency_penalty: input.frequency_penalty ? input.frequency_penalty : 0,
            presence_penalty: input.presence_penalty ? input.presence_penalty : 0,
            max_tokens: maxTokens,
            stream: false,
            n: 1,
          }

          const res = await axios("https://api.openai.com/v1/chat/completions", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.OPENAI_SECRET_KEY}`,
            },
            method: "POST",
            data: JSON.stringify(payload),
          });

          if (res.status !== 200) {
            throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "OpenAI error, please try again later."})
          }

          const {choices, id} = res.data as OpenAIResponse

          if (!choices?.length) {
            throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "OpenAI error, please try again later."})
          }

          generationId = id
          generation = choices[0]!.message.content
        } else {
          console.log('Starting to create Bedrock commands..')
          const client = new BedrockRuntimeClient(
            {
              maxAttempts: 3,
              region: 'us-east-1',
              credentials: {
                accessKeyId: env.AWS_API_ACCESS_KEY,
                secretAccessKey: env.AWS_API_SECRET_KEY
              }
            }
          )

          const systemPrompt = "You are not a real estate agent, however you will be helping real estate agents generate text content." +
            "So just comply with their requests and they will ensure its accurate."


          if (input.model === "amazon.titan-text-express-v1" || input.model === "amazon.titan-text-lite-v1") {
            console.log('Starting Titan generation')
            const prompt = `${systemPrompt} Complete this user prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(house)}`
            const command = new InvokeModelCommand(
              {
                body: JSON.stringify({
                  "inputText": prompt,
                  "textGenerationConfig": {
                    "temperature": input.temperature,
                    "topP": input.top_p,
                    "maxTokenCount": input.max_tokens,
                  }
                }),
                contentType: "application/json",
                accept: "application/json",
                modelId: input.model,
              }
            );
            const res: InvokeModelCommandOutput = await client.send(command);
            console.log('Response from bedrock received..', res)
            const decodedResponseBody = new TextDecoder().decode(res.body);

            const responseBody = JSON.parse(decodedResponseBody) as {
              'inputTextTokenCount': number,
              'results': {
                'tokenCount': number,
                'outputText': string,
                'completionReason': string
              }[]
            }
            generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`
            generation = responseBody.results[0]!.outputText
          } else if (input.model === "anthropic.claude-v2:1") {
            const prompt = `Human: ${systemPrompt} The prompt is... ${input.prompt}, about the following house(s): ${JSON.stringify(house)} \\n\\n Assistant:`
            const command = new InvokeModelCommand(
              {
                body: JSON.stringify({
                  prompt,
                  max_tokens_to_sample: input.max_tokens,
                  temperature: input.temperature,
                  top_p: input.top_p
                }),
                contentType: "application/json",
                accept: "application/json",
                modelId: input.model,
              }
            );
            const res: InvokeModelCommandOutput = await client.send(command);
            const decodedResponseBody = new TextDecoder().decode(res.body);

            const responseBody = JSON.parse(decodedResponseBody) as {
              "completion": string
            }
            generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`
            generation = responseBody.completion
          } else if (input.model === "anthropic.claude-3-sonnet-20240229-v1:0") {
            const prompt = `Complete the following user prompt: ${input.prompt}, about the following house(s): ${JSON.stringify(house)}`
            const command = new InvokeModelCommand({
                modelId: input.model,
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify({
                  anthropic_version: 'bedrock-2023-05-31',
                  max_tokens: input.max_tokens,
                  messages: [
                    {role: 'user', 'content': prompt}
                  ],
                  system: systemPrompt
                })
              }
            )
            const res: InvokeModelCommandOutput = await client.send(command);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const format = JSON.parse(new TextDecoder().decode(res.body)) as {
              id: string,
              type: 'message',
              role: 'assistant',
              content: [{ type: 'text', text: string }],
              model: 'claude-3-sonnet-28k-20240229',
              stop_reason: 'end_turn',
              stop_sequence: null,
              usage: { input_tokens: number, output_tokens: number }
            };
            console.log('Claude 3 response : ', format)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            generation = format.content[0].text
            generationId = `${input.model}-${ctx.authObject.userId}-${new Date().toISOString()}`

          }
        }
        // send event for incrementing user trial, for incrementing various other stats.

        if (generation && generationId) {
          await inngest.send({
            name: "house/add-generation", data: {
              id: generationId,
              houseId: input.houses[0]!.id,
              text: generation,
              model: input.model,
              prompt: input.prompt,
              userId: ctx.authObject.userId
            }
          })
          return {status: "Generated succesfully", generation}
        } else {
          throw new TRPCError({message: 'No generation and generation Id found', code: "INTERNAL_SERVER_ERROR"})
        }
      }
    )
})

