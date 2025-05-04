import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const MIN_AGE = 13;
const MAX_AGE = 99;
const DEFAULT_AGE = Math.floor((MIN_AGE + MAX_AGE) / 2);
const ageOptions = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 },
  (_, i) => MIN_AGE + i
);
const ITEM_WIDTH = 64;

export default function Register3({ navigation }) {
  const { colors, typography } = useThemeContext();
  const [age, setAge] = useState(DEFAULT_AGE);
  const [inputAge, setInputAge] = useState(String(DEFAULT_AGE));
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  const handleInputChange = (text) => {
    setInputAge(text.replace(/\D/g, ""));
  };

  const handleInputSubmit = () => {
    let num = parseInt(inputAge, 10);
    if (isNaN(num)) num = age;
    if (num < MIN_AGE) num = MIN_AGE;
    if (num > MAX_AGE) num = MAX_AGE;
    setAge(num);
    const index = ageOptions.indexOf(num);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  useEffect(() => {
    const index = ageOptions.indexOf(DEFAULT_AGE);
    flatListRef.current?.scrollToIndex({ index, animated: false });
  }, []);

  return (
    <View style={styles(colors, typography).container}>
      <TouchableOpacity
        style={styles(colors, typography).backButton}
        onPress={() => navigation.goBack()}
      >
        <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
        <Text style={styles(colors, typography).backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles(colors, typography).title}>How old are you?</Text>
      <Text style={styles(colors, typography).subtitle}>
        Age influences your fitness journey. {"\n"}
        Let's make it count.
      </Text>

      <View style={styles(colors, typography).inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles(colors, typography).ageInput}
          value={inputAge}
          keyboardType="numeric"
          maxLength={3}
          onChangeText={handleInputChange}
          onBlur={handleInputSubmit}
          onSubmitEditing={handleInputSubmit}
          returnKeyType="done"
        />

        <FontAwesome5
          name="caret-up"
          size={48}
          color={colors.text.primary}
          style={styles(colors, typography).arrow}
        />
      </View>

      <View style={styles(colors, typography).slider}>
        <Animated.FlatList
          ref={flatListRef}
          data={ageOptions}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          style={{
            flexGrow: 0,
            borderRadius: 24,
          }}
          contentContainerStyle={{
            paddingHorizontal: (width - ITEM_WIDTH) / 2 - ITEM_WIDTH / 2,
            borderRadius: 24,
            backgroundColor: colors.bg.primary,
            styles,
          }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / ITEM_WIDTH);
            const selected = ageOptions[index];
            setAge(selected);
            setInputAge(String(selected));
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            {
              useNativeDriver: false,
              listener: (event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                const index = Math.round(offsetX / ITEM_WIDTH);
                const selected = ageOptions[index];

                if (selected !== age) {
                  setAge(selected);
                  inputRef.current?.setNativeProps({ text: String(selected) });
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

            const centerIndex = ageOptions.indexOf(age);
            let color = colors.text.secondary;
            if (index === centerIndex || Math.abs(index - centerIndex) === 1) {
              color = colors.text.white;
            }

            return (
              <Animated.View
                style={{
                  width: ITEM_WIDTH,
                  height: ITEM_WIDTH * 1.2,
                  alignItems: "center",
                  justifyContent: "center",
                  transform: [{ scale }],
                  opacity,
                }}
              >
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 40,
                    color,
                  }}
                >
                  {item}
                </Text>
              </Animated.View>
            );
          }}
        />
      </View>

      <TouchableOpacity
        style={styles(colors, typography).continueButton}
        onPress={() => navigation.navigate("Register4")}
      >
        <Text style={styles(colors, typography).continueButtonText}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = (colors, typography) =>
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
      ...typography.bodySmall,
      color: colors.text.white,
      marginLeft: 6,
    },
    title: {
      ...typography.primaryXl,
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: "center",
      marginTop: 48,
    },
    subtitle: {
      ...typography.bodyMedium,
      color: colors.text.muted,
      marginBottom: 40,
      textAlign: "center",
    },
    inputContainer: {
      borderRadius: 24,
      paddingVertical: 24,
      paddingHorizontal: 16,
      alignSelf: "center",
      width: "100%",
      maxHeight: 280,
      marginTop: 48,
    },
    ageInput: {
      fontSize: 54,
      color: colors.text.white,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 8,
      borderBottomWidth: 2,
      borderColor: colors.text.primary,
      width: 120,
      alignSelf: "center",
      backgroundColor: "transparent",
      padding: 0,
    },
    arrow: {
      alignSelf: "center",
      marginTop: 8,
    },
    continueButton: {
      position: "absolute",
      bottom: 40,
      left: 0,
      right: 0,
      backgroundColor: colors.bg.primary,
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: "center",
      marginHorizontal: 40,
      marginTop: 24,
    },
    continueButtonText: {
      ...typography.buttonLarge,
      color: colors.text.white,
    },
  });
