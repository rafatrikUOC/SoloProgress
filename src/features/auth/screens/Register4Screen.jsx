import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
  TouchableOpacity,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveData, getData } from "../../../global/utils/storage";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = 80;
const KG_MIN = 30;
const KG_MAX = 200;
const DEFAULT_KG = 70;

const convertKgToLb = (kg) => Math.round(kg * 2.20462);
const convertLbToKg = (lb) => Math.round(lb / 2.20462);

const LB_MIN = convertKgToLb(KG_MIN);
const LB_MAX = convertKgToLb(KG_MAX);

export default function Register4({ navigation }) {
  const { colors, typography } = useThemeContext();

  const [unit, setUnit] = useState("kg");
  const [weightInKg, setWeightInKg] = useState(DEFAULT_KG);
  const [inputWeight, setInputWeight] = useState(String(DEFAULT_KG));
  const [centerIndex, setCenterIndex] = useState(0);
  const [previousData, setPreviousData] = useState({});
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  const getOptions = () => {
    const min = unit === "kg" ? KG_MIN : convertKgToLb(KG_MIN);
    const max = unit === "kg" ? KG_MAX : convertKgToLb(KG_MAX);
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  };

  const weightOptions = getOptions();

  const handleInputChange = (text) => {
    setInputWeight(text.replace(/\D/g, ""));
  };

  const handleInputSubmit = () => {
    let num = parseInt(inputWeight, 10);
    if (isNaN(num)) return;

    const min = unit === "kg" ? KG_MIN : LB_MIN;
    const max = unit === "kg" ? KG_MAX : LB_MAX;
    num = clamp(num, min, max);

    if (unit === "kg") {
      setWeightInKg(num);
    } else {
      const kg = convertLbToKg(num);
      setWeightInKg(kg);
    }

    const index = weightOptions.indexOf(num);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const handleUnitSelect = (selectedUnit) => {
    if (selectedUnit === unit) return;

    const value = parseInt(inputWeight, 10);
    if (isNaN(value)) return;

    let convertedWeight = value;

    if (unit === "kg" && selectedUnit === "lb") {
      convertedWeight = convertKgToLb(value);
    } else if (unit === "lb" && selectedUnit === "kg") {
      convertedWeight = convertLbToKg(value);
    }

    const min = selectedUnit === "kg" ? KG_MIN : LB_MIN;
    const max = selectedUnit === "kg" ? KG_MAX : LB_MAX;
    const clampedWeight = clamp(convertedWeight, min, max);

    const newIndex = selectedUnit === "kg"
      ? clampedWeight - KG_MIN
      : clampedWeight - LB_MIN;

    setUnit(selectedUnit);
    setInputWeight(String(clampedWeight));
    setWeightInKg(selectedUnit === "kg" ? clampedWeight : convertLbToKg(clampedWeight));

    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: newIndex });
      setCenterIndex(newIndex);
    }, 100);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await getData("registrationData");
        if (savedData && savedData.weight && savedData.weightUnit) {
          const savedWeight = savedData.weight;
          const savedUnit = savedData.weightUnit;

          setUnit(savedUnit);
          const realWeight = savedUnit === "kg" ? savedWeight : convertLbToKg(savedWeight);
          setWeightInKg(realWeight);
          setInputWeight(String(savedWeight));

          const options = Array.from({ length: (savedUnit === "kg" ? KG_MAX : LB_MAX) - (savedUnit === "kg" ? KG_MIN : LB_MIN) + 1 }, (_, i) => (savedUnit === "kg" ? KG_MIN : LB_MIN) + i);
          const index = options.indexOf(savedWeight);
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: index >= 0 ? index : 0 });
            setCenterIndex(index >= 0 ? index : 0);
          }, 100);
        } else {
          setUnit("kg");
          setInputWeight(String(DEFAULT_KG));
          setWeightInKg(DEFAULT_KG);

          const index = DEFAULT_KG - KG_MIN;
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index });
            setCenterIndex(index);
          }, 100);
        }

      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const saveWeightData = async (newWeight, currentUnit = unit) => {
    const prev = await getData("registrationData");

    const finalData = {
      ...prev,
      weight: currentUnit === "kg" ? newWeight : convertKgToLb(newWeight),
      weightUnit: currentUnit,
    };

    await saveData("registrationData", finalData);
  };

  useEffect(() => {
    const index = weightOptions.indexOf(unit === "kg" ? weightInKg : convertKgToLb(weightInKg));
    if (index >= 0) setCenterIndex(index);
  }, [unit, weightInKg]);

  useEffect(() => {
    saveWeightData(weightInKg, unit);
  }, [weightInKg, unit]);

  const data = {
    ...previousData,
    weight: weightInKg,
    unit,
  };

  return (
    <View style={styles(colors).container}>
      {/* Back Button */}
      <BackButton onPress={() => navigation.goBack()} />

      {/* Header */}
      <HeaderBlock
        title={"What's your weight?"}
        subtitle={"To accurately track your progress and set realistic goals.\nPlease enter your weight in either kg or lb."}
      />

      {/* Input Section */}
      <View style={styles(colors).inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles(colors).input}
          value={inputWeight}
          keyboardType="numeric"
          maxLength={3}
          onChangeText={handleInputChange}
          onBlur={handleInputSubmit}
          onSubmitEditing={handleInputSubmit}
          returnKeyType="done"
        />
        <Text style={[typography.bodyMedium, { color: colors.text.primary }]}>
          {unit}
        </Text>
        <FontAwesome5
          name="caret-up"
          size={48}
          color={colors.text.primary}
          style={styles(colors).arrow}
        />
      </View>

      {/* Weight Options Scroll */}
      <View style={{ marginTop: 16 }}>
        <Animated.FlatList
          ref={flatListRef}
          data={weightOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{
            paddingHorizontal: (width - ITEM_WIDTH) / 2 - 24,
            backgroundColor: colors.bg.primary,
            borderRadius: 24,
          }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          style={{ flexGrow: 0, borderRadius: 24 }}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / ITEM_WIDTH);
            setCenterIndex(index);
            const selected = getOptions()[index];

            if (unit === "kg") {
              setWeightInKg(selected);
              setInputWeight(String(selected));
            } else {
              const kg = convertLbToKg(selected);
              setWeightInKg(kg);
              setInputWeight(String(selected));
            }
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: (event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
                const selected = getOptions()[index];
                if (selected != null) {
                  inputRef.current?.setNativeProps({ text: String(selected) });
                  setWeightInKg(unit === "kg" ? selected : convertLbToKg(selected));
                }
              },
            }
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
              index === centerIndex || index === centerIndex - 1 || index === centerIndex + 1
                ? colors.text.white
                : colors.text.secondary;
            return (
              <Animated.View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_WIDTH,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale }],
                  opacity,
                }}
              >
                <Text style={{ fontWeight: "bold", fontSize: 36, color }}>{item}</Text>
              </Animated.View>
            );
          }}
        />
      </View>

      {/* Unit Selection */}
      <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 20 }}>
        {["kg", "lb"].map((u) => (
          <TouchableOpacity
            key={u}
            onPress={() => handleUnitSelect(u)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: unit === u ? colors.bg.primary : colors.bg.secondary,
              borderRadius: 14,
              marginHorizontal: 8,
            }}
          >
            <Text
              style={{
                ...typography.bodyMedium,
                color: unit === u ? colors.text.white : colors.text.primary,
              }}
            >
              {u.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Action Button */}
      <ActionButton text="Continue" onPress={() => navigation.navigate("Register5")} />
    </View>
  );
}

const styles = (colors, typography = {}) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      paddingHorizontal: 24,
      paddingTop: 64,
    },
    inputContainer: {
      borderRadius: 24,
      paddingVertical: 24,
      alignItems: "center",
      marginTop: 48,
    },
    input: {
      fontSize: 54,
      fontWeight: "bold",
      color: colors.text.white,
      textAlign: "center",
      borderBottomWidth: 2,
      borderColor: colors.text.primary,
      width: 140,
      backgroundColor: "transparent",
    },
    arrow: {
      marginTop: 8,
    },
  });
