import {
    index,
    integer, primaryKey, real,
    sqliteTableCreator,
    text,
} from "drizzle-orm/sqlite-core";
import {relations} from "drizzle-orm";

export const sqlLiteTable = sqliteTableCreator((name) => `homementor-ai_${name}`);


export const prompts = sqlLiteTable(
    "prompt",
    {
        promptId: text("promptId").notNull(),
        userId: text("userId").notNull(),
        name: text("name").notNull(),
        prompt: text("prompt").notNull()
    },
    (table) => ({
        id: primaryKey({name: 'id', columns: [table.userId, table.promptId]}),
    })
)

export const houses = sqlLiteTable(
    "house",
    {
        id: text("id").notNull().primaryKey(),
        baths: integer("baths").notNull(),
        beds: integer("beds").notNull(),
        city: text("city").notNull(),
        description: text("description"),
        details: text("details"),
        expertise: text("expertise"),
        garage: integer("garage"),
        lat: real("lat"),
        lotSqft: integer("lotSqft"),
        lon: real("lon"),
        price: integer("price"),
        pricePerSqft: real("pricePerSqft"),
        sqft: integer("sqft").notNull(),
        stAddress: text("stAddress").notNull(),
        status: text("status"),
        state: text("state").notNull(),
        stories: integer("stories"),
        styles: text("styles"),
        userId: text("userId").notNull(),
        yearBuilt: integer("yearBuilt"),
        zipCode: text("zipCode").notNull(),
        nearbyPlaces: text("nearbyPlaces"),
        investment: text("investment"),
        recentlySold: text("recentlySold")
    },
    (house) => ({
        userIdIdx: index("houses_userId_idx").on(house.userId),
    })
)

export const houseRelations = relations(houses, ({many}) => ({
    generations: many(generations)
}))

export const generations = sqlLiteTable(
    "generations",
    {
        id: text("id").notNull().primaryKey(),
        createdAt: integer('createdAt', {mode: 'timestamp'}).notNull(),
        houseId: text("houseId").notNull(),
        prompt: text("prompt").notNull(),
        text: text("text").notNull(),
        model: text("model", {length: 255}).notNull(),
    }
)

export const generationsRelations = relations(generations, ({one}) => ({
    house: one(houses, {
        fields: [generations.houseId],
        references: [houses.id]
    })
}))

export const userSubscriptions = sqlLiteTable(
    "userSubscription",
    {
        id: integer("id", {mode: "number"}).notNull().primaryKey({autoIncrement: true}),
        userId: text("userId").notNull(),
        stripeCustomerId: text("stripeCustomerId").unique().notNull(),
        stripeSubscriptionId: text("stripeSubscriptionId", {length: 255}).unique().notNull(),
        stripePriceId: text("stripePriceId").notNull(),
        stripeCurrentPeriodEnd: integer("stripeCurrentPeriodEnd", {mode: "timestamp"}).notNull(),
    }
);

export const userApiLimits = sqlLiteTable(
    "userApiLimit",
    {
        id: integer("id", {mode: "number"}).primaryKey({autoIncrement: true}),
        createdAt: integer("createdAt", {mode: "timestamp"}).notNull(),
        updatedAt: integer("updatedAt", {mode: "timestamp"}),
        periodEnd: integer("periodEnd", {mode: "timestamp"}).notNull(),
        userId: text("userId").unique().notNull(),
        housesQuota: integer("housesQuota").notNull(),
        housesUsage: integer("housesUsage").notNull(),
        textQuota: integer("textQuota").notNull(),
        textUsage: integer("textUsage").notNull(),
        maxTokens: integer("maxTokens").notNull()
    }
)
