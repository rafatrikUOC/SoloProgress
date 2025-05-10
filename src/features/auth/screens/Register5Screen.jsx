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
import {
  BackButton,
  ActionButton,
  HeaderBlock,
} from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveData, getData } from "../../../global/utils/storage";

const { height } = Dimensions.get("window");
const ITEM_HEIGHT = 60;
const CM_MIN = 120;
const CM_MAX = 220;
const DEFAULT_CM = 170;

const convertCmToIn = (cm) => Math.round(cm / 2.54);
const convertInToCm = (inch) => Math.round(inch * 2.54);

function toFeetInches(totalInches) {
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  return { feet, inches };
}

export default function Register5({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [unit, setUnit] = useState("cm");
  const [heightInCm, setHeightInCm] = useState(DEFAULT_CM);
  const [inputHeight, setInputHeight] = useState(String(DEFAULT_CM));
  const [centerIndex, setCenterIndex] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const getOptions = () => {
    if (unit === "cm") {
      return Array.from({ length: CM_MAX - CM_MIN + 1 }, (_, i) => CM_MIN + i);
    } else {
      const minIn = convertCmToIn(CM_MIN);
      const maxIn = convertCmToIn(CM_MAX);
      return Array.from({ length: maxIn - minIn + 1 }, (_, i) => minIn + i);
    }
  };

  const heightOptions = getOptions();

  const handleInputChange = (text) => {
    setInputHeight(text.replace(/\D/g, ""));
  };

  const handleInputSubmit = () => {
    let num = parseInt(inputHeight, 10);
    if (isNaN(num)) return;

    if (unit === "cm") {
      num = Math.max(CM_MIN, Math.min(CM_MAX, num));
      setHeightInCm(num);
    } else {
      const minIn = convertCmToIn(CM_MIN);
      const maxIn = convertCmToIn(CM_MAX);
      num = Math.max(minIn, Math.min(maxIn, num));
      setHeightInCm(convertInToCm(num));
    }

    const index = heightOptions.indexOf(num);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  };

  const handleUnitSelect = (selectedUnit) => {
    if (selectedUnit === unit) return;

    let converted;
    if (selectedUnit === "cm") {
      converted = heightInCm;
      setInputHeight(String(converted));
    } else {
      converted = convertCmToIn(heightInCm);
      setInputHeight(String(converted));
    }

    let newOptions;
    if (selectedUnit === "cm") {
      newOptions = Array.from(
        { length: CM_MAX - CM_MIN + 1 },
        (_, i) => CM_MIN + i
      );
    } else {
      const minIn = convertCmToIn(CM_MIN);
      const maxIn = convertCmToIn(CM_MAX);
      newOptions = Array.from(
        { length: maxIn - minIn + 1 },
        (_, i) => minIn + i
      );
    }

    setUnit(selectedUnit);

    setTimeout(() => {
      const index = newOptions.indexOf(converted);

      if (index >= 0) {
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setCenterIndex(index);
      } else {
        const nearest = newOptions.reduce((prev, curr) =>
          Math.abs(curr - converted) < Math.abs(prev - converted) ? curr : prev
        );
        const nearestIndex = newOptions.indexOf(nearest);
        flatListRef.current?.scrollToIndex({
          index: nearestIndex,
          animated: true,
        });
        setInputHeight(String(nearest));
        setCenterIndex(nearestIndex);
      }
    }, 100);
  };

  const saveHeightData = async (newHeight, currentUnit = unit) => {
    const prev = await getData("registrationData");
  
    const finalData = {
      ...prev,
      height: currentUnit === "cm" ? newHeight : convertCmToIn(newHeight),
      heightUnit: currentUnit,
    };
  
    await saveData("registrationData", finalData);
  };  

  useEffect(() => {
    const index = heightOptions.indexOf(DEFAULT_CM);
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: false });
    }
  }, []);

  useEffect(() => {
    const index =
      unit === "cm"
        ? heightOptions.indexOf(heightInCm)
        : heightOptions.indexOf(convertCmToIn(heightInCm));
    if (index >= 0) {
      setCenterIndex(index);
    }
  }, [unit, heightInCm]);

  useEffect(() => {
    saveHeightData(heightInCm, unit);
  }, [heightInCm, unit]);

  return (
    <View style={styles(colors).container}>
      <BackButton onPress={() => navigation.goBack()} />
      <HeaderBlock
        title={"What's your height?"}
        subtitle={
          "To personalize your experience and track your progress.\nPlease enter your height in either cm or ft/in."
        }
      />
      <View style={styles(colors).inputPickerRow}>
        <View style={styles(colors).inputWithArrow}>
          <View style={styles(colors).inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles(colors).input}
              value={inputHeight}
              keyboardType="numeric"
              maxLength={3}
              onChangeText={handleInputChange}
              onBlur={handleInputSubmit}
              onSubmitEditing={handleInputSubmit}
              returnKeyType="done"
            />
            <Text
              style={[
                typography.bodyMedium,
                { color: colors.text.primary, marginLeft: 6 },
              ]}
            >
              {unit === "cm" ? "cm" : "in"}
            </Text>
          </View>
          <FontAwesome5 name="caret-left" size={28} color={colors.text.primary} />
        </View>

        <View style={styles(colors).pickerContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={heightOptions}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.toString()}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{
              paddingVertical: ITEM_HEIGHT * 2,
            }}
            onMomentumScrollEnd={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / ITEM_HEIGHT);
              setCenterIndex(index);

              const selected = getOptions()[index];
              if (unit === "cm") {
                setHeightInCm(selected);
                setInputHeight(String(selected));
              } else {
                const cm = convertInToCm(selected);
                setHeightInCm(cm);
                setInputHeight(String(selected));
              }
            }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              {
                useNativeDriver: false,
                listener: (event) => {
                  const index = Math.round(
                    event.nativeEvent.contentOffset.y / ITEM_HEIGHT
                  );
                  const selected = getOptions()[index];
                  if (selected != null) {
                    inputRef.current?.setNativeProps({
                      text: String(selected),
                    });
                    setHeightInCm(
                      unit === "cm" ? selected : convertInToCm(selected)
                    );
                  }
                },
              }
            )}
            renderItem={({ item, index }) => {
              const inputRange = [
                (index - 2) * ITEM_HEIGHT,
                (index - 1) * ITEM_HEIGHT,
                index * ITEM_HEIGHT,
                (index + 1) * ITEM_HEIGHT,
                (index + 2) * ITEM_HEIGHT,
              ];

              const opacity = scrollY.interpolate({
                inputRange,
                outputRange: [0.4, 0.6, 1, 0.6, 0.4],
                extrapolate: "clamp",
              });

              const scale = scrollY.interpolate({
                inputRange,
                outputRange: [0.8, 0.95, 1.2, 0.95, 0.8],
                extrapolate: "clamp",
              });

              const color =
                index === centerIndex ||
                index === centerIndex - 1 ||
                index === centerIndex + 1
                  ? colors.text.white
                  : colors.text.secondary;

              return (
                <Animated.View
                  style={{
                    height: ITEM_HEIGHT,
                    width: 90,
                    alignItems: "center",
                    justifyContent: "center",
                    transform: [{ scale }],
                    opacity,
                  }}
                >
                  <Text style={{ fontWeight: "bold", fontSize: 32, color }}>
                    {unit === "cm"
                      ? item
                      : (() => {
                        const { feet, inches } = toFeetInches(item);
                        return `${feet}'${inches}"`;
                      })()}
                  </Text>
                </Animated.View>
              );
            }}
          />
        </View>
      </View>

      <View
        style={{ flexDirection: "row", alignSelf: "center", marginTop: 20 }}
      >
        {["cm", "in"].map((u) => (
          <TouchableOpacity
            key={u}
            onPress={() => handleUnitSelect(u)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor:
                unit === u ? colors.bg.primary : colors.bg.secondary,
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
              {u === "cm" ? "CM" : "FT/IN"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionButton
        text="Continue"
        onPress={() => navigation.navigate("Register6")}
      />
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
    inputPickerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 32,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
      backgroundColor: colors.bg.secondary,
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 18,
      elevation: 2,
    },
    input: {
      fontSize: 40,
      fontWeight: "bold",
      color: colors.text.white,
      textAlign: "center",
      borderBottomWidth: 2,
      borderColor: colors.text.primary,
      width: 80,
      backgroundColor: "transparent",
    },
    inputWithArrow: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    pickerContainer: {
      height: ITEM_HEIGHT * 5,
      width: 100,
      backgroundColor: colors.bg.primary,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
    },
  });
