"use client"
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { iot, mqtt } from 'aws-iot-device-sdk-v2';
import { HouseUpdateContextValue } from "@/lib/contexts/house-updates";
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";

const HouseUpdateContext = createContext<HouseUpdateContextValue>({
    updates: [],
    isConnected: false,
});

export const useHouseUpdateContext = () => useContext(HouseUpdateContext);

export const HouseUpdateProvider: React.FC<{
    children: React.ReactNode;
    endpoint: string
    authorizer: string
    topic: string
}> = ({children, authorizer, endpoint, topic}) => {
    const [updates, setUpdates] = useState<HouseUpdateContextValue['updates']>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [connection, setConnection] = useState<mqtt.MqttClientConnection | null>(null);
    const { session} = useSession();

    const createConnection = useCallback((token: string) => {
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
    }, [endpoint, authorizer]);

    const connectWithFreshToken = useCallback(async () => {
        if (!session?.user.id) {
            console.error('No session or userId available');
            return;
        }

        try {
            const freshToken = await session.getToken();
            if (!freshToken) {
                console.error('Failed to get fresh token');
                return;
            }

            if (connection) {
                await connection.disconnect();
            }

            const newConnection = createConnection(freshToken);

            newConnection.on('connect', async () => {
                try {
                    await newConnection.subscribe(`${session.user.id}-house-updates`, mqtt.QoS.AtLeastOnce);
                    setIsConnected(true);
                    setConnection(newConnection);
                    console.log('Connected to MQTT');
                } catch (e) {
                    console.error('Error subscribing to topic:', e);
                }
            });

            newConnection.on('disconnect', () => {
                console.log('Disconnected, attempting to reconnect...');
                setIsConnected(false);
                connectWithFreshToken();
            });

            newConnection.on('error', (error) => {
                console.error('Connection error:', error);
                if (error.toString().includes('expired')) {
                    console.log('Token expired, reconnecting with fresh token...');
                    connectWithFreshToken();
                }
            });

            newConnection.on('message', (_fullTopic, payload) => {
                const message = new TextDecoder('utf8').decode(new Uint8Array(payload));
                try {
                    const { messageCategory, updateType, updateCategory, houseId } = JSON.parse(message);
                    if (messageCategory === 'house-update' || messageCategory === 'new-house-found') {
                        setUpdates((prevUpdates) => [
                            ...prevUpdates,
                            { messageCategory, updateType, updateCategory, houseId },
                        ]);
                        if (messageCategory === 'new-house-found') {
                            toast.success(`New listing found: ${updateType}, ${updateCategory}`, { id: houseId });
                        }
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            newConnection.connect();
        } catch (error) {
            console.error('Error connecting:', error);
        }
    }, [session, createConnection]);

    useEffect(() => {
        connectWithFreshToken();

        return () => {
            if (connection) {
                connection.disconnect();
            }
        };
    }, [connectWithFreshToken]);

    const contextValue: HouseUpdateContextValue = {
        updates,
        isConnected,
    };

    return <HouseUpdateContext.Provider value={contextValue}>{children}</HouseUpdateContext.Provider>;
};