import { supabase } from "../../../global/services/supabaseService";
import { fetchExercises } from "../../exercises/services/exerciseService";
import { fetchGymById } from "../services/gymService";

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

/**
 * Muscle priority matrix for different training goals
 * Higher values = higher priority for that goal
 */
const MUSCLE_PRIORITY = {
  abs: { strength: 3, hypertrophy: 3, fatloss: 5, endurance: 5, fitness: 5 },
  back: { strength: 5, hypertrophy: 5, fatloss: 2, endurance: 4, fitness: 3 },
  biceps: { strength: 3, hypertrophy: 4, fatloss: 1, endurance: 2, fitness: 2 },
  calves: { strength: 3, hypertrophy: 2, fatloss: 4, endurance: 4, fitness: 5 },
  chest: { strength: 5, hypertrophy: 5, fatloss: 2, endurance: 3, fitness: 2 },
  forearms: { strength: 2, hypertrophy: 3, fatloss: 1, endurance: 2, fitness: 2 },
  hamstrings: { strength: 3, hypertrophy: 2, fatloss: 4, endurance: 3, fitness: 3 },
  hips: { strength: 2, hypertrophy: 2, fatloss: 2, endurance: 3, fitness: 4 },
  neck: { strength: 1, hypertrophy: 1, fatloss: 1, endurance: 1, fitness: 1 },
  quadriceps: { strength: 4, hypertrophy: 4, fatloss: 4, endurance: 3, fitness: 3 },
  shoulders: { strength: 4, hypertrophy: 4, fatloss: 2, endurance: 2, fitness: 3 },
  thighs: { strength: 3, hypertrophy: 3, fatloss: 3, endurance: 3, fitness: 3 },
  triceps: { strength: 4, hypertrophy: 5, fatloss: 2, endurance: 3, fitness: 2 },
};

/**
 * Mapping from user-friendly goal labels to priority keys
 */
const GOAL_TO_PRIORITY_KEY = {
  "Lose fat": "fatloss",
  "Build muscle mass": "hypertrophy",
  "Improve strength": "strength",
  "Enhance endurance": "endurance",
  "General fitness": "fitness"
};

/**
 * Default timing constants for exercise duration estimation
 */
