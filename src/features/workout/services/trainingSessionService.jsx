import { supabase } from "../../../global/services/supabaseService";

// Configuration by user goal and exercise type (compound/isolation)
const GOAL_CONFIG = {
  strength: {
    compound: { reps: [3, 5], weightPct: 0.85, sets: 4 },
    isolation: { reps: [5, 8], weightPct: 0.75, sets: 3 }
  },
  hypertrophy: {
    compound: { reps: [6, 10], weightPct: 0.75, sets: 3 },
    isolation: { reps: [8, 15], weightPct: 0.65, sets: 3 }
  },
  endurance: {
    compound: { reps: [12, 20], weightPct: 0.55, sets: 3 },
    isolation: { reps: [15, 25], weightPct: 0.45, sets: 3 }
  },
  fatloss: {
    compound: { reps: [10, 15], weightPct: 0.65, sets: 3 },
    isolation: { reps: [12, 20], weightPct: 0.55, sets: 3 }
  },
  fitness: {
    compound: { reps: [8, 12], weightPct: 0.70, sets: 3 },
    isolation: { reps: [10, 15], weightPct: 0.60, sets: 3 }
  }
};

/**
 * Returns the internal goal key for a given user goal string.
 */
function getGoalKey(goal) {
  if (!goal) return "fitness";
  const map = {
    "Improve strength": "strength",
    "Build muscle mass": "hypertrophy",
    "Enhance endurance": "endurance",
    "Lose fat": "fatloss",
    "General fitness": "fitness"
  };
  return map[goal] || "fitness";
}

/**
 * Returns a sensible default starting weight for an exercise,
 * considering the equipment type and whether it is compound or isolation.
 */
function getDefaultWeight(exercise) {
  const eq = (exercise.equipment_required || []).map(e => e.toLowerCase());
  if (eq.includes("barbell")) return 20;
  if (eq.some(e => e.includes("dumbbell"))) return 2.5;
  if (eq.includes("machine")) return 10;
  if (exercise.compound) return 20;
  return 10;
}

/**
 * Retrieves the last ExerciseSeries performed by the user for a given exercise.
 */
async function getLastSeriesForUserExercise(userId, exerciseId) {
  try {
    // 1. Fetch all session IDs for this user
    const { data: sessionData, error: sessionError } = await supabase
      .from("TrainingSessions")
      .select("id")
      .eq("user_id", userId);

    if (sessionError) {
      console.error("[getLastSeriesForUserExercise] TrainingSessions error:", sessionError);
      return null;
    }

    const sessionIds = (sessionData || []).map(s => s.id);
    if (!sessionIds.length) {
      console.log("[getLastSeriesForUserExercise] No sessions found for user");
      return null;
    }

    // 2. Fetch the latest TrainingExercise for this user and exercise
    const { data: teData, error: teError } = await supabase
      .from("TrainingExercises")
      .select("id")
      .eq("exercise_id", exerciseId)
      .in("training_id", sessionIds)
      .order("timestamp", { ascending: false })
      .limit(1);

    if (teError) {
      console.error("[getLastSeriesForUserExercise] TrainingExercises error:", teError);
      return null;
    }
    if (!teData || teData.length === 0) {
      console.log("[getLastSeriesForUserExercise] No previous TrainingExercise found");
      return null;
    }

    const trainingExerciseId = teData[0].id;

    // 3. Fetch all series for this TrainingExercise
    const { data: series, error: seriesError } = await supabase
      .from("ExerciseSeries")
      .select("*")
      .eq("training_exercise_id", trainingExerciseId)
      .order("order", { ascending: true });

    if (seriesError) {
      console.error("[getLastSeriesForUserExercise] ExerciseSeries error:", seriesError);
      return null;
    }
    if (!series) {
      console.log("[getLastSeriesForUserExercise] No series found");
      return null;
    }
    return series;
  } catch (err) {
    console.error("[getLastSeriesForUserExercise] Exception:", err);
    return null;
  }
}

