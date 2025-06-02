// Mock AsyncStorage before importing anything else
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveData, getData, clearData } from "../src/global/utils/storage";

describe("AsyncStorage utils", () => {
  // Reset all mocks after each test to avoid interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test that saveData stores JSON stringified data
  // Ensures objects are serialized before being saved in AsyncStorage
  it("saveData stores JSON stringified data", async () => {
    await saveData("key", { foo: "bar" });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("key", JSON.stringify({ foo: "bar" }));
  });

  // Test that getData returns parsed object if data exists
  // Ensures the utility parses JSON strings correctly when reading from storage
  it("getData returns parsed object if data exists", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify({ foo: "bar" }));
    const result = await getData("key");
    expect(result).toEqual({ foo: "bar" });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("key");
  });

  // Test that getData returns null if no data exists
  // Ensures the function returns null when the key is not found in storage
  it("getData returns null if no data exists", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await getData("key");
    expect(result).toBeNull();
  });

  // Test that clearData removes the item
  // Ensures the correct key is passed to AsyncStorage.removeItem
  it("clearData removes the item", async () => {
    await clearData("key");
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("key");
  });

  // Test that getData returns raw string if JSON.parse fails
  // Ensures the function handles corrupted or non-JSON data gracefully
  it("getData returns raw string if JSON.parse fails", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("notjson");
    const result = await getData("key");
    expect(result).toBe("notjson");
  });
});