const TIMING_CONSTANTS = {
  COMPOUND_TIME_PER_SET: 2,      // minutes (assume 9s per rep * 12 reps, rounded   to 2mins)
  ISOLATION_TIME_PER_SET: 1,     // minutes (assume 4s per rep * 12 reps, rounded to 1 min)
  COMPOUND_REST_TIME: 2.5,         // minutes
  ISOLATION_REST_TIME: 1.5,        // minutes
  DEFAULT_SETS: 3
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Estimates the duration of an exercise based on its type and set count
 * @param {Object} exercise - Exercise object with compound property
 * @param {number} sets - Number of sets (default: 3)
 * @returns {number} Estimated duration in minutes
 */
function estimateExerciseDuration(exercise, sets = TIMING_CONSTANTS.DEFAULT_SETS) {
  const isCompound = exercise.compound;
  const timePerSet = isCompound ? TIMING_CONSTANTS.COMPOUND_TIME_PER_SET : TIMING_CONSTANTS.ISOLATION_TIME_PER_SET;
  const restTime = isCompound ? TIMING_CONSTANTS.COMPOUND_REST_TIME : TIMING_CONSTANTS.ISOLATION_REST_TIME;

  return sets * timePerSet + (sets - 1) * restTime;
}

/**
 * Normalizes muscle names for consistent comparison
 * @param {string[]} muscles - Array of muscle names
 * @returns {string[]} Normalized muscle names
 */
function normalizeMuscleNames(muscles) {
  return muscles.map(muscle => muscle.toLowerCase().trim());
}

  /**
   * Calculates muscle priorities and proportions based on goal
   * @param {string[]} targetMuscles - Target muscle groups
   * @param {string} priorityType - Goal-based priority type
   * @returns {Object} Object containing priorities and proportions
   */
  function calculateMusclePriorities(targetMuscles, priorityType) {
    const priorities = targetMuscles.map(muscle =>
      MUSCLE_PRIORITY[muscle]?.[priorityType] || 1
    );

    const totalPriority = priorities.reduce((sum, priority) => sum + priority, 0);
    const proportions = priorities.map(priority => priority / totalPriority);

    return { priorities, proportions, totalPriority };
  }

  /**
   * Adjusts exercise distribution to fit within maximum limit
   * @param {number[]} exercisesPerMuscle - Initial distribution
   * @param {number} maxExercises - Maximum allowed exercises
   * @returns {number[]} Adjusted distribution
   */
  function adjustExerciseDistribution(exercisesPerMuscle, maxExercises) {
    let sumExercises = exercisesPerMuscle.reduce((sum, count) => sum + count, 0);

    while (sumExercises > maxExercises) {
      const maxCount = Math.max(...exercisesPerMuscle);
      const maxIndex = exercisesPerMuscle.findIndex(count => count === maxCount && count > 1);

      if (maxIndex === -1) break;

      exercisesPerMuscle[maxIndex]--;
      sumExercises--;
    }

    return exercisesPerMuscle;
  }

  // ============================================================================
  // EXERCISE FILTERING AND SELECTION
  // ============================================================================

  /**
   * Filters exercises based on muscle targets, equipment, and other criteria
   * @param {Array} exercises - All available exercises
   * @param {string[]} targetMuscles - Target muscle groups (normalized)
   * @param {string[]} availableEquipment - Available equipment
   * @returns {Array} Filtered exercises
   */
  function filterValidExercises(exercises, targetMuscles, availableEquipment) {
    const normalizedEquipment = normalizeMuscleNames(availableEquipment);

    return exercises.filter(exercise => {
      // Skip cardio exercises
      if (exercise.primary_muscle?.toLowerCase().trim() === "cardio") {
        return false;
      }

      // Check if exercise targets any of the desired muscles
      const primaryMuscle = exercise.primary_muscle?.toLowerCase().trim();
      const secondaryMuscles = normalizeMuscleNames(exercise.secondary_muscles || []);

      const targetsDesiredMuscle = targetMuscles.includes(primaryMuscle) ||
        secondaryMuscles.some(muscle => targetMuscles.includes(muscle));

      if (!targetsDesiredMuscle) return false;

      // Check equipment requirements
      if (exercise.equipment_required?.length > 0) {
        const requiredEquipment = normalizeMuscleNames(exercise.equipment_required);
        return requiredEquipment.every(equipment =>
          normalizedEquipment.includes(equipment)
        );
      }

      return true;
    });
  }

/**
 * Scores and sorts exercise candidates for a specific muscle
 * @param {Array} candidates - Candidate exercises
 * @param {string} targetMuscle - Target muscle group
 * @param {string} priorityType - Goal-based priority type
 * @returns {Array} Scored and sorted exercises
 */
function scoreExerciseCandidates(candidates, targetMuscle, priorityType) {
  return candidates
    .map(exercise => {
      const primaryMuscle = exercise.primary_muscle?.toLowerCase().trim();
      const priorityScore = MUSCLE_PRIORITY[primaryMuscle]?.[priorityType] || 0;
      const estimatedDuration = estimateExerciseDuration(exercise);
      const isPrimary = primaryMuscle === targetMuscle;

      return {
        ...exercise,
        priorityScore,
        estimatedDuration,
        isPrimary
      };
    })
    .sort((a, b) => {
      // Primary muscle exercises first
      if (b.isPrimary !== a.isPrimary) return b.isPrimary - a.isPrimary;

      // Higher priority scores first
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;

      // Compound exercises preferred
      if (a.compound && !b.compound) return -1;
      if (!a.compound && b.compound) return 1;

      return 0;
    });
}

// ============================================================================
// MAIN RECOMMENDATION FUNCTION
// ============================================================================

/**
 * Recommends exercises for a workout session based on goals and constraints
 * @param {Object} params - Parameters object
 * @param {string[]} params.targetMuscles - Target muscle groups
 * @param {string} params.gymId - Gym ID to fetch gym data and exercises
 * @param {string} params.userGoal - User's fitness goal
 * @param {number} params.workoutDuration - Target workout duration in minutes
 * @returns {Array} Recommended exercises
 */
export async function recommendExercisesForSession({
  targetMuscles,
  gymId,
  userGoal = "Build muscle mass",
  workoutDuration = 60
}) {
  try {
    // Fetch exercises and gym data
    const [exercises, gym] = await Promise.all([
      fetchExercises(),
      fetchGymById(gymId)
    ]);

    if (!exercises || exercises.length === 0) {
      throw new Error("No exercises found");
    }

    if (!gym) {
      throw new Error(`Gym with ID ${gymId} not found`);
    }

    const priorityType = GOAL_TO_PRIORITY_KEY[userGoal] || "hypertrophy";
    const normalizedTargets = normalizeMuscleNames(targetMuscles);

    // Step 1: Filter valid exercises
    const filteredExercises = filterValidExercises(exercises, normalizedTargets, gym.equipment || []);

    // Step 2: Calculate muscle priorities and exercise distribution
    const { proportions } = calculateMusclePriorities(normalizedTargets, priorityType);

    // Step 3: Estimate maximum exercises based on time constraint
    const avgExerciseDuration = estimateExerciseDuration({ compound: true }); // Conservative estimate
    const maxExercises = Math.max(1, Math.floor(workoutDuration / avgExerciseDuration));

    // Step 4: Calculate exercises per muscle group
    let exercisesPerMuscle = proportions.map(proportion =>
      Math.max(1, Math.round(proportion * maxExercises))
    );
    exercisesPerMuscle = adjustExerciseDistribution(exercisesPerMuscle, maxExercises);

    // Step 5: Select exercises for each muscle group
    const selectedExercises = [];
    const usedExerciseIds = new Set();
    let totalDuration = 0;

    for (let i = 0; i < normalizedTargets.length; i++) {
      const targetMuscle = normalizedTargets[i];
      const exerciseCount = exercisesPerMuscle[i];

      const candidates = filteredExercises.filter(exercise => {
        const primaryMuscle = exercise.primary_muscle?.toLowerCase().trim();
        const secondaryMuscles = normalizeMuscleNames(exercise.secondary_muscles || []);

        return (primaryMuscle === targetMuscle || secondaryMuscles.includes(targetMuscle)) &&
          !usedExerciseIds.has(exercise.id);
      });

      const scoredCandidates = scoreExerciseCandidates(candidates, targetMuscle, priorityType);

      let addedCount = 0;
      for (const exercise of scoredCandidates) {
        if (addedCount >= exerciseCount) break;
        if (totalDuration + exercise.estimatedDuration > workoutDuration && selectedExercises.length > 0) break;

        selectedExercises.push(exercise);
        usedExerciseIds.add(exercise.id);
        totalDuration += exercise.estimatedDuration;
        addedCount++;
      }
    }

    // Step 6: Fill remaining time with best available exercises
    const remainingExercises = filteredExercises
      .filter(exercise => !usedExerciseIds.has(exercise.id))
      .map(exercise => {
        const primaryMuscle = exercise.primary_muscle?.toLowerCase().trim();
        const muscleOrder = normalizedTargets.indexOf(primaryMuscle);
        const priorityScore = MUSCLE_PRIORITY[primaryMuscle]?.[priorityType] || 0;
        const estimatedDuration = estimateExerciseDuration(exercise);

        return {
          ...exercise,
          muscleOrder: muscleOrder === -1 ? 999 : muscleOrder,
          priorityScore,
          estimatedDuration
        };
      })
      .sort((a, b) => {
        if (a.muscleOrder !== b.muscleOrder) return a.muscleOrder - b.muscleOrder;
        if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
        if (a.compound && !b.compound) return -1;
        if (!a.compound && b.compound) return 1;
        return 0;
      });

    for (const exercise of remainingExercises) {
      if (totalDuration + exercise.estimatedDuration > workoutDuration) break;

      selectedExercises.push(exercise);
      usedExerciseIds.add(exercise.id);
      totalDuration += exercise.estimatedDuration;
    }

    return selectedExercises;
  } catch (error) {
    console.error("❌ Error in recommendExercisesForSession:", error);
    throw error;
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Generates and stores planned workouts for a user's split
 * @param {Object} params - Parameters object
 * @param {string} params.userId - User ID
 * @param {Object} params.split - Workout split object
 * @param {string} params.gymId - Gym ID
 * @param {string} params.userGoal - User's fitness goal
 * @param {number} params.workoutDuration - Target workout duration in minutes
 * @returns {Promise<void>}
 */
export async function generateAndStorePlannedWorkouts({
  userId,
  split,
  gymId,
  userGoal = "Build muscle mass",
  workoutDuration = 60
}) {
  try {
    for (let sessionIndex = 0; sessionIndex < split.workouts.length; sessionIndex++) {
      const session = split.workouts[sessionIndex];

      // Get recommended exercises for this session
      const recommendedExercises = await recommendExercisesForSession({
        targetMuscles: session.main_muscles || [],
        gymId,
        userGoal,
        workoutDuration
      });

      // Calculate total estimated duration by summing the estimated duration of each exercise
      const totalDuration = recommendedExercises.reduce(
        (sum, ex) => sum + estimateExerciseDuration(ex), 0
      );

      // Prepare main and secondary muscles arrays
      const mainMuscles = session.main_muscles || [];
      const secondaryMuscles = session.optional_muscles || [];

      // Build the details object to store in the JSONB column
      const details = {
        duration: Math.round(totalDuration),
        main_muscles: mainMuscles,
        secondary_muscles: secondaryMuscles,
        fitness_goal: userGoal
      };

      // Upsert the planned workout with the details JSONB
      const { data, error } = await supabase
        .from("UserPlannedWorkouts")
        .upsert([{
          user_id: userId,
          split_id: split.id,
          session_index: sessionIndex,
          title: session.title || session.name || `Session ${sessionIndex + 1}`,
          exercises: recommendedExercises.map(exercise => exercise.id),
          details: details,
          updated_at: new Date().toISOString(),
        }], { onConflict: ['user_id', 'split_id', 'session_index'] });

      if (error) {
        console.error(`❌ Error inserting session #${sessionIndex}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error generating planned workouts:", error);
    throw error;
  }
}


/**
 * Retrieves planned workouts for a user and split
 * @param {string} userId - User ID
 * @param {string} splitId - Split ID
 * @returns {Promise<Array>} Planned workouts
 */
export async function getPlannedWorkouts(userId, splitId) {
  try {
    const { data, error } = await supabase
      .from("UserPlannedWorkouts")
      .select("*")
      .eq("user_id", userId)
      .eq("split_id", splitId)
      .order("session_index", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error fetching planned workouts:", error);
    throw error;
  }
}

/**
 * Recalculates a specific planned workout session
 * @param {Object} params - Parameters object
 * @param {string} params.userId - User ID
 * @param {Object} params.split - Workout split object
 * @param {number} params.sessionIndex - Session index to recalculate
 * @param {string} params.gymId - Gym ID
 * @param {string} params.userGoal - User's fitness goal
 * @param {number} params.workoutDuration - Target workout duration in minutes
 * @returns {Promise<Array>} Updated recommended exercises
 */
export async function recalculatePlannedWorkout({
  userId,
  split,
  sessionIndex,
  gymId,
  userGoal = "Build muscle mass",
  workoutDuration = 60
}) {
  try {
    const session = split.workouts[sessionIndex];
    const recommendedExercises = await recommendExercisesForSession({
      targetMuscles: session.main_muscles || [],
      gymId,
      userGoal,
      workoutDuration
    });

    // Calculate total estimated duration by summing the estimated duration of each exercise
    const totalDuration = recommendedExercises.reduce(
      (sum, ex) => sum + estimateExerciseDuration(ex), 0
    );

    // Prepare main and secondary muscles arrays
    const mainMuscles = session.main_muscles || [];
    const secondaryMuscles = session.optional_muscles || [];

    // Build the details object to store in the JSONB column
    const details = {
      duration: Math.round(totalDuration),
      main_muscles: mainMuscles,
      secondary_muscles: secondaryMuscles,
      fitness_goal: userGoal
    };

    const { error } = await supabase
      .from("UserPlannedWorkouts")
      .update({
        exercises: recommendedExercises.map(exercise => exercise.id),
        details: details,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("split_id", split.id)
      .eq("session_index", sessionIndex);

    if (error) throw error;
    return recommendedExercises;
  } catch (error) {
    console.error("❌ Error recalculating planned workout:", error);
    throw error;
  }
}

/**
 * Saves a planned workout directly to the database
 * @param {Object} params - Workout data
 * @param {string} params.user_id - User ID
 * @param {string} params.split_id - Split ID
 * @param {number} params.session_index - Session index
 * @param {string} params.title - Workout title
 * @param {Array} params.exercises - Exercise IDs
 * @returns {Promise<Object|null>} Saved workout data or null if error
 */
export async function savePlannedWorkout({ user_id, split_id, session_index, title, exercises }) {
  try {
    const { data, error } = await supabase
      .from("UserPlannedWorkouts")
      .upsert(
        {
          user_id,
          split_id,
          session_index,
          title,
          exercises,
          updated_at: new Date().toISOString(),
        },
        { onConflict: ["user_id", "split_id", "session_index"] }
      );

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("❌ Error saving planned workout:", error);
    return null;
  }
}