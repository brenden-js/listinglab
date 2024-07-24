import {Resource} from 'sst';
import {IoTDataPlaneClient, PublishCommand} from "@aws-sdk/client-iot-data-plane";
import {HouseUpdateContextValue} from "@/lib/contexts/house-updates";

const endpoint = Resource.RealtimeLink.endpoint;
const authorizer = Resource.RealtimeLink.authorizer;
const topic = `${Resource.App.name}/${Resource.App.stage}`;

export interface StatusMessageData {
    type: 'basic' | 'neighborhood' | 'investment';
    status: 'loading' | 'complete' | 'not_found';
}

const data = new IoTDataPlaneClient();

export async function publishStatusFromServer(message: HouseUpdateContextValue['updates'][0], userId: string): Promise<void> {
    console.log("Attempting to publish...")

    try {
        const res = await data.send(
            new PublishCommand({
                payload: Buffer.from(
                    JSON.stringify(message)
                ),
                topic: `${userId}-house-updates`,
            })
        );
        console.log('Sent message to client successfully.', res)
    } catch (e) {
        console.log('Error sending update to client.', e)
    }
}