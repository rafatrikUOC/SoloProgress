import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";

// Dummy data for demonstration
const EXERCISE_DATA = {
    name: "Incline Dumbbell Press",
    image: "https://www.bodybuilding.com/images/2021/july/incline-dumbbell-fly-700x700.jpg",
    instructions: [
        "Lie back on an incline bench with a dumbbell in each hand.",
        "Press the weights above your chest, arms extended.",
        "Lower the dumbbells slowly to chest level.",
        "Push the weights back up to the starting position.",
        "Repeat for the desired number of reps."
    ],
    target: {
        primary: { name: "Chest" },
        secondary: [
            { name: "Shoulders" },
            { name: "Triceps" }
        ]
    },
    equipment: [
        {
            name: "Dumbbells",
            image: "https://img.icons8.com/ios-filled/100/000000/dumbbell.png"
        },
        {
            name: "Flat bench",
            image: "https://img.icons8.com/ios-filled/100/000000/bench-press-with-bar.png"
        }
    ]
};

const TABS = [
    { key: "instructions", label: "Instructions" },
    { key: "target", label: "Target" },
    { key: "equipment", label: "Equipment" }
];

export default function ExerciseScreen({ navigation, route }) {
    // const { exerciseId } = route.params; // Use this to fetch real data
    const { colors } = useThemeContext();
    const insets = useSafeAreaInsets();
    const [selectedTab, setSelectedTab] = useState("instructions");

    // For demo, use dummy data
    const exercise = EXERCISE_DATA;

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.body,
        },
        scroll: {
            paddingBottom: 32,
        },
        imageWrapper: {
            width: "100%",
            aspectRatio: 1.3,
            backgroundColor: "#222",
            position: "relative",
            marginBottom: 16,
        },
        exerciseImage: {
            width: "100%",
            height: "100%",
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
        },
        sectionLabel: {
            color: colors.text.muted,
            fontSize: 15,
            fontWeight: "600",
            marginLeft: 18,
            marginBottom: 2,
            marginTop: 8,
        },
        exerciseName: {
            color: colors.text.primary,
            fontSize: 24,
            fontWeight: "bold",
            marginLeft: 18,
            marginBottom: 16,
        },
        tabsRow: {
            flexDirection: "row",
            marginHorizontal: 12,
            marginBottom: 16,
            borderRadius: 12,
            backgroundColor: colors.card,
            overflow: "hidden",
        },
        tabButton: {
            flex: 1,
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        tabText: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text.muted,
        },
        tabTextActive: {
            color: colors.text.primary,
        },
        tabActive: {
            backgroundColor: colors.cardActive,
        },
        instructionsList: {
            paddingHorizontal: 18,
        },
        instructionStep: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginBottom: 14,
        },
        stepNumber: {
            color: colors.text.primary,
            fontWeight: "bold",
            fontSize: 16,
            marginRight: 10,
            marginTop: 1,
        },
        stepText: {
            color: colors.text.white,
            fontSize: 16,
            flex: 1,
        },
        targetSection: {
            paddingHorizontal: 18,
        },
        targetTitle: {
            color: colors.text.muted,
            fontWeight: "600",
            fontSize: 15,
            marginBottom: 6,
            marginTop: 10,
        },
        muscleRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
            marginLeft: 4,
        },
        muscleNameLarge: {
            color: colors.text.white,
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 18,
        },

        muscleIcon: {
            marginRight: 10,
        },
        muscleName: {
            color: colors.text.white,
            fontSize: 16,
            fontWeight: "bold",
        },
        secondaryMusclesList: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: 2,
        },
        equipmentSection: {
            paddingHorizontal: 18,
        },
        equipmentList: {
            marginTop: 8,
        },
        equipmentRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 14,
        },
        equipmentImage: {
            width: 38,
            height: 38,
            borderRadius: 8,
            marginRight: 12,
            backgroundColor: "#333",
        },
        equipmentName: {
            color: colors.text.white,
            fontSize: 16,
            fontWeight: "bold",
        },
        noEquipment: {
            color: colors.text.muted,
            fontSize: 16,
            marginTop: 12,
            marginLeft: 2,
        },
    });

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.scroll}>
                {/* Imagen y Back */}
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: exercise.image }}
                        style={styles.exerciseImage}
                        resizeMode="cover"
                    />
                    <BackButton light onPress={() => navigation.goBack()} />
                </View>

                {/* Video & instructions label */}
                <Text style={styles.sectionLabel}>Video & instructions</Text>
                {/* Nombre del ejercicio */}
                <Text style={styles.exerciseName}>{exercise.name}</Text>

                {/* Tabs */}
                <View style={styles.tabsRow}>
                    {TABS.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tabButton,
                                selectedTab === tab.key && styles.tabActive,
                            ]}
                            onPress={() => setSelectedTab(tab.key)}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    selectedTab === tab.key && styles.tabTextActive,
                                ]}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab content */}
                {selectedTab === "instructions" && (
                    <View style={styles.instructionsList}>
                        {exercise.instructions.map((step, idx) => (
                            <View style={styles.instructionStep} key={idx}>
                                <Text style={styles.stepNumber}>{idx + 1}.</Text>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {selectedTab === "target" && (
                    <View style={styles.targetSection}>
                        <Text style={styles.targetTitle}>Primary muscle</Text>
                        <View style={styles.muscleRow}>
                            <MuscleIcon muscle={exercise.target.primary.name} size={48} />
                            <Text style={styles.muscleNameLarge}>{exercise.target.primary.name}</Text>
                        </View>

                        <Text style={[styles.targetTitle, { marginTop: 18 }]}>Secondary muscles</Text>
                        {exercise.target.secondary.length === 0 ? (
                            <Text style={styles.muscleNameLarge}>None</Text>
                        ) : (
                            exercise.target.secondary.map((muscle, idx) => (
                                <View style={styles.muscleRow} key={idx}>
                                    <MuscleIcon muscle={muscle.name} size={40} />
                                    <Text style={styles.muscleNameLarge}>{muscle.name}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {selectedTab === "equipment" && (
                    <View style={styles.equipmentSection}>
                        {(!exercise.equipment || exercise.equipment.length === 0) ? (
                            <Text style={styles.noEquipment}>No equipment required</Text>
                        ) : (
                            exercise.equipment.map((item, idx) => (
                                <View style={styles.muscleRow} key={idx}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: "#333" }}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.muscleNameLarge}>{item.name}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
