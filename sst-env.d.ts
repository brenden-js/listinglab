/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "AwsApiAccessKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "AwsApiSecretKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ClerkPublicKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ClerkSecretKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "DbToken": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "DbUrl": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleAiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "GoogleApiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "HouseApiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "InngestEventKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "InngestSigningKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ListingLab": {
      "type": "sst.aws.Nextjs"
      "url": string
    }
    "OpenAiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "RealtimeLink": {
      "authorizer": string
      "endpoint": string
      "type": "sst.aws.Realtime"
    }
    "StripePublicKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "StripeSecretKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "StripeWebhookSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "TogetherApiKey": {
      "type": "sst.sst.Secret"
      "value": string
    }
  }
}
export {}
