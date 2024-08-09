"use client";

import React, {createContext, useContext, useEffect, useState, useCallback, useRef} from 'react';
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
    const connectionRef = useRef<mqtt.MqttClientConnection | null>(null);
    const {session, isLoaded} = useSession();
    const tokenExpirationRef = useRef<number | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    const scheduleTokenRefresh = useCallback((expirationTime: number) => {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiration = expirationTime - currentTime;
        const refreshTime = Math.max(timeUntilExpiration - 60, 0); // Refresh 1 minute before expiration or immediately if less than 1 minute left

        setTimeout(() => {
            console.log('Token nearing expiration, reconnecting with fresh token...');
            reconnect();
        }, refreshTime * 1000);
    }, []);

    const connectWithRetry = useCallback(async (retryCount = 0, maxRetries = 5) => {
        if (!session?.user.id || !isLoaded) {
            return;
        }

        try {
            const freshToken = await session.getToken();
            if (!freshToken) {
                throw new Error('Failed to get fresh token');
            }

            // Decode the token to get expiration time
            const tokenParts = freshToken.split('.');
            if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.exp) {
                    tokenExpirationRef.current = payload.exp;
                    scheduleTokenRefresh(payload.exp);
                }
            }

            const newConnection = createConnection(freshToken);

            newConnection.on('connect', () => {
                newConnection.subscribe(`${session.user.id}-house-updates`, mqtt.QoS.AtLeastOnce)
                    .then(() => {
                        setIsConnected(true);
                        connectionRef.current = newConnection;
                        console.log('Connected to MQTT');
                    })
                    .catch(e => {
                        console.error('Error subscribing to topic:', e);
                        throw e;
                    });
            });

            newConnection.on('connection_failure', (error) => {
                console.error('Connection failure:', error);
                setIsConnected(false);
                reconnect();
            });

            newConnection.on('disconnect', () => {
                console.log('Disconnected from MQTT...');
                toast.error('Connection lost. Attempting to reconnect...');
                setIsConnected(false);
                reconnect();
            });

            newConnection.on('error', (error) => {
                console.error('Connection error:', error);
                setIsConnected(false);
                newConnection.disconnect();
                reconnect();
            });

            newConnection.on('message', (_fullTopic, payload) => {
                const message = new TextDecoder('utf8').decode(new Uint8Array(payload));
                try {
                    const messageObject = JSON.parse(message) as LiveDataFeedUpdate | ListingScanUpdate;
                    setUpdates((prevUpdates) => [...prevUpdates, messageObject]);
                    if (messageObject.updateType === 'ListingScanUpdate') {
                        toast.success(`New listing found: ${messageObject.stAddress}`, {id: messageObject.houseId});
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            await newConnection.connect();
        } catch (error) {
            console.error('Error setting up connection:', error);
            if (retryCount < maxRetries) {
                const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
                console.log(`Retrying connection in ${delay/1000} seconds...`);
                reconnectTimeoutRef.current = setTimeout(() => connectWithRetry(retryCount + 1, maxRetries), delay);
            } else {
                console.error('Max retries reached. Unable to establish connection.');
                toast.error('Unable to establish connection. Please refresh the page.');
            }
        }
    }, [session, isLoaded, createConnection, scheduleTokenRefresh]);

    const reconnect = useCallback(() => {
        if (connectionRef.current) {
            connectionRef.current.disconnect();
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        connectWithRetry();
    }, [connectWithRetry]);

    useEffect(() => {
        connectWithRetry();

        return () => {
            console.log('Component unmounted, disconnecting connection...');
            if (connectionRef.current) {
                connectionRef.current.disconnect();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connectWithRetry]);

    const contextValue: HouseUpdateContextValue = {
        updates,
        isConnected,
    };

    return <HouseUpdateContext.Provider value={contextValue}>{children}</HouseUpdateContext.Provider>;
};