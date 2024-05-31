import { Resource } from 'sst';
import {iot, mqtt} from "aws-iot-device-sdk-v2";
import { v4 as uuidv4 } from 'uuid';

const endpoint = Resource.MyRealtime.endpoint;
const authorizer = Resource.MyRealtime.authorizer;
const topic = `${Resource.App.name}/${Resource.App.stage}`;

export interface StatusMessageData {
    type: 'basic' | 'neighborhood' | 'investment';
    status: 'loading' | 'complete' | 'not_found';
}

function createConnection(endpoint: string, authorizer: string): mqtt.MqttClientConnection {
  const client = new mqtt.MqttClient();
  const id = uuidv4(); // Using the 'uuid' package to generate a unique client ID

  return client.new_connection(
    iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
      .with_clean_session(true)
      .with_client_id(`client_${id}`)
      .with_endpoint(endpoint)
      .with_custom_authorizer("", authorizer, "", "PLACEHOLDER_TOKEN")
      .build()
  );
}

export async function publishStatusFromServer(message: StatusMessageData): Promise<void> {
  const connection = createConnection(endpoint, authorizer);
  try {
    await connection.connect();
    const stringMessage = JSON.stringify(message)
    await connection.publish('house-updates', stringMessage, mqtt.QoS.AtLeastOnce);
    console.log(`Message published: ${stringMessage}`);
  } catch (error) {
    console.error('Error publishing message:', error);
  } finally {
    await connection.disconnect();
  }
}