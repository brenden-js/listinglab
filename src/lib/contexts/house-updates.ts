export interface HouseUpdateContextValue {
    updates: {
        houseId: string;
        messageCategory: 'house-update' | 'new-house-found';
        updateType: 'complete' | 'fail';
        updateCategory: 'basic' | 'investment' | 'neighborhood' | 'recentlySold';
    }[];
    isConnected: boolean;
}