import { supabase } from "../../../global/services/supabaseService";

// Register a new user with parsed data from input
export const registerUser = async (data) => {
  try {
    const { username, email, password, photo_url, is_trainer, gender, age, weight, weightUnit, height, heightUnit, goal, activityLevel } = data;

    // Validate required fields
    if (!username || !email || !password) {
      throw new Error("Username, email, and password are required.");
    }

    // Check for duplicate email
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      throw new Error("Email already in use.");
    }

    // Check for duplicate username
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      throw new Error("Username already in use.");
    }

    // Insert user into Users table
    const { data: insertedUser, error: userError } = await supabase.from("Users").insert([
      {
        username: username,
        email: email,
        password_hash: password,
        gender: gender,
      },
    ])
      .select();

    //Extract id

    if (userError) throw new Error(userError.message);

    let userId = insertedUser[0].id;

    // Insert user settings (units, fitness goal, activity level, etc.)
    const { error: settingsError } = await supabase.from("UserSettings").insert([
      {
        user_id: userId,
        units: JSON.stringify({
          weight: weightUnit,
          height: heightUnit,
        }),
        app_preferences: JSON.stringify({
          "workout_duration": 60,
          "dropsets": true,
          "rest_time": {
            "enabled": true,
            "compound": 150,
            "isolation": 90
          },
          "supersets": true,
          "warmup_sets": {
            "enabled": true,
            "compound": 2,
            "isolation": 1
          },
          "plate_calculator": true,
          "reps_progression": {
            "compound": [
              "Straight"
            ],
            "isolation": [
              "Straight"
            ]
          }
        }),
        fitness_goal: goal,
        performance_data: JSON.stringify({
          activity_level: activityLevel,
        }),
        weekly_goal: 4,
        selected_routine: 1,
      },
    ]);

    if (settingsError) throw new Error(settingsError.message);

    // Insert initial measurements (age, weight, height)
    const { error: measurementsError } = await supabase.from("Measurements").insert([
      {
        user_id: userId,
        date: new Date().toISOString().split("T")[0], // Store today's date
        key: "weight_" + weightUnit,
        value: weight,
      },
      {
        user_id: userId,
        date: new Date().toISOString().split("T")[0], // Store today's date
        key: "height_" + heightUnit,
        value: height,
      },
      {
        user_id: userId,
        date: new Date().toISOString().split("T")[0], // Store today's date
        key: "age",
        value: age,
      },
    ]);

    if (measurementsError) throw new Error(measurementsError.message);

    // Return the inserted user data
    return insertedUser[0];
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Check if a user already exists with the given email
export const checkIfEmailExists = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();;
    const { data, error } = await supabase
      .from("Users")
      .select("email")
      .ilike("email", normalizedEmail)
      .single();

    if (error) return null; // Email not found
    return data;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

// Check if a user already exists with the given username
export const checkIfUsernameExists = async (username) => {
  try {
    const normalizedUsername = username.toLowerCase();
    const { data, error } = await supabase
      .from("Users")
      .select("username")
      .ilike("username", normalizedUsername)
      .single();

    if (error) return null; // Username not found
    return data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  // 1. Authenticate user
  const normalizedEmail = email.toLowerCase().trim();
  const { data: users, error: userError } = await supabase
    .from("Users")
    .select("*")
    .ilike("email", normalizedEmail)
    .eq("password_hash", password);

  if (userError) throw new Error(userError.message);
  if (!users || users.length === 0) throw new Error("No user found with this email.");
  const user = users[0];

  // 2. Fetch user settings
  const { data: settings, error: settingsError } = await supabase
    .from("UserSettings")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (settingsError) throw new Error(settingsError.message);

  // 3. Fetch split (if there is a selected routine)
  let split = null;
  if (settings.selected_routine) {
    const { data: splitData, error: splitError } = await supabase
      .from("TrainingSplits")
      .select("*")
      .eq("id", settings.selected_routine)
      .single();
    if (splitError) throw new Error(splitError.message);
    split = splitData;
  }
  console.log(user);
  console.log(settings);
  console.log(split);
  // 4. Return all user data
  return { info: user, settings, split };
};


// Fetch a single user by ID
export const getUserById = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

// Fetch a userid by its email
export const getUserIDByEmail = async (email) => {
  try {
    const normalizedEmail = email.toLowerCase().trim();;
    const { data, error } = await supabase
      .from("Users")
      .select("id")
      .ilike("email", normalizedEmail)
      .single();

    if (error) throw new Error(error.message);
    return data.id;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

// Fetch a userid by username
export const getUserIDByUsername = async (username) => {
  try {
    const normalizedUsername = username.toLowerCase();
    const { data, error } = await supabase
      .from("Users")
      .select("id")
      .ilike("username", normalizedUsername)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

// Update user data by ID
export const updateUser = async (userId, userData) => {
  try {
    const { data, error } = await supabase
      .from("Users")
      .update(userData)
      .eq("id", userId);

    if (error) throw new Error(error.message);
    return data[0];
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