/**
 * Creates one or more TrainingExercises for a session, and generates their ExerciseSeries
 * (sets) based on the user's goal, exercise type, and equipment.
 * Returns each TrainingExercise with a .series property (array of series).
 *
 * @param {number} trainingSessionId - The ID of the active session (TrainingSessions.id)
 * @param {Array} exercises - Array of exercise objects (must have at least .id and .compound)
 * @param {Object} user - User object (should have user.settings.fitness_goal and user.info.id)
 * @returns {Promise<Array>} Array of TrainingExercise objects with .series
 */
export async function createTrainingExercisesAndSeries(trainingSessionId, exercises, user) {
  const userGoal = user?.settings?.fitness_goal;
  const goalKey = getGoalKey(userGoal);

  if (!Array.isArray(exercises)) {
    console.error("[createTrainingExercisesAndSeries] ERROR: exercises is not an array!", exercises);
    return [];
  }

  // 1. Insert new TrainingExercises
  const exercisesToInsert = exercises.map(ex => ({
    training_id: trainingSessionId,
    exercise_id: ex.id,
  }));

  const { data: insertedExercises, error } = await supabase
    .from("TrainingExercises")
    .insert(exercisesToInsert)
    .select();

  if (error) {
    console.error("[createTrainingExercisesAndSeries] Insert error:", error);
    throw error;
  }

  if (!Array.isArray(insertedExercises)) {
    console.error("[createTrainingExercisesAndSeries] ERROR: insertedExercises is not an array!", insertedExercises);
    return [];
  }

  // 2. For each TrainingExercise, create its series and attach them
  const trainingExercisesWithSeries = [];
  for (const trainingEx of insertedExercises) {
    // Find the original exercise object for type/compound info
    const exercise = exercises.find(e => e.id === trainingEx.exercise_id);
    const isCompound = exercise.compound ? "compound" : "isolation";
    const config = GOAL_CONFIG[goalKey][isCompound];

    // Get the last series for this user and exercise (for progression)
    const lastSeries = await getLastSeriesForUserExercise(user.info.id, trainingEx.exercise_id);

    // 3. Generate the series (no warmup in this example)
    for (let i = 0; i < config.sets; i++) {
      let reps, weight, time_seconds = null, distance = null;

      if (lastSeries && lastSeries[i]) {
        reps = lastSeries[i].reps ? lastSeries[i].reps + 1 : config.reps[0];
        weight = lastSeries[i].weight
          ? Math.round(lastSeries[i].weight * 1.025 * 2) / 2
          : Math.round(getDefaultWeight(exercise) * config.weightPct * 2) / 2;
      } else {
        reps = config.reps[0] + Math.floor(Math.random() * (config.reps[1] - config.reps[0] + 1));
        weight = Math.round(getDefaultWeight(exercise) * config.weightPct * 2) / 2;
      }

      await supabase.from("ExerciseSeries").insert([{
        training_exercise_id: trainingEx.id,
        order: i + 1,
        is_warmup: false,
        reps,
        weight,
        time_seconds,
        distance,
      }]);
    }

    // 4. Fetch all series for this TrainingExercise and attach to the object
    const { data: series, error: seriesError } = await supabase
      .from("ExerciseSeries")
      .select("*")
      .eq("training_exercise_id", trainingEx.id)
      .order("order", { ascending: true });

    if (seriesError) {
      console.error("[createTrainingExercisesAndSeries] Could not fetch series for trainingEx:", trainingEx.id, seriesError);
      trainingExercisesWithSeries.push({ ...trainingEx, series: [] });
    } else {
      trainingExercisesWithSeries.push({ ...trainingEx, series: series || [] });
    }
  }

  return trainingExercisesWithSeries;
}

/**
 * Updates the start_time when the user presses "Start workout".
 */
export async function startTrainingSession(trainingSessionId) {
  const { error } = await supabase
    .from("TrainingSessions")
    .update({ start_time: new Date().toISOString() })
    .eq("id", trainingSessionId);
  if (error) throw error;
}

