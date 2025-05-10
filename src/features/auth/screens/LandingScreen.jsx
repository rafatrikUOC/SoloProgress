import React from "react";
import { View, Text, Button } from "react-native";

// Componente básico de LandingScreen
const LandingScreen = ({ onFinish }) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        ¡Bienvenido a la App!
      </Text>
      <Button title="Empezar" onPress={onFinish} />
    </View>
  );
};

export default LandingScreen;
