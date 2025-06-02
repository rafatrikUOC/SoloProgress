import { supabase } from "../../../global/services/supabaseService";

// Register a new user with Supabase Auth and custom Users table
export const registerUser = async (data) => {
  try {
    const { username, email, password, photo_url, is_trainer, gender, age, weight, weightUnit, height, heightUnit, goal, activityLevel } = data;

    // Validate required fields
    if (!username || !email || !password) {
      console.error("[RegisterUser] Missing required fields.");
      throw new Error("Username, email, and password are required.");
    }

    // Check for duplicate email in your Users table (optional, Supabase Auth will also check)
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      throw new Error("Email already in use.");
    }

    // Check for duplicate username
    const usernameExists = await checkIfUsernameExists(username);
    if (usernameExists) {
      throw new Error("Username already in use.");
    }

    // Step 1: Register user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) {
      console.error("[RegisterUser] Supabase Auth error:", authError);
      throw new Error(authError.message);
    }

    // Get the UUID from Supabase Auth
    const userId = authData?.user?.id;
    if (!userId) throw new Error("Could not get user id from Supabase Auth.");

    // Step 2: Insert user in Users table with the same UUID
    const { data: insertedUser, error: userError } = await supabase
      .from("Users")
      .insert([
        {
          id: userId,
          username,
          email,
          photo_url,
          is_trainer,
          gender,
        },
      ])
      .select();

    if (userError) {
      console.error("[RegisterUser] Users table insert error:", userError);
      throw new Error(userError.message);
    }

    // Step 3: Insert user settings (units, fitness goal, activity level, etc.)
    const { error: settingsError } = await supabase.from("UserSettings").insert([
      {
        user_id: userId,
        units: {
          weight: weightUnit,
          height: heightUnit,
        },
        app_preferences: {
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
        },
        fitness_goal: goal,
        performance_data: {
          activity_level: activityLevel,
        },
        weekly_goal: 4,
        selected_routine: 1,
      },
    ]);
    if (settingsError) {
      console.error("[RegisterUser] UserSettings insert error:", settingsError);
      throw new Error(settingsError.message);
    }

    // Step 4: Insert initial measurements (age, weight, height)
    const getCurrentDate = () => new Date().toISOString().split("T")[0];
    const { error: measurementsError } = await supabase.from("Measurements").insert([
      {
        user_id: userId,
        date: getCurrentDate(),
        key: "weight_" + weightUnit,
        value: weight,
      },
      {
        user_id: userId,
        date: getCurrentDate(),
        key: "height_" + heightUnit,
        value: height,
      },
      {
        user_id: userId,
        date: getCurrentDate(),
        key: "age",
        value: age,
      },
    ]);
    if (measurementsError) {
      console.error("[RegisterUser] Measurements insert error:", measurementsError);
      throw new Error(measurementsError.message);
    }

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
      .ilike("email", normalizedEmail);

    if (error) return false;
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
      .ilike("username", normalizedUsername);

    if (error) return null; // Username not found
    return data;
  } catch (error) {
    console.error("Error checking username:", error);
    throw error;
  }
};

// Log in user into the system using Supabase Auth
export const loginUser = async (email, password) => {
  try {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (authError) {
      throw new Error(authError.message || "Invalid email or password");
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error("Authentication succeeded but user id was not found.");
    }

    // 2. Fetch user profile from Users table
    const { data: user, error: userError } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      throw new Error("User profile not found.");
    }

    // Add emailConfirmed to info
    const emailConfirmed = !!authData?.user?.email_confirmed_at;
    const info = { ...user, emailConfirmed };

    // 3. Fetch user settings
    const { data: settings, error: settingsError } = await supabase
      .from("UserSettings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings) {
      throw new Error("User settings not found.");
    }

    // 4. Fetch split (if there is a selected routine)
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

    // 5. Return all user data
    return { info, settings, split };
  } catch (error) {
    console.error("[LoginUser] Login error:", error);
    throw error;
  }
};

// Fetch a single user by ID
export const getUserById = async (userId) => {
  try {
    // 1. Fetch user profile from Users table
    const { data, error } = await supabase
      .from("Users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);

    // 2. Fetch user from Supabase Auth to get email confirmation status
    let emailConfirmed = false;
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(userId);
    if (!authError && authData?.user) {
      emailConfirmed = !!authData.user.email_confirmed_at;
    }

    return { ...data, emailConfirmed };
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
      .ilike("email", normalizedEmail);

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
      .ilike("username", normalizedUsername);

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

// Send password reset email (OTP)
export const sendPasswordResetEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    // Optionally add redirectTo if you want a web-based flow
  });
  if (error) throw new Error(error.message);
  return data;
};

// Verify password reset with OTP (log in user if token is valid)
export const verifyPasswordResetToken = async (email, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: "recovery",
  });
  if (error) throw new Error(error.message);
  return data;
};
