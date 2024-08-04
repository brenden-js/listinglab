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
        createdAt: integer("createdAt", {mode: 'timestamp'}).notNull(),
        id: text("id").notNull(),
        baths: integer("baths"),
        beds: integer("beds"),
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
        recentlySold: text("recentlySold"),
        claimed: integer("claimed")
    },
    (house) => ({
        userIdIdx: index("houses_userId_idx").on(house.userId),
        primaryKey: primaryKey({name: 'stAddressAndZip', columns: [house.stAddress, house.zipCode]}),
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
        model: text("model", {length: 255}),
    }
)

export const generationsRelations = relations(generations, ({one}) => ({
    house: one(houses, {
        fields: [generations.houseId],
        references: [houses.id]
    })
}))


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
        maxTokens: integer("maxTokens").notNull(),
        stripeCustomerId: text("stripeCustomerId").unique(),
        stripeSubscriptionId: text("stripeSubscriptionId", {length: 255}).unique(),
        stripePriceId: text("stripePriceId"),
        stripeCurrentPeriodEnd: integer("stripeCurrentPeriodEnd", {mode: "timestamp"}),
    }
)


export const cities = sqlLiteTable(
    "city",
    {
        id: text("id").notNull().primaryKey(),
        name: text("name").notNull(),
        state: text("state").notNull(),
    })

export const usersToCities = sqlLiteTable(
    "usersToCities",
    {
        id: integer("id", {mode: "number"}).primaryKey({autoIncrement: true}),
        userId: text("userId").notNull(),
        cityId: text("cityId").notNull(),
        cityName: text("cityName").notNull(),
        state: text("state").notNull(),
    },
    (table) => {
        return {
            cityStateIdx: index("city_state_idx").on(table.cityName, table.state),
        }
    }

)

export const citiesRelations = relations(cities, ({many}) => ({
    usersToCities: many(usersToCities),
}))

export const usersRelations = relations(userApiLimits, ({many}) => ({
    userToCities: many(usersToCities),
}))

export const userToCitiesRelations = relations(usersToCities, ({one}) => ({
        city: one(cities, {
            fields: [usersToCities.cityId],
            references: [cities.id]
        }),
        user: one(userApiLimits, {
            fields: [usersToCities.userId],
            references: [userApiLimits.userId]
        })
    })
)
