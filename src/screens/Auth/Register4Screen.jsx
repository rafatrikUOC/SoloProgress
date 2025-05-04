import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  TextInput,
} from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = 70; // más ancho para que los valores no se peguen

const KG_MIN = 35;
const KG_MAX = 180;
const LB_MIN = Math.round(KG_MIN * 2.20462);
const LB_MAX = Math.round(KG_MAX * 2.20462);

const generateRange = (min, max) =>
  Array.from({ length: max - min + 1 }, (_, i) => min + i);

export default function Register4({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [unit, setUnit] = useState("kg");
  const [weight, setWeight] = useState(70);
  const [weights, setWeights] = useState(generateRange(KG_MIN, KG_MAX));
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const convertWeight = (value, toUnit) =>
    toUnit === "kg"
      ? Math.round(value / 2.20462)
      : Math.round(value * 2.20462);

  const getMin = () => (unit === "kg" ? KG_MIN : LB_MIN);

  const handleUnitChange = (newUnit) => {
    const converted = convertWeight(weight, newUnit);
    const min = newUnit === "kg" ? KG_MIN : LB_MIN;
    const max = newUnit === "kg" ? KG_MAX : LB_MAX;
    const adjusted = Math.max(min, Math.min(max, converted));
    setUnit(newUnit);
    setWeight(adjusted);
    setWeights(generateRange(min, max));
    setTimeout(() => {
      const index = adjusted - min;
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }, 100);
  };

  const handleScrollEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    const selected = weights[index];
    setWeight(selected);
  };

  useEffect(() => {
    const index = weight - getMin();
    flatListRef.current?.scrollToIndex({ index, animated: false });
  }, []);

  const handleTextInputChange = (value) => {
    let number = parseInt(value);
    if (!isNaN(number)) {
      const min = getMin();
      const max = unit === "kg" ? KG_MAX : LB_MAX;
      number = Math.max(min, Math.min(max, number));
      setWeight(number);
      const index = number - min;
      flatListRef.current?.scrollToIndex({ index, animated: true });
    } else {
      setWeight(0); // Si no es un número válido, se pone 0
    }
  };

  return (
    <View style={styles(colors).container}>
      <TouchableOpacity
        style={styles(colors).backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
        <Text style={styles(colors).backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles(colors).top}>
        <Text style={styles(colors).title}>What is your weight?</Text>
        <Text style={styles(colors).subtitle}>
          To accurately track your progress and set realistic goals.
        </Text>
      </View>

      <View style={styles(colors).inputRow}>
        <TextInput
          style={styles(colors).textInput}
          value={weight.toString()}
          onChangeText={handleTextInputChange}
          keyboardType="numeric"
        />
        <Text style={styles(colors).unitText}>{unit}</Text>
      </View>

      <View style={styles(colors).unitSelector}>
        {["kg", "lb"].map((u) => (
          <TouchableOpacity
            key={u}
            style={[
              styles(colors).unitButton,
              unit === u && styles(colors).unitButtonActive,
            ]}
            onPress={() => handleUnitChange(u)}
          >
            <Text
              style={[
                styles(colors).unitButtonText,
                unit === u && styles(colors).unitButtonTextActive,
              ]}
            >
              {u.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles(colors).slider}>
        <Animated.FlatList
          ref={flatListRef}
          data={weights}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: width / 2 - ITEM_WIDTH / 2,
          }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={handleScrollEnd}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          renderItem={({ item, index }) => {
            const inputRange = [
              (index - 2) * ITEM_WIDTH,
              (index - 1) * ITEM_WIDTH,
              index * ITEM_WIDTH,
              (index + 1) * ITEM_WIDTH,
              (index + 2) * ITEM_WIDTH,
            ];

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 0.6, 1, 0.6, 0.4],
              extrapolate: "clamp",
            });

            const scale = scrollX.interpolate({
              inputRange,
              outputRange: [0.8, 0.95, 1.2, 0.95, 0.8],
              extrapolate: "clamp",
            });

            const color =
              item === weight ? colors.text.white : colors.text.secondary;

            return (
              <Animated.View
                style={{
                  width: ITEM_WIDTH,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale }],
                  opacity,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 34, color }}>
                  {item}
                </Text>
              </Animated.View>
            );
          }}
        />
      </View>

      <TouchableOpacity
        style={styles(colors).continueButton}
        onPress={() => navigation.navigate("Register5")}
      >
        <Text style={styles(colors).continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
    },
    backButton: {
      position: "absolute",
      top: 48,
      left: 24,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 14,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 20,
      zIndex: 10,
    },
    backText: {
      color: colors.text.white,
      marginLeft: 6,
    },
    top: {
      marginTop: 64,
      alignItems: "center",
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.text.muted,
      textAlign: "center",
      paddingHorizontal: 12,
      marginBottom: 32,
    },
    inputRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 16,
    },
    textInput: {
      backgroundColor: "rgba(255,255,255,0.08)",
      color: colors.text.white,
      fontSize: 28,
      fontWeight: "bold",
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
      textAlign: "center",
      width: 100,
    },
    unitText: {
      fontSize: 18,
      color: colors.text.secondary,
      marginLeft: 8,
    },
    unitSelector: {
      flexDirection: "row",
      justifyContent: "center",
      marginBottom: 24,
    },
    unitButton: {
      borderRadius: 16,
      paddingVertical: 8,
      paddingHorizontal: 32,
      marginHorizontal: 8,
      borderWidth: 2,
      borderColor: colors.text.primary,
    },
    unitButtonActive: {
      backgroundColor: colors.text.primary,
    },
    unitButtonText: {
      color: colors.text.primary,
      fontWeight: "600",
    },
    unitButtonTextActive: {
      color: colors.text.white,
    },
    slider: {
      borderRadius: 24,
      backgroundColor: colors.bg.primary,
      paddingVertical: 20,
    },
    continueButton: {
      position: "absolute",
      bottom: 40,
      left: 40,
      right: 40,
      backgroundColor: colors.bg.primary,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
    },
    continueButtonText: {
      color: colors.text.white,
      fontSize: 17,
      fontWeight: "600",
    },
  });
