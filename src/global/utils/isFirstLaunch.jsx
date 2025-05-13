import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_LAUNCHED = "hasLaunched";

export default async function isFirstLaunch() {
  try {
    const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED);
    if (hasLaunched === null) {
      await AsyncStorage.setItem(HAS_LAUNCHED, "true");
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}
