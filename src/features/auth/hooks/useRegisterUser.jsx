import { useState } from "react";
import { getData } from "../../../global/utils/storage";
import { registerUser } from "../services/authService";

export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handles user registration flow
  const handleRegister = async (plainPassword, onSuccess) => {
    try {
      setLoading(true);
      setError("");

      // Retrieve registration data from local storage
      const registrationData = await getData("registrationData");

      if (!registrationData) {
        throw new Error("No registration data found");
      }

      // Prepare user data for registration (password in plain text for Supabase Auth)
      const newUser = {
        ...registrationData,
        password: plainPassword,
      };

      // Call the service to register user in Supabase Auth and custom Users table
      await registerUser(newUser);

      // Call onSuccess callback if provided
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (err) {
      // Set error message
      console.error("[Register] Registration error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return { handleRegister, loading, error };
};