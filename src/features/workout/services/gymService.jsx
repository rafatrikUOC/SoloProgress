import { supabase } from "../../../global/services/supabaseService";


// Fetch a gym by its ID
export async function fetchGymById(gymId) {
  const { data, error } = await supabase
    .from("Gyms")
    .select("*")
    .eq("id", gymId)
    .single();
  if (error) {
    console.error("Error fetching gym:", error);
    return null;
  }
  return data;
}