/**
 * Cleans up all unfinished training sessions for the user that do not match the current context.
 * Only keeps the session that matches the current split/session/sessionId/punctualId context.
 */
export async function cleanupOldTrainingSessions({ userId, splitId, sessionIndex, sessionId, punctualId }) {
  const { data: allSessions } = await supabase
    .from("TrainingSessions")
    .select("id, split_id, session_index, session_id, punctual_id, user_id, end_time")
    .eq("user_id", userId)
    .is("end_time", null);

  const sessionsToDelete = (allSessions || []).filter(s => {
    // Split-based
    if (splitId !== undefined && sessionIndex !== undefined) {
      return s.user_id === userId && (s.split_id !== splitId || s.session_index !== sessionIndex);
    }
    // Routine-based
    if (sessionId !== undefined) {
      return s.user_id === userId && s.session_id !== sessionId;
    }
    // Punctual-based
    if (punctualId !== undefined) {
      return s.user_id === userId && s.punctual_id !== punctualId;
    }
    // Free session: delete all unfinished except those with no split/session/sessionId/punctualId
    return s.user_id === userId && (s.split_id !== null || s.session_index !== null || s.session_id !== null || s.punctual_id !== null);
  });

  if (sessionsToDelete.length > 0) {
    const idsToDelete = sessionsToDelete.map(s => s.id);
    await supabase
      .from("TrainingSessions")
      .delete()
      .in("id", idsToDelete);
  }
}

/**
 * Finds or creates the current training session for any context (split, routine, punctual, or free).
 */
export async function findOrCreateTrainingSession({ userId, splitId, sessionIndex, sessionId, punctualId, routineId }) {
  let query = supabase
    .from("TrainingSessions")
    .select("*")
    .eq("user_id", userId)
    .is("end_time", null);

  // Add context filters
  if (splitId !== undefined && sessionIndex !== undefined) {
    query = query.eq("split_id", splitId).eq("session_index", sessionIndex);
  } else if (sessionId !== undefined) {
    query = query.eq("session_id", sessionId);
  } else if (punctualId !== undefined) {
    query = query.eq("punctual_id", punctualId);
  } else {
    // Free session: no extra filter
    query = query
      .is("split_id", null)
      .is("session_index", null)
      .is("session_id", null)
      .is("punctual_id", null);
  }

  const { data: existing } = await query;

  if (existing && existing.length > 0) {
    return { id: existing[0].id, isNew: false };
  }

  // Prepare insert object
  const insertObj = {
    user_id: userId,
    routine_id: routineId !== undefined ? routineId : null,
    split_id: splitId !== undefined ? splitId : null,
    session_index: sessionIndex !== undefined ? sessionIndex : null,
    session_id: sessionId !== undefined ? sessionId : null,
    punctual_id: punctualId !== undefined ? punctualId : null,
  };

  const { data: newSession, error } = await supabase
    .from("TrainingSessions")
    .insert([insertObj])
    .select()
    .single();

  if (error) throw error;
  return { id: newSession.id, isNew: true };
}

/**
 * Fetches existing TrainingExercises and their ExerciseSeries for a session.
 */
export async function getExistingTrainingExercisesWithSeries(trainingSessionId) {
  // Get TrainingExercises
  const { data: exercises, error: exercisesError } = await supabase
    .from("TrainingExercises")
    .select("*")
    .eq("training_id", trainingSessionId);

  if (exercisesError || !exercises) return [];

  // Get ExerciseSeries for each TrainingExercise
  const exercisesWithSeries = await Promise.all(
    exercises.map(async (ex) => {
      const { data: series, error: seriesError } = await supabase
        .from("ExerciseSeries")
        .select("*")
        .eq("training_exercise_id", ex.id)
        .order("order", { ascending: true });

      return { ...ex, series: series || [] };
    })
  );

  return exercisesWithSeries;
}

