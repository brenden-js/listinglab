"use client"
import React, {createContext, useContext, useEffect, useState} from 'react';
import {iot, mqtt} from 'aws-iot-device-sdk-v2';
import {HouseUpdateContextValue} from "@/lib/contexts/house-updates";
import {useAuth} from "@clerk/nextjs";
import {toast} from "sonner";

// Define the shape of the context value


// Create the context
const HouseUpdateContext = createContext<HouseUpdateContextValue>({
    updates: [],
    isConnected: false,
});

// Create a custom hook to consume the context
export const useHouseUpdateContext = () => useContext(HouseUpdateContext);

// Define the provider component
export const HouseUpdateProvider: React.FC<{
    children: React.ReactNode;
    endpoint: string
    authorizer: string
    topic: string
}> = ({children, authorizer, endpoint, topic}) => {

    const [updates, setUpdates] = useState<HouseUpdateContextValue['updates']>([]);
    const [isConnected, setIsConnected] = useState(false)
    const [connection, setConnection] = useState<mqtt.MqttClientConnection | null>(null);

    // Helper function to create an MQTT connection
    function createConnection(endpoint: string, authorizer: string, token: string) {
        const client = new mqtt.MqttClient();
        const id = window.crypto.randomUUID();

        return client.new_connection(
            iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
                .with_clean_session(true)
                .with_client_id(`client_${id}`)
                .with_endpoint(endpoint)
                .with_custom_authorizer("", authorizer, "", token)
                .build()
        );
    }

    const {getToken} = useAuth();

    useEffect(() => {
        const connectWithToken = async () => {
            try {
                // Get the token from the user
                const token = await getToken();

                if (!token) {
                    console.error('Failed to get user token');
                    toast.error('Failed to connect to server.');
                    return;
                }

                const connection = createConnection(endpoint, authorizer, token);
                connection.on('connect', async () => {
                    try {
                        console.log('Connected to MQTT from realtime-messages');
                        await connection.subscribe('house-updates', mqtt.QoS.AtLeastOnce);
                        setIsConnected(true);
                        setConnection(connection);
                    } catch (e) {
                        console.error('Error connecting to MQTT:', e);
                    }
                });

                connection.on('message', (_fullTopic, payload) => {
                    console.log('Message received... attempting to decode', payload)
                    const message = new TextDecoder('utf8').decode(new Uint8Array(payload));
                    try {
                        const {messageCategory, updateType, updateCategory, houseId} = JSON.parse(message);
                        if (messageCategory === 'house-update') {
                            setUpdates((prevUpdates) => [
                                ...prevUpdates,
                                {messageCategory, updateType, updateCategory, houseId},
                            ]);
                        }
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                connection.on('error', console.error);
                connection.connect();

                // Disconnect from the MQTT broker when the component unmounts
                return () => {
                    connection.disconnect();
                    setIsConnected(false);
                    setConnection(null);
                };
            } catch (error) {
                console.error('Error getting token or connecting:', error);
            }
        };

        connectWithToken();
    }, [endpoint, authorizer, getToken]);

    // Provide the updates and connection state to the context
    const contextValue: HouseUpdateContextValue = {
        updates,
        isConnected,
    };

    return <HouseUpdateContext.Provider value={contextValue}>{children}</HouseUpdateContext.Provider>;
};