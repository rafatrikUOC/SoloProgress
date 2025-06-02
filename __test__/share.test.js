// Mock the Share API from react-native before importing anything else
jest.mock("react-native", () => ({
  Share: { share: jest.fn() },
}));

import { Share } from "react-native";
import {
  shareContent,
  generateWorkoutShareMessage,
  shareWorkout,
} from "../src/global/utils/share";

describe("Share utils", () => {
  // Reset all mocks after each test to avoid interference
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test that shareContent calls Share.share with correct params
  // Ensures the utility passes the right message and title to the native share dialog
  it("shareContent calls Share.share with correct params", async () => {
    await shareContent({ message: "Hello", title: "Title" });
    expect(Share.share).toHaveBeenCalledWith({ message: "Hello", title: "Title" });
  });

  // Test that generateWorkoutShareMessage returns default if no workout
  // Ensures a friendly default message is returned when no workout is planned
  it("generateWorkoutShareMessage returns default if no workout", () => {
    expect(generateWorkoutShareMessage(null, null)).toMatch(/no planned workout/i);
  });

  // Test that generateWorkoutShareMessage returns formatted string
  // Ensures the generated message contains all relevant workout details
  it("generateWorkoutShareMessage returns formatted string", () => {
    const workout = {
      title: "Push Day",
      details: { duration: 60 },
    };
    const exercises = [{ name: "Bench Press" }, { name: "Push Up" }];
    const msg = generateWorkoutShareMessage(workout, exercises);
    expect(msg).toMatch(/Push Day/);
    expect(msg).toMatch(/60 minutes/);
    expect(msg).toMatch(/Bench Press, Push Up/);
  });

  // Test that shareWorkout triggers Share.share with correct message
  // Ensures integration: shareWorkout generates the message and triggers the share dialog with correct info
  it("shareWorkout triggers Share.share with correct message", async () => {
    const workout = { title: "Pull Day", details: { duration: 45 } };
    const exercises = [{ name: "Row" }];
    await shareWorkout(workout, exercises);
    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("Pull Day"),
        title: "My Next Workout",
      })
    );
  });
});
