import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";

export default function ProfileScreen({ navigation }) {
  const { setUser } = useContext(UserContext);

  const handleLogout = async () => {
    // 1. Sign out from Supabase
    await supabase.auth.signOut();

    // 2. Clear user context
    setUser({ info: null, settings: null, split: null });

    // 3. Redirect to login (Auth stack)
    navigation.replace("Auth");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile screen</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold" },
  button: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "#d32f2f",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
