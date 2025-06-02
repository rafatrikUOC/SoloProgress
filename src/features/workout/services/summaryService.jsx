import { supabase } from "../../../global/services/supabaseService";

/**
 * Generates and saves the workout session summary in TrainingSessions.
 * Returns the summary object for UI.
 */
export async function loadSummary(trainingSessionId) {
  // 1. Get the session to fetch start_time
  const { data: session, error: sessionError } = await supabase
    .from("TrainingSessions")
    .select("start_time")
    .eq("id", trainingSessionId)
    .single();

  if (sessionError) throw sessionError;
  if (!session || !session.start_time) throw new Error("Session start_time not found");

  // 2. Get all TrainingExercises for the session
  const { data: trainingExercises, error: teError } = await supabase
    .from("TrainingExercises")
    .select("id, exercise_id, volume, one_rep_max")
    .eq("training_id", trainingSessionId);

  if (teError) throw teError;
  if (!trainingExercises || trainingExercises.length === 0) return null;

  // 3. Get all ExerciseSeries for these TrainingExercises
  const trainingExerciseIds = trainingExercises.map(te => te.id);
  const { data: allSeries, error: seError } = await supabase
    .from("ExerciseSeries")
    .select("*")
    .in("training_exercise_id", trainingExerciseIds);

  if (seError) throw seError;

  // 4. Get all unique Exercises used
  const exerciseIds = trainingExercises.map(te => te.exercise_id);
  const { data: exercises, error: exError } = await supabase
    .from("Exercises")
    .select("id, name, primary_muscle, secondary_muscles")
    .in("id", exerciseIds);

  if (exError) throw exError;

  // 5. Calculate summary stats
  let totalSets = 0;
  let totalReps = 0;
  let totalVolume = 0;
  let max1RM = {};
  let musclesWorkedSet = new Set();

  // Map exerciseId to exercise info for quick lookup
  const exerciseMap = {};
  exercises.forEach(ex => { exerciseMap[ex.id] = ex; });

  // For each completed series
  allSeries.filter(s => s.timestamp).forEach(s => {
    totalSets += 1;
    totalReps += s.reps || 0;
    totalVolume += (s.reps || 0) * (s.weight || 0);

    // Find exercise for this series
    const te = trainingExercises.find(te => te.id === s.training_exercise_id);
    if (te) {
      // 1RM
      if (s.record && s.record.oneRM) {
        if (!max1RM[te.exercise_id] || s.record.oneRM > max1RM[te.exercise_id]) {
          max1RM[te.exercise_id] = s.record.oneRM;
        }
      }
      // Muscles worked
      const ex = exerciseMap[te.exercise_id];
      if (ex) {
        if (ex.primary_muscle) musclesWorkedSet.add(ex.primary_muscle);
        if (Array.isArray(ex.secondary_muscles)) {
          ex.secondary_muscles.forEach(m => musclesWorkedSet.add(m));
        } else if (ex.secondary_muscles) {
          musclesWorkedSet.add(ex.secondary_muscles);
        }
      }
    }
  });

  // 6. Estimate calories burned (simple: 6 cal/min * duration)
  const now = new Date();
  const durationSec = (now - new Date(session.start_time)) / 1000;
  const caloriesBurned = Math.round((durationSec / 60) * 6);

  // 7. Save summary in TrainingSessions
  await supabase
    .from("TrainingSessions")
    .update({
      end_time: now.toISOString(),
      volume: totalVolume,
      calories_burned: caloriesBurned,
      muscles_worked: Array.from(musclesWorkedSet).join(","),
      performance_data: {
        totalSets,
        totalReps,
        max1RM,
        durationSec,
        exerciseNames: Object.fromEntries(
          Object.entries(max1RM).map(([id, _]) => [id, exerciseMap[id]?.name || `Exercise ${id}`])
        ),
      }
    })
    .eq("id", trainingSessionId);

  // 8. Return summary object for UI
  return {
    totalSets,
    totalReps,
    totalVolume,
    max1RM,
    caloriesBurned,
    musclesWorked: Array.from(musclesWorkedSet),
    durationSec,
    exerciseNames: Object.fromEntries(
      Object.entries(max1RM).map(([id, _]) => [id, exerciseMap[id]?.name || `Exercise ${id}`])
    )
  };
}
