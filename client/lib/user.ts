import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = "snapsafe_username";
const DISPLAY_NAME_KEY = "snapsafe_display_name";

/**
 * Saves the username and display name to AsyncStorage.
 * It can handle a null or undefined displayName.
 */
export const saveData = async (
  username: string | null,
  displayName: string | null
) => {
  try {
    const promises = [];
    if (username) {
      promises.push(AsyncStorage.setItem(USERNAME_KEY, username));
    }
    if (displayName) {
      promises.push(AsyncStorage.setItem(DISPLAY_NAME_KEY, displayName));
    }
    await Promise.all(promises);
  } catch (e) {
    console.error("Failed to save user data.", e);
  }
};

/**
 * Retrieves the username (phone number) from AsyncStorage.
 */
export const getUsername = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USERNAME_KEY);
  } catch (e) {
    console.error("Failed to fetch username.", e);
    return null;
  }
};

/**
 * Retrieves the display name from AsyncStorage.
 */
export const getDisplayName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(DISPLAY_NAME_KEY);
  } catch (e) {
    console.error("Failed to fetch display name.", e);
    return null;
  }
};

/**
 * Clears both username and display name from AsyncStorage.
 */
export const clearData = async () => {
  try {
    await AsyncStorage.multiRemove([USERNAME_KEY, DISPLAY_NAME_KEY]);
  } catch (e) {
    console.error("Failed to clear user data.", e);
  }
};
