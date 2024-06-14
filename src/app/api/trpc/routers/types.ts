export type ChatGPTAgent = "user" | "system";

export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}

export interface OpenAIStreamPayload {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  stream: boolean;
  n: number;
}


// Search-Address Result

export interface SearchAddressResult {
  data: Data
  status: boolean
  message: string
}

export interface Data {
  description: string
  rentalApplicationsAcceptedType: string
  providerListingID: any
  whatILove: any
  showDescriptionDisclaimer: boolean
  postingUrl: any
  moveInReady: boolean
  imageLink: string
  streetViewImageUrl: string
  timeZone: string
  virtualTourUrl: any
  longitude: number
  latitude: number
  homeType: string
  homeStatus: string
  isZillowOwned: boolean
  isIncomeRestricted: any
  isHousingConnector: boolean
  price: number
  zestimate: number
  zestimateLowPercent: string
  zestimateHighPercent: string
  zestimateMinus30: string
  livingAreaValue: number
  lotAreaValue: number
  lotAreaUnits: string
  hoaFee: number
  hoaFeeFrequency: string
  monthlyHoaFee: number
  listingDataSource: string
  timeOnZillow: any
  daysOnZillow: any
  favoriteCount: number
  pageViewCount: number
  rentalDateAvailable: any
  listing_sub_type: ListingSubType
  rentalListingOwnerReputation: RentalListingOwnerReputation
  rentalListingOwnerContact: RentalListingOwnerContact
  roomForRent: any
  unassistedShowing: any
  primaryPublicVideo: any
  photoUrls: PhotoUrl[]
  photoUrlsHighRes: PhotoUrlsHighRe[]
  resoFacts: ResoFacts
  homeInsights: any[]
  scheduleTourUrl: ScheduleTourUrl
  richMediaVideos: any
  richMedia: any
  contactAgentUrl: ContactAgentUrl
  startOfferUrl: StartOfferUrl
  zoResaleStartAnOfferEnabled: any
  zoUpsellDisplayInfo: ZoUpsellDisplayInfo
  formattedChip: FormattedChip
  listingMetadata: ListingMetadata
  homeValueChartData: HomeValueChartDaum[]
}

export interface ListingSubType {
  is_roomForRent: boolean
}

export interface RentalListingOwnerReputation {
  contactCount: any
  applicationCount: any
}

export interface RentalListingOwnerContact {
  displayName: any
  phoneNumber: any
  photoUrl: string
}

export interface PhotoUrl {
  url: string
  subjectType: any
}

export interface PhotoUrlsHighRe {
  url: string
}

export interface ResoFacts {
  homeType: string
  propertySubType: any
  lotSize: string
  yearBuilt: number
  parkingFeatures: string[]
  parkingCapacity: number
  carportParkingCapacity: any
  garageParkingCapacity: any
  coveredParkingCapacity: any
  openParkingCapacity: any
  hasAttachedGarage: any
  hasCarport: any
  hasGarage: boolean
  hasOpenParking: any
  cooling: string[]
  hasCooling: boolean
  heating: string[]
  leaseTerm: any
  depositsAndFees: any
  laundryFeatures: string[]
  flooring: string[]
  appliances: string[]
  hasPrivatePool: any
  exteriorFeatures: string[]
  accessibilityFeatures: any
  patioAndPorchFeatures: any
  furnished: boolean
  hoaFee: string
  pricePerSquareFoot: number
  communityFeatures: any[]
  otherFacts: OtherFact[]
  atAGlanceFacts: AtAglanceFact[]
}

export interface OtherFact {
  name?: string
  value: string
}

export interface AtAglanceFact {
  factLabel: string
  factValue?: string
}

export interface ScheduleTourUrl {
  path: string
}

export interface ContactAgentUrl {
  path: string
}

export interface StartOfferUrl {
  path: string
}

export interface ZoUpsellDisplayInfo {
  eligibleLeadTypes: any[]
  entryActionLinks: any
}

export interface FormattedChip {
  mainPrice: any
  priceChange: any
  location: Location[]
  status: Status
  quickFacts: QuickFact[]
  additionalFacts: AdditionalFact[]
}

export interface Location {
  fullValue: string
  abbreviatedValue: any
}

export interface Status {
  fullValue: string
  abbreviatedValue: string
}

export interface QuickFact {
  elementType: string
  prefixLabel: any
  value: Value
  suffixLabel: SuffixLabel
  contentDescription: string
  jsMessage: any
}

export interface Value {
  fullValue: string
  abbreviatedValue: any
}

export interface SuffixLabel {
  fullValue: string
  abbreviatedValue: string
}

export interface AdditionalFact {
  elementType: string
  prefixLabel: PrefixLabel
  value: Value2
  suffixLabel?: SuffixLabel2
  contentDescription: string
  jsMessage: any
}

export interface PrefixLabel {
  fullValue: string
  abbreviatedValue: any
}

export interface Value2 {
  fullValue: string
  abbreviatedValue: any
}

export interface SuffixLabel2 {
  fullValue: string
  abbreviatedValue: any
}

export interface ListingMetadata {
  isAdsRestricted: boolean
}

export interface HomeValueChartDaum {
  name: string
  points: Point[]
}

export interface Point {
  x: number
  y: number
}
