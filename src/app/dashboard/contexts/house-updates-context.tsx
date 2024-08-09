"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { iot, mqtt } from 'aws-iot-device-sdk-v2';
import { useSession } from "@clerk/nextjs";
import { toast } from "sonner";
import {ListingScanUpdate, LiveDataFeedUpdate} from "@/inngest/functions/helpers/mqtt";

export interface HouseUpdateContextValue {
    updates: (LiveDataFeedUpdate | ListingScanUpdate)[];
    isConnected: boolean;
}

const HouseUpdateContext = createContext<HouseUpdateContextValue>({
    updates: [] as (LiveDataFeedUpdate | ListingScanUpdate)[],
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
    const {session, isLoaded} = useSession();

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

    useEffect(() => {
        if (!session?.user.id || !isLoaded) {
            return;
        }

        let isMounted = true;

        const setupConnection = () => {
            session.getToken()
                .then(freshToken => {
                    if (!freshToken) {
                        throw new Error('Failed to get fresh token');
                    }
                    return createConnection(freshToken);
                })
                .then(newConnection => {
                    if (!isMounted) return;

                    newConnection.on('connect', () => {
                        if (!isMounted) return;
                        newConnection.subscribe(`${session.user.id}-house-updates`, mqtt.QoS.AtLeastOnce)
                            .then(() => {
                                if (!isMounted) return;
                                setIsConnected(true);
                                setConnection(newConnection);
                                console.log('Connected to MQTT');
                            })
                            .catch(e => {
                                console.error('Error subscribing to topic:', e);
                            });
                    });

                    newConnection.on('disconnect', () => {
                        if (!isMounted) return;
                        console.log('Disconnected from MQTT...');
                        toast.error('Looks like you are AFK, refresh page to get live updates again...');
                        setIsConnected(false);
                    });

                    newConnection.on('error', (error) => {
                        if (!isMounted) return;
                        console.error('Connection error, disconnecting:', error);
                        setIsConnected(false);
                        newConnection.disconnect();
                    });

                    newConnection.on('message', (_fullTopic, payload) => {
                        if (!isMounted) return;
                        const message = new TextDecoder('utf8').decode(new Uint8Array(payload));
                        try {
                            const messageObject = JSON.parse(message) as LiveDataFeedUpdate | ListingScanUpdate;

                            if (messageObject.updateType === 'LiveDataFeedUpdate') {
                                setUpdates((prevUpdates) => [
                                    ...prevUpdates,
                                    messageObject,
                                ]);
                            } else if (messageObject.updateType === 'ListingScanUpdate') {
                                const {houseId, updateType, stAddress} = messageObject;
                                setUpdates((prevUpdates) => [
                                    ...prevUpdates,
                                    messageObject,
                                ]);
                                toast.success(`New listing found: ${stAddress}`, {id: houseId});
                            }

                        } catch (error) {
                            console.error('Error parsing message:', error);
                        }
                    });

                    return newConnection.connect();
                })
                .catch(error => {
                    console.error('Error setting up connection:', error);
                });
        };

        setupConnection();

        return () => {
            isMounted = false;
            if (connection) {
                connection.disconnect();
            }
        };
    }, [session, isLoaded, createConnection]);

    const contextValue: HouseUpdateContextValue = {
        updates,
        isConnected,
    };

    return <HouseUpdateContext.Provider value={contextValue}>{children}</HouseUpdateContext.Provider>;
};