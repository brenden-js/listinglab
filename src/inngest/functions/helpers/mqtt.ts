import { Resource } from 'sst';
import { IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import {HouseUpdateContextValue} from "@/app/dashboard/contexts/house-updates-context";

const endpoint = Resource.MyRealtime.endpoint;
const authorizer = Resource.MyRealtime.authorizer;
const topic = `${Resource.App.name}/${Resource.App.stage}`;

export interface StatusMessageData {
    type: 'basic' | 'neighborhood' | 'investment';
    status: 'loading' | 'complete' | 'not_found';
}

const data = new IoTDataPlaneClient();

export async function publishStatusFromServer(message: HouseUpdateContextValue['updates'][0]): Promise<void> {
  await data.send(
  new PublishCommand({
    payload: Buffer.from(
      JSON.stringify(message)
    ),
    topic: `house-updates`,
  })
);
}