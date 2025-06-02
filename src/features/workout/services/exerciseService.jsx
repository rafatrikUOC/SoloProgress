// src/features/exercises/services/exerciseService.js
import { supabase } from "../../../global/services/supabaseService";

export async function saveNote(trainingExerciseId, newNote) {
    // 1. Read current performance_data
    const { data, error } = await supabase
        .from("TrainingExercises")
        .select("performance_data")
        .eq("id", trainingExerciseId)
        .single();

    // Add notes to performance data
    let perf = {};
    if (data?.performance_data && typeof data.performance_data === "object") {
        perf = { ...data.performance_data };
    }
    perf.notes = newNote;

    // 2. Update performance data
    const { error: updateError } = await supabase
        .from("TrainingExercises")
        .update({ performance_data: perf })
        .eq("id", trainingExerciseId);

    if (updateError) {
        console.error("Error guardando nota:", updateError);
    }
}
