
export type HouseEnrich = {
  name: "house/enrich",
  data: {
    lookupId: string
    createdId: string
    userId: string
  }
}

export type AddGenerationToHouse = {
  name: "house/add-generation",
  data: {
    houseId: string
    text: string
    model: string
    prompt: string
    userId: string
  }
}