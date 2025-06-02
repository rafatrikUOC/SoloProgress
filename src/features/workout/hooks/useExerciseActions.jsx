import { useCallback } from "react";
import { supabase } from "../../../global/services/supabaseService";
import { createTrainingExercisesAndSeries } from "../services/trainingSessionService";

/**
 * Hook for contextual actions on a workout exercise.
 * Handles planned (UserPlannedWorkouts) and active (TrainingSessions) workouts.
 * 
 * @param {Object} options
 * @param {string} options.userId - User UUID
 * @param {Object} options.user - User object (for advanced actions)
 * @returns {Object}
 */
export function useExerciseActions({ userId, user }) {
  // Exclude an exercise for the user (performance_data)
  const excludeExercise = useCallback(async (exerciseId) => {
    const { data: settings, error: fetchError } = await supabase
      .from("UserSettings")
      .select("performance_data")
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;

    let perf = settings?.performance_data || {};
    let excluded = Array.isArray(perf.excluded_exercises) ? perf.excluded_exercises : [];
    if (!excluded.includes(exerciseId)) {
      excluded.push(exerciseId);
    }
    perf.excluded_exercises = excluded;

    const { error: updateError } = await supabase
      .from("UserSettings")
      .update({ performance_data: perf })
      .eq("user_id", userId);

    if (updateError) throw updateError;
  }, [userId]);

  /**
   * Replaces an exercise in both UserPlannedWorkouts and TrainingSession,
   * preserving order and integrity.
   */
  const replaceExerciseFull = useCallback(async ({
    plannedWorkoutId,      // UserPlannedWorkouts.id
    trainingSessionId,     // TrainingSessions.id
    oldExerciseId,
    newExerciseId,
  }) => {
    // 1. Update UserPlannedWorkouts.exercises (replace in the same position)
    const { data: planned, error: fetchError } = await supabase
      .from("UserPlannedWorkouts")
      .select("exercises")
      .eq("id", plannedWorkoutId)
      .single();
    if (fetchError) throw fetchError;

    let exercises = Array.isArray(planned.exercises) ? planned.exercises : [];
    const idx = exercises.findIndex(e => (typeof e === "object" ? e.id : e) === oldExerciseId);
    if (idx === -1) throw new Error("Old exercise not found in planned workout");

    exercises[idx] = typeof exercises[idx] === "object"
      ? { ...exercises[idx], id: newExerciseId }
      : newExerciseId;

    const { error: updateError } = await supabase
      .from("UserPlannedWorkouts")
      .update({ exercises })
      .eq("id", plannedWorkoutId);
    if (updateError) throw updateError;

    // 2. Remove old TrainingExercise (and its series)
    const { data: oldTrainingExArr, error: fetchTEError } = await supabase
      .from("TrainingExercises")
      .select("id")
      .eq("training_id", trainingSessionId)
      .eq("exercise_id", oldExerciseId);

    if (fetchTEError) throw fetchTEError;
    if (!oldTrainingExArr || oldTrainingExArr.length === 0)
      throw new Error("Old TrainingExercise not found");

    const oldTrainingExIds = oldTrainingExArr.map(te => te.id);

    // Delete TrainingExercise (ON DELETE CASCADE removes series)
    const { error: delError } = await supabase
      .from("TrainingExercises")
      .delete()
      .in("id", oldTrainingExIds);
    if (delError) throw delError;

    // 3. Add new TrainingExercise and its series
    await createTrainingExercisesAndSeries(
      trainingSessionId,
      [{ id: newExerciseId }],
      user
    );
  }, [user]);

  /**
   * Removes an exercise from both UserPlannedWorkouts and TrainingSession.
   */
  const removeExerciseFull = useCallback(async ({
    plannedWorkoutId,
    trainingSessionId,
    exerciseId,
  }) => {
    // 1. Remove from UserPlannedWorkouts.exercises
    const { data: planned, error: fetchError } = await supabase
      .from("UserPlannedWorkouts")
      .select("exercises")
      .eq("id", plannedWorkoutId)
      .single();
    if (fetchError) throw fetchError;

    let exercises = Array.isArray(planned.exercises) ? planned.exercises : [];
    exercises = exercises.filter(e => (typeof e === "object" ? e.id : e) !== exerciseId);

    const { error: updateError } = await supabase
      .from("UserPlannedWorkouts")
      .update({ exercises })
      .eq("id", plannedWorkoutId);
    if (updateError) throw updateError;

    // 2. Remove TrainingExercise (and its series)
    const { data: oldTrainingExArr, error: fetchTEError } = await supabase
      .from("TrainingExercises")
      .select("id")
      .eq("training_id", trainingSessionId)
      .eq("exercise_id", exerciseId);

    if (fetchTEError) throw fetchTEError;
    if (!oldTrainingExArr || oldTrainingExArr.length === 0)
      throw new Error("TrainingExercise not found");

    const oldTrainingExId = oldTrainingExArr[0].id;

    const { error: delError } = await supabase
      .from("TrainingExercises")
      .delete()
      .eq("id", oldTrainingExId);
    if (delError) throw delError;
  }, []);

  /**
   * Adds an exercise to both UserPlannedWorkouts and TrainingSession,
   * at a specific position (if provided), or at the end.
   */
  const addExerciseFull = useCallback(async ({
    plannedWorkoutId,
    trainingSessionId,
    newExerciseId,
    position = null, // if null, add at the end
  }) => {
    // 1. Add to UserPlannedWorkouts.exercises
    const { data: planned, error: fetchError } = await supabase
      .from("UserPlannedWorkouts")
      .select("exercises")
      .eq("id", plannedWorkoutId)
      .single();
    if (fetchError) throw fetchError;

    let exercises = Array.isArray(planned.exercises) ? planned.exercises : [];
    if (position !== null && position >= 0 && position <= exercises.length) {
      exercises.splice(position, 0, newExerciseId);
    } else {
      exercises.push(newExerciseId);
    }

    const { error: updateError } = await supabase
      .from("UserPlannedWorkouts")
      .update({ exercises })
      .eq("id", plannedWorkoutId);
    if (updateError) throw updateError;

    // 2. Add new TrainingExercise and its series
    await createTrainingExercisesAndSeries(
      trainingSessionId,
      [{ id: newExerciseId }],
      user
    );
  }, [user]);

  return {
    excludeExercise,
    replaceExerciseFull,
    removeExerciseFull,
    addExerciseFull,
  };
}
