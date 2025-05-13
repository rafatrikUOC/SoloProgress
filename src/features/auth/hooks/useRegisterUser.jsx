import { useState } from "react";
import { getData } from "../../../global/utils/storage";
import { customHash } from "../../../global/utils/hash";
import { registerUser } from "../services/authService";

export const useRegisterUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (plainPassword, onSuccess) => {
    try {
      setLoading(true);
      setError("");
  
      const registrationData = await getData("registrationData");
      if (!registrationData) {
        console.error("No registration data found");
        throw new Error("No registration data found");
      }
      if (!registrationData) throw new Error("Missing registration data");
  
      const hashedPassword = await customHash(plainPassword);

  
      const newUser = {
        ...registrationData,
        password: hashedPassword,
      };

      await registerUser(newUser);
  
      if (typeof onSuccess === "function") onSuccess();
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  

  return { handleRegister, loading, error };
};