// Fetches the skipped_sessions array from the user's performance_data
export async function getSkippedSessions(userId) {
  const { data, error } = await supabase
    .from("UserSettings")
    .select("performance_data")
    .eq("user_id", userId)
    .single();

  if (error) throw error;
  return data?.performance_data?.skipped_sessions || [];
}

// Adds or updates a skip for a split or routine in the user's performance_data. Only the most recent skip per context is kept
export async function setSkippedSession(userId, { split, routine, session }) {
  // Fetch current performance_data
  const { data, error } = await supabase
    .from("UserSettings")
    .select("performance_data")
    .eq("user_id", userId)
    .single();

  if (error) throw error;

  let perf = data?.performance_data || {};
  let skipped = perf.skipped_sessions || [];

  // Remove any existing skip for this context (split or routine)
  skipped = skipped.filter(s =>
    (split && s.split !== undefined && s.split !== split) ||
    (routine && s.routine !== undefined && s.routine !== routine)
  );

  // Add the new skip with timestamp
  const skipObj = split
    ? { split, session, skipped_at: new Date().toISOString() }
    : { routine, session, skipped_at: new Date().toISOString() };
  skipped.push(skipObj);

  perf.skipped_sessions = skipped;

  // Update performance_data in UserSettings
  const { error: updateError } = await supabase
    .from("UserSettings")
    .update({ performance_data: perf })
    .eq("user_id", userId);

  if (updateError) throw updateError;
  return skipped;
}

// Returns the most recent skipped session for a given split
export function getLastSkippedSession(skippedSessions, splitId) {
  if (!Array.isArray(skippedSessions)) return null;
  const filtered = skippedSessions
    .filter(s => s.split === splitId && s.skipped_at)
    .sort((a, b) => new Date(b.skipped_at) - new Date(a.skipped_at));
  return filtered[0] || null;
}

// Determines the next planned workout for the user, considering both completed and skipped sessions
export async function getNextWorkoutForUser(user) {
  // Determine split ID from user settings
  const splitId =
    user?.settings?.selected_routine ||
    user?.split?.id ||
    user?.settings?.performance_data?.selected_routine;
  if (!splitId || !user?.info?.id) {
    return null;
  }

  // 1. Fetch all planned workouts for this user and split
  const { data: plannedWorkouts } = await supabase
    .from("UserPlannedWorkouts")
    .select("*")
    .eq("user_id", user.info.id)
    .eq("split_id", splitId)
    .order("session_index", { ascending: true });

  if (!plannedWorkouts || plannedWorkouts.length === 0) {
    return null;
  }

  // 2. Fetch the last completed session for this user and split
  const { data: lastSession } = await supabase
    .from("TrainingSessions")
    .select("session_index, end_time")
    .eq("user_id", user.info.id)
    .eq("split_id", splitId)
    .not("end_time", "is", null)
    .order("end_time", { ascending: false })
    .limit(1)
    .single();

  // 3. Get skipped_sessions from performance_data
  const skippedSessions = user?.settings?.performance_data?.skipped_sessions || [];
  const lastSkipped = getLastSkippedSession(skippedSessions, splitId);

  // 4. Decide which is more recent: last completed or last skipped
  let nextSessionIndex = 0;
  let lastEnd = lastSession?.end_time ? new Date(lastSession.end_time) : null;
  let lastSkip = lastSkipped?.skipped_at ? new Date(lastSkipped.skipped_at) : null;

  if (lastEnd && (!lastSkip || lastEnd > lastSkip)) {
    // Last completed session is more recent
    nextSessionIndex = (typeof lastSession.session_index === "number")
      ? lastSession.session_index + 1
      : 0;
  } else if (lastSkip) {
    // Last skipped session is more recent
    nextSessionIndex = (typeof lastSkipped.session === "number")
      ? lastSkipped.session + 1
      : 0;
  }

  // If all sessions have been completed/skipped, start again from the first
  if (!plannedWorkouts.some(w => w.session_index === nextSessionIndex)) {
    nextSessionIndex = 0;
  }

  // Find the next planned workout
  const next = plannedWorkouts.find(
    (w) => w.session_index === nextSessionIndex
  );

  return next || null;
}

