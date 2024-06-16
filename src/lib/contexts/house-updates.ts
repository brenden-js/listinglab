export interface HouseUpdateContextValue {
    updates: {
        houseId: string;
        messageCategory: 'house-update';
        updateType: 'complete' | 'fail';
        updateCategory: 'basic' | 'investment' | 'neighborhood' | 'recentlySold';
    }[];
    isConnected: boolean;
}