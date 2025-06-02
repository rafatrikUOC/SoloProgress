import { useState, useEffect } from "react";
import {
  getPlannedWorkouts,
  generateAndStorePlannedWorkouts,
  recalculatePlannedWorkout
} from "../services/plannedWorkoutService";

/**
 * Custom hook to manage planned workouts for the current user and split
 * @param {Object} params - Hook parameters
 * @param {Object} params.user - User object with info and settings
 * @param {Object} params.split - Split object with workouts
 * @param {string} params.gymId - Gym ID to fetch gym data and exercises
 * @returns {Object} Object containing plannedWorkouts, loading state, and recalculateSession function
 */
export default function usePlannedWorkouts({ user, split, gymId }) {
  const [plannedWorkouts, setPlannedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user goal and workout duration from settings
  const userGoal = user?.settings?.fitness_goal || "Build muscle mass";
  const workoutDuration = user?.settings?.app_preferences?.workout_duration || 60; // default 60min

  useEffect(() => {
    async function fetchOrGenerate() {
      setLoading(true);
      setError(null);

      try {
        // Validate required parameters
        if (!user?.info?.id || !split?.id || !gymId) {
          console.error("Missing required parameters: user.info.id, split.id, or gymId");
          setPlannedWorkouts([]);
          setLoading(false);
          return;
        }

        // Try to get existing planned workouts
        let workouts = await getPlannedWorkouts(user.info.id, split.id);

        // If no workouts exist, generate new ones
        if (!workouts || workouts.length === 0) {
          await generateAndStorePlannedWorkouts({
            userId: user.info.id,
            split,
            gymId,
            userGoal,
            workoutDuration
          });
          
          // Fetch the newly generated workouts
          workouts = await getPlannedWorkouts(user.info.id, split.id);
        }

        setPlannedWorkouts(workouts || []);
      } catch (err) {
        console.error("❌ Error in usePlannedWorkouts:", err);
        setError(err.message || "Failed to load planned workouts");
        setPlannedWorkouts([]);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch/generate if all required parameters are available
    if (user?.info?.id && split?.id && gymId) {
      fetchOrGenerate();
    } else {
      setLoading(false);
    }
  }, [user?.info?.id, split?.id, gymId, userGoal, workoutDuration]);

  /**
   * Recalculates a specific workout session
   * @param {number} sessionIndex - Index of the session to recalculate
   * @returns {Promise<void>}
   */
  const recalculateSession = async (sessionIndex) => {
    try {
      setError(null);
      
      await recalculatePlannedWorkout({
        userId: user.info.id,
        split,
        sessionIndex,
        gymId,
        userGoal,
        workoutDuration
      });
      
      // Refresh the planned workouts after recalculation
      const updatedWorkouts = await getPlannedWorkouts(user.info.id, split.id);
      setPlannedWorkouts(updatedWorkouts || []);
      
    } catch (err) {
      console.error("❌ Error recalculating session:", err);
      setError(err.message || "Failed to recalculate session");
    }
  };

  /**
   * Regenerates all planned workouts for the current split
   * @returns {Promise<void>}
   */
  const regenerateAllWorkouts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await generateAndStorePlannedWorkouts({
        userId: user.info.id,
        split,
        gymId,
        userGoal,
        workoutDuration
      });
      
      // Refresh the planned workouts after regeneration
      const updatedWorkouts = await getPlannedWorkouts(user.info.id, split.id);
      setPlannedWorkouts(updatedWorkouts || []);
      
    } catch (err) {
      console.error("❌ Error regenerating workouts:", err);
      setError(err.message || "Failed to regenerate workouts");
    } finally {
      setLoading(false);
    }
  };

  return { 
    plannedWorkouts, 
    loading, 
    error,
    recalculateSession,
    regenerateAllWorkouts
  };
}