// TODO: Check if still needed after creating createTrainingExercisesAndSeries
// Replaces the exercise in a TrainingExercise and regenerates its series
export async function replaceExerciseAndRegenerateSeries({ trainingExerciseId, newExerciseId, user }) {
  // 1. Update the exercise_id
  const { error: updateError } = await supabase
    .from("TrainingExercises")
    .update({ exercise_id: newExerciseId })
    .eq("id", trainingExerciseId);

  if (updateError) throw updateError;

  // 2. Delete old series
  await supabase
    .from("ExerciseSeries")
    .delete()
    .eq("training_exercise_id", trainingExerciseId);

  // 3. Fetch the new exercise object
  const { data: exercise, error: exError } = await supabase
    .from("Exercises")
    .select("*")
    .eq("id", newExerciseId)
    .single();

  if (exError || !exercise) throw exError || new Error("Exercise not found");

  // 4. Use your existing logic to generate sets/reps (extract from createTrainingExercisesAndSeries)
  const userGoal = user?.settings?.fitness_goal;
  const goalKey = getGoalKey(userGoal);
  const isCompound = exercise.compound ? "compound" : "isolation";
  const config = GOAL_CONFIG[goalKey][isCompound];

  const lastSeries = await getLastSeriesForUserExercise(user.info.id, newExerciseId);

  for (let i = 0; i < config.sets; i++) {
    let reps, weight, time_seconds = null, distance = null;

    if (lastSeries && lastSeries[i]) {
      reps = lastSeries[i].reps ? lastSeries[i].reps + 1 : config.reps[0];
      weight = lastSeries[i].weight
        ? Math.round(lastSeries[i].weight * 1.025 * 2) / 2
        : Math.round(getDefaultWeight(exercise) * config.weightPct * 2) / 2;
    } else {
      reps = config.reps[0] + Math.floor(Math.random() * (config.reps[1] - config.reps[0] + 1));
      weight = Math.round(getDefaultWeight(exercise) * config.weightPct * 2) / 2;
    }

    await supabase.from("ExerciseSeries").insert([{
      training_exercise_id: trainingExerciseId,
      order: i + 1,
      is_warmup: false,
      reps,
      weight,
      time_seconds,
      distance,
    }]);
  }
}

// TODO: Check if still needed after creating createTrainingExercisesAndSeries
// Replaces an exercise in both the planned workout and the active session. Handles DB updates and regeneration of series
export async function replaceExerciseEverywhere({
  plannedWorkoutId,      
  trainingExerciseId,    
  oldExerciseId,
  newExerciseId,
  user,
  dontRecommend = false,
}) {
  // 1. Exclude exercise if needed
  if (dontRecommend) {
    // ... tu lógica para excluir el ejercicio ...
  }

  // 2. Update UserPlannedWorkouts
  if (plannedWorkoutId) {
    const { data, error: fetchError } = await supabase
      .from("UserPlannedWorkouts")
      .select("exercises")
      .eq("id", plannedWorkoutId)
      .single();
    if (fetchError) throw fetchError;

    let exercises = Array.isArray(data.exercises) ? data.exercises : [];
    exercises = exercises.map(e =>
      (typeof e === "object" ? e.id : e) === oldExerciseId
        ? (typeof e === "object" ? { ...e, id: newExerciseId } : newExerciseId)
        : e
    );

    const { error: updateError } = await supabase
      .from("UserPlannedWorkouts")
      .update({ exercises })
      .eq("id", plannedWorkoutId);
    if (updateError) throw updateError;
  }

  // 3. Update TrainingExercises and regenerate series
  if (trainingExerciseId) {
    await replaceExerciseAndRegenerateSeries({
      trainingExerciseId,
      newExerciseId,
      user,
    });
  }
}

