import {userApiLimits, userSubscriptions} from "@/app/api/trpc/db/schema";
import {eq} from "drizzle-orm";
import {db} from "@/app/api/trpc/db";
import {TRPCError} from "@trpc/server";
import {Model} from "@/lib/data/models";

export interface ApiLimits {
  userId: string;
  createdAt: Date;
  housesUsage: number;
  housesQuota: number;
  textUsage: number;
  textQuota: number;
  maxTokens: number;
  periodEnd: Date;
}
export const getOrCreateApiLimits = async (userId: string) => {
    const apiLimits = await db.query.userApiLimits.findFirst({ where: eq(userApiLimits.userId, userId) });

    if (apiLimits) {
        return apiLimits;
    }

    const stripeSub = await db.query.userSubscriptions.findFirst({ where: eq(userSubscriptions.userId, userId) });
    const subValid = stripeSub?.stripeCurrentPeriodEnd && stripeSub.stripeCurrentPeriodEnd > new Date();

    const maxTokens = subValid ? 4000 : 750;
    const housesQuota = subValid ? 25 : 3;
    const textQuota = subValid ? 125 : 3;
    const periodEnd = subValid ? stripeSub.stripeCurrentPeriodEnd : new Date();

    const newApiLimits = {
        userId,
        createdAt: new Date(),
        housesUsage: 0,
        housesQuota,
        textUsage: 0,
        textQuota,
        maxTokens,
        periodEnd,
    };

    await db.insert(userApiLimits).values(newApiLimits);
    return newApiLimits;
};


export const getMaxTokens = (apiLimits: ApiLimits, requestedMaxTokens: number) => {
    if (requestedMaxTokens > apiLimits.maxTokens) {
        return apiLimits.maxTokens;
    }
    return requestedMaxTokens;
};

export const getSelectedModel = (selectedModelId: string, models: Model[], apiLimits: ApiLimits) => {
    const selectedModel = models.find(model => model.id === selectedModelId);

    if (!selectedModel) {
        throw new TRPCError({ message: "Invalid model selection.", code: "BAD_REQUEST" });
    }

    if (selectedModel.pro && !(apiLimits.periodEnd > new Date())) {
        throw new TRPCError({
            message: "Your current subscription does not allow for the use of Pro models.",
            code: "BAD_REQUEST"
        });
    }

    return selectedModel;
};