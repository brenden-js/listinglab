export interface GoogleNearbyPlacesAPIResponse {
  places: Place[]
}

export interface Place {
  types: string[]
  displayName: DisplayName
  editorialSummary?: EditorialSummary
  goodForChildren?: boolean
  liveMusic?: boolean
  goodForWatchingSports?: boolean
}

export interface DisplayName {
  text: string
  languageCode: string
}

export interface EditorialSummary {
  text: string
  languageCode: string
}
