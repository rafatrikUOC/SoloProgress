import { useEffect, useState, useCallback } from "react";
import { supabase } from "../../../global/services/supabaseService";
import {
  cleanupOldTrainingSessions,
  findOrCreateTrainingSession,
  createTrainingExercisesAndSeries,
  getExistingTrainingExercisesWithSeries
} from "../services/trainingSessionService";

/**
 * Custom hook to manage the lifecycle of a training session and its exercises/series.
 * It fetches planned exercises from the DB if needed (does NOT require exercises as param).
 *
 * @param {Object} user - User object
 * @param {Object} workout - Workout object (should have id or split_id/session_index)
 * @param {any} refreshFlag - Optional flag to force reload
 * @returns {Object}
 */
export default function useTrainingSession({ user, workout, refreshFlag }) {
  const [trainingSessionId, setTrainingSessionId] = useState(null);
  const [trainingExercises, setTrainingExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper: fetch planned exercises from UserPlannedWorkouts
  const fetchPlannedExercises = useCallback(async () => {
    if (!user?.info?.id || !workout?.id) return [];
    const { data, error } = await supabase
      .from("UserPlannedWorkouts")
      .select("exercises")
      .eq("id", workout.id)
      .single();
    if (error) {
      console.error("[useTrainingSession] Error fetching planned exercises:", error);
      return [];
    }
    // Normalize to array of {id}
    return (data?.exercises || []).map(e =>
      typeof e === "object" ? e : { id: e }
    );
  }, [user, workout]);

  // Main session setup
  const setupSession = useCallback(async () => {
    setLoading(true);

    const userId = user?.info?.id;
    const splitId = workout?.split_id ?? workout?.splitId;
    const sessionIndex = workout?.session_index;
    const routineId = workout?.routine_id;
    const sessionId = workout?.session_id;
    const punctualId = workout?.punctual_id;

    // Validation: need at least userId and workout context
    const hasSplit = splitId !== undefined && sessionIndex !== undefined;
    const hasRoutineSession = sessionId !== undefined;
    const hasPunctual = punctualId !== undefined;
    const isFree = !hasSplit && !hasRoutineSession && !hasPunctual;

    if (!userId || !workout || (!hasSplit && !hasRoutineSession && !hasPunctual && !isFree)) {
      setTrainingSessionId(null);
      setTrainingExercises([]);
      setLoading(false);
      return;
    }

    try {
      // Clean up old sessions
      await cleanupOldTrainingSessions({ userId, splitId, sessionIndex, sessionId, punctualId });

      // Find or create the current session
      const { id: sessionIdResult, isNew } = await findOrCreateTrainingSession({
        userId,
        splitId,
        sessionIndex,
        routineId,
        sessionId,
        punctualId,
      });
      setTrainingSessionId(sessionIdResult);

      if (isNew) {
        // Fetch planned exercises from DB
        const plannedExercises = await fetchPlannedExercises();
        // Create new TrainingExercises and ExerciseSeries
        const createdExercises = await createTrainingExercisesAndSeries(sessionIdResult, plannedExercises, user);
        setTrainingExercises(createdExercises || []);
      } else {
        // Fetch existing TrainingExercises and ExerciseSeries
        const existingExercises = await getExistingTrainingExercisesWithSeries(sessionIdResult);
        setTrainingExercises(existingExercises || []);
      }
    } catch (err) {
      setTrainingSessionId(null);
      setTrainingExercises([]);
      console.error("❌ [useTrainingSession] Error during setupSession:", err);
    } finally {
      setLoading(false);
    }
  }, [user, workout, fetchPlannedExercises]);

  // Call setupSession on mount and when dependencies change
  useEffect(() => {
    if (user && workout) {
      setupSession();
    } else {
      setLoading(false);
    }
  }, [user, workout, refreshFlag, setupSession]);

  // Manual refetch function
  const refetch = useCallback(() => {
    setupSession();
  }, [setupSession]);

  return { trainingSessionId, trainingExercises, loading, refetch };
}
