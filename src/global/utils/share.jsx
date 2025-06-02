import { Share } from "react-native";

// Generalized share function for any content
export async function shareContent({ message, title }) {
    try {
        await Share.share(
            { message, title }
        );
    } catch (error) {
        console.error("Error sharing content:", error);
    }
}

// Generates a share message for a workout
export function generateWorkoutShareMessage(workout, exercises) {
    if (!workout) return "I have no planned workout today!";

    const workoutTitle = workout.title || "Workout";
    const duration = workout.details?.duration || "?";
    const exerciseNames = exercises && exercises.length
        ? exercises.map(e => e.name).join(", ")
        : "No exercises listed";

    return (
        `This is my next workout with SoloProgress!\n\n` +
        `Workout: "${workoutTitle}"\n` +
        `Approximate duration: ${duration} minutes\n` +
        `Exercises: ${exerciseNames}\n\n` +
        `SoloProgress is an upcoming app designed to help you track your fitness journey, plan your workouts, and stay motivated. Stay tuned for more!`
    );
}

// Shares a workout using the system share dialog
export async function shareWorkout(workout, exercises) {
    const message = generateWorkoutShareMessage(workout, exercises);
    await shareContent({ message, title: "My Next Workout" });
}
