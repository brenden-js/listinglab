"use client"
import React, {createContext, useState, useEffect, useContext} from 'react';
import {iot, mqtt} from 'aws-iot-device-sdk-v2';

// Define the shape of the context value
interface HouseUpdateContextValue {
    updates: {
        houseId: string; // Add this line
        messageCategory: 'house-update';
        updateType: 'complete' | 'fail';
        updateCategory: 'basic' | 'investment' | 'neighborhood';
    }[];
    isConnected: boolean;
}

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
    endpoint: string;
    authorizer: string;
}> = ({children, endpoint, authorizer}) => {
    const [updates, setUpdates] = useState<HouseUpdateContextValue['updates']>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connection, setConnection] = useState<mqtt.MqttClientConnection | null>(null);

    // Helper function to create an MQTT connection
    const createConnection = () => {
        const client = new mqtt.MqttClient();
        const id = window.crypto.randomUUID();
        return client.new_connection(
            iot.AwsIotMqttConnectionConfigBuilder.new_with_websockets()
                .with_clean_session(true)
                .with_client_id(`client_${id}`)
                .with_endpoint(endpoint)
                .with_custom_authorizer('', authorizer, '', 'PLACEHOLDER_TOKEN')
                .build()
        );
    };

    // Connect to the MQTT broker
    useEffect(() => {
        const connection = createConnection();
        connection.on('connect', async () => {
            try {
                console.log('Connected to MQTT');
                await connection.subscribe('house-update', mqtt.QoS.AtLeastOnce);
                setIsConnected(true);
                setConnection(connection);
            } catch (e) {
                console.error('Error connecting to MQTT:', e);
            }
        });

        connection.on('message', (_fullTopic, payload) => {
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
    }, [endpoint, authorizer]);

    // Provide the updates and connection state to the context
    const contextValue: HouseUpdateContextValue = {
        updates,
        isConnected,
    };

    return <HouseUpdateContext.Provider value={contextValue}>{children}</HouseUpdateContext.Provider>;
};