import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Animated,
} from "react-native";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ActionButton, HeaderBlock } from "../../../global/components/UIElements";
import { FontAwesome5 } from "@expo/vector-icons";
import { saveData, getData } from "../../../global/utils/storage";

const { width } = Dimensions.get("window");
const MIN_AGE = 13;
const MAX_AGE = 99;
const DEFAULT_AGE = 25;
const ageOptions = Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i);
const ITEM_WIDTH = 64;

export default function Register3({ navigation }) {
  const { colors, typography } = useThemeContext();

  const [age, setAge] = useState(null); // Initialize as null instead of DEFAULT_AGE
  const [inputAge, setInputAge] = useState("");
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Load age data from storage when the screen loads
  const loadData = async () => {
    const savedData = await getData("registrationData");
    if (savedData && savedData.age) {
      setAge(savedData.age);
      setInputAge(String(savedData.age));
    } else {
      setAge(DEFAULT_AGE); // Set default age if no saved data exists
      setInputAge(String(DEFAULT_AGE));
    }
  };

  // Save data to storage whenever the age is updated
  const saveAgeData = async (newAge) => {
    const previousData = await getData("registrationData");
    const finalData = {
      ...previousData,
      age: newAge,
    };

    // Wait for a small delay before saving to AsyncStorage
    setTimeout(async () => {
      await saveData("registrationData", finalData);
    }, 100); // 100ms delay, adjust as needed
  };

  const handleInputChange = (text) => {
    setInputAge(text.replace(/\D/g, ""));
  };

  const handleInputSubmit = () => {
    let num = parseInt(inputAge, 10);
    if (isNaN(num)) num = age;
    if (num < MIN_AGE) num = MIN_AGE;
    if (num > MAX_AGE) num = MAX_AGE;
    setAge(num);
    saveAgeData(num); // Save to storage whenever age is updated
    const index = ageOptions.indexOf(num);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  useEffect(() => {
    loadData(); // Load age from storage when the component first mounts
  }, []); // Only load once when the component is first mounted

  useEffect(() => {
    if (age !== null) {
      const index = ageOptions.indexOf(age);
      flatListRef.current?.scrollToIndex({ index, animated: false });
      saveAgeData(age); // Save age data when the component mounts
    }
  }, [age]); // Scroll to the selected age when it changes

  useEffect(() => {
    if (age !== DEFAULT_AGE && age !== null) { // Save data only if the age has changed from the default and is not null
      saveAgeData(age);
    }
  }, [age]); // Save age data when the `age` value changes
  
  const getItemLayout = (_, index) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  const onScrollToIndexFailed = (error) => {
    // Handle the error in case the index is out of bounds (nothing for now)
    console.log('Scroll to index failed', error);
  };

  return (
    <View style={styles(colors, typography).container}>
      <BackButton onPress={() => navigation.goBack()} />

      <HeaderBlock
        title={"How old are you?"}
        subtitle={"Age influences your fitness journey.\nLet's get it right!"}
      />

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
          contentContainerStyle={{
            paddingHorizontal: (width - ITEM_WIDTH) / 2 - 24,
            backgroundColor: colors.bg.primary,
          }}
          style={{
            borderRadius: 24
          }}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
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
          onScrollToIndexFailed={onScrollToIndexFailed}
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

      <ActionButton
        text="Continue"
        onPress={() => navigation.navigate("Register4")}
      />
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
    slider: {
      marginTop: 12,
      marginBottom: 24,
    },
  });
