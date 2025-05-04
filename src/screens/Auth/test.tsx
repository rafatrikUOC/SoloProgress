import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    TextInput,
} from "react-native";
import { useThemeContext } from "../../services/ThemeContext";
import { FontAwesome5 } from "@expo/vector-icons";

const MIN_AGE = 13;
const MAX_AGE = 80;
const ITEM_WIDTH = 60;
const DEFAULT_AGE = Math.floor((MIN_AGE + MAX_AGE) / 2);

export default function Register3({ navigation }) {
    const { colors, typography } = useThemeContext();
    const [age, setAge] = useState(DEFAULT_AGE);
    const [inputAge, setInputAge] = useState(String(DEFAULT_AGE));
    const flatListRef = useRef(null);
    const ages = Array.from(
        { length: MAX_AGE - MIN_AGE + 1 },
        (_, i) => MIN_AGE + i
    );

    const scrollToAge = (targetAge, animated = true) => {
        const index = targetAge - MIN_AGE;
        if (flatListRef.current) {
            try {
                //flatListRef.current.scrollToIndex({index, animated, viewPosition: 0.5});
            } catch (error) {
                console.warn("Error scrolling to index:", error);
            }
        }
    };

    useEffect(() => {
        //scrollToAge(DEFAULT_AGE, false);
    }, []);

    useEffect(() => {
        //scrollToAge(age);
        //setInputAge(String(age));
    }, [age]);

    const handleInputChange = (text) => {
        setInputAge(text.replace(/\D/g, ""));
    };

    const handleInputSubmit = () => {
        let num = parseInt(inputAge, 10);
        if (isNaN(num)) num = age;
        if (num < MIN_AGE) num = MIN_AGE;
        if (num > MAX_AGE) num = MAX_AGE;
        setAge(num);
        //setTimeout(() => scrollToAge(num), 0);
    };

    const renderItem = ({ item }) => {
        const distance = Math.abs(item - age);
        let style = styles(colors, typography).valueText;
        if (distance === 0) style = styles(colors, typography).valueTextSelected;
        else if (distance === 1) style = styles(colors, typography).valueTextMid;

        return (
            <TouchableOpacity
                style={styles(colors, typography).sliderValue}
                onPress={() => {
                    setAge(item);
                    scrollToAge(item);
                }}
                activeOpacity={0.8}
            >
                {item === age && (
                    <View style={styles(colors, typography).verticalLine} />
                )}
                <Text style={style}>{item}</Text>
                {item === age && (
                    <View style={styles(colors, typography).verticalLine} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles(colors, typography).container}>
            {/* Back button */}
            <TouchableOpacity
                style={styles(colors, typography).backButton}
                onPress={() => navigation.goBack()}
            >
                <FontAwesome5 name="chevron-left" size={16} color={colors.text.white} />
                <Text style={styles(colors, typography).backText}>Back</Text>
            </TouchableOpacity>

            {/* Title and subtitle */}
            <Text style={styles(colors, typography).title}>How old are you?</Text>
            <Text style={styles(colors, typography).subtitle}>
                Age influences your fitness journey. Let's make it count.
            </Text>

            {/* Editable age and caret-up */}
            <View style={styles(colors, typography).ageDisplayContainer}>
                <TextInput
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
            ...typography.launchTitle,
            color: colors.text.primary,
            marginBottom: 8,
            textAlign: "center",
            marginTop: 24,
        },
        subtitle: {
            ...typography.bodyMedium,
            color: colors.text.muted,
            marginBottom: 40,
            textAlign: "center",
        },
        ageDisplayContainer: {
            alignItems: "center",
            marginBottom: 8,
            flexDirection: "column",
            justifyContent: "center",
        },
        ageInput: {
            fontSize: 54,
            color: colors.text.white,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: 1,
            borderBottomWidth: 2,
            borderColor: colors.text.primary,
            width: 120,
            alignSelf: "center",
            backgroundColor: "transparent",
            padding: 0,
        },
        arrow: {
            marginBottom: 16,
            alignSelf: "center",
        },
        sliderContainer: {
            width: "100%",
            height: 80,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 40,
            position: "relative",
            overflow: "visible",
            borderRadius: 18,
            backgroundColor: colors.text.primary,
        },
        sliderBg: {
            position: "absolute",
            left: 0,
            right: 0,
            top: 10,
            height: 60,
            borderRadius: 18,
            alignSelf: "center",
            zIndex: -1,
        },
        sliderValue: {
            width: ITEM_WIDTH,
            alignItems: "center",
            justifyContent: "center",
        },
        valueText: {
            ...typography.primaryMd,
            color: colors.text.secondary,
            opacity: 0.3,
            fontSize: 24,
        },
        valueTextMid: {
            ...typography.primaryLg,
            color: colors.text.white,
            opacity: 0.7,
            fontSize: 32,
            fontWeight: "600",
        },
        valueTextSelected: {
            color: colors.text.white,
            fontWeight: "bold",
            fontSize: 44,
            opacity: 1,
        },
        verticalLine: {
            width: 2,
            height: 32,
            backgroundColor: colors.text.primary,
            marginHorizontal: 2,
            borderRadius: 2,
        },
        continueButton: {
            backgroundColor: colors.text.primary,
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
