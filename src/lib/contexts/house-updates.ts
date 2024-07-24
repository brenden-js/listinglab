export interface HouseUpdateContextValue {
    updates: {
        houseId: string;
        messageCategory: 'house-update' | 'new-house-found';
        updateType: 'complete' | 'fail' | string;
        updateCategory: 'basic' | 'investment' | 'neighborhood' | 'recentlySold' | string;
    }[];
    isConnected: boolean;
}