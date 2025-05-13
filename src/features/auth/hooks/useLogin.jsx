import { useState } from "react";
import { loginUser } from "../services/authService";
import { customHash } from "../../../global/utils/hash";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const hashedPassword = await customHash(password);
      const userData = await loginUser(email, hashedPassword);
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
