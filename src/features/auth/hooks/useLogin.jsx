import { useState } from "react";
import { loginUser } from "../services/authService";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const userData = await loginUser(email, password);
      if (!userData) throw new Error("Invalid email or password");
      return userData;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};
