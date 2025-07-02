import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "snapsafe_username";

export const saveUsername = async (username: string) => {
  try {
    await AsyncStorage.setItem(USERNAME_KEY, username);
  } catch (e) {
    console.error("Failed to save username.", e);
  }
};

export const getUsername = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USERNAME_KEY);
  } catch (e) {
    console.error("Failed to fetch username.", e);
    return null;
  }
};

export const clearUsername = async () => {
  try {
    await AsyncStorage.removeItem(USERNAME_KEY);
  } catch (e) {
    console.error("Failed to clear username.", e);
  }
};