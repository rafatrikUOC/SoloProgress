import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async (key, data) => {
    try {
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error("Error saving data:", e); // Log any errors
    }
};

export const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue != null) {
            return JSON.parse(jsonValue);
        } else {
            return null;
        }
    } catch (e) {
        console.error("Error retrieving data:", e); // Log any errors
        return null;
    }
};

export const clearData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error("Error clearing data:", e); // Log any errors
    }
};
