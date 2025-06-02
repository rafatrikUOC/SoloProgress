import { supabase } from '../../../global/services/supabaseService';

/**
 * Fetches all exercises from the Supabase 'Exercises' table.
 * Optionally excludes exercises whose IDs are in excludeIds.
 *
 * @param {Array<number|string>} [excludeIds] - Array of exercise IDs to exclude
 * @returns {Promise<Array>} Array of exercises
 */
export const fetchExercises = async (excludeIds = []) => {
  let query = supabase
    .from('Exercises')
    .select('*')
    .order('name', { ascending: true });

  // If excludeIds is provided and not empty, add the filter
  if (Array.isArray(excludeIds) && excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching exercises:', error.message);
    return [];
  }

  return data || [];
};

/**
 * Fetches a single exercise by its ID from the Supabase 'Exercises' table.
 */
export async function fetchExerciseById(id) {
  const { data, error } = await supabase
    .from("Exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
