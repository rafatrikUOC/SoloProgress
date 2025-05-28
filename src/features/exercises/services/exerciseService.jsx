
import { supabase } from '../../../global/services/supabaseService';

/**
 * Fetches all exercises from the Supabase 'Exercises' table.
 * You can optionally customize fields or filters here.
 */
export const fetchExercises = async () => {
  const { data, error } = await supabase
    .from('Exercises')
    .select('*')
    .order('name', { ascending: true });

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