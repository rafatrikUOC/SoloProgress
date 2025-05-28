import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  View,
  Animated
} from "react-native";
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { fetchExercises } from "../services/exerciseService";
import { ExerciseCard } from "../components/ExerciseCard";
import { ScreenTitle, ActionButton } from "../../../global/components/UIElements";
import MuscleIcon from "../../../global/components/MuscleIcon";

const categories = ["Balance","Calisthenics","Cardio","Conditioning","Flexibility","Strength"];
const muscles = ["Abs","Back","Biceps","Calves","Chest","Forearms","Hamstrings","Hips","Neck","Quadriceps","Shoulders","Thighs","Triceps"];

export default function ExercisesScreen({ navigation, route }) {
  const { colors, typography } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // For scroll indicator fade
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadExercises() {
      setLoading(true);
      const data = await fetchExercises();
      setExercises(data);
      setLoading(false);
    }
    loadExercises();
  }, []);

  // 1. Reset scren on focus
  useFocusEffect(
    useCallback(() => {
      resetScreen();
    }, [])
  );

  // 2. Reset screen on tab press
  useEffect(() => {
    if (route.params?.reset) {
      resetScreen();
      // Clear the param so it doesn't trigger again
      navigation.setParams({ reset: undefined });
    }
  }, [route.params?.reset]);

  // 3. Function to reset screen on focus (tab and navigation)
  function resetScreen() {
    setShowResults(false);
    setSelectedCategory(null);
    setSelectedMuscle(null);
    setSearchTerm("");
    setSearchResults([]);
  }

  function filterExercises() {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory
        ? Array.isArray(exercise.type)
          ? exercise.type
            .map((cat) => cat && cat.toLowerCase().trim())
            .includes(selectedCategory.toLowerCase().trim())
          : false
        : true;

      const matchesMuscle = selectedMuscle
        ? (exercise.primary_muscle || "")
          .toLowerCase()
          .trim() === selectedMuscle.toLowerCase().trim()
        : true;

      return matchesSearch && matchesCategory && matchesMuscle;
    });
  }

  const categoryIcons = {
    Balance: (
      <MaterialCommunityIcons name="human-female-dance" size={20} color={colors.text.white} />
    ),
    Calisthenics: (
      <FontAwesome5 name="child" size={20} color={colors.text.white} />
    ),
    Cardio: (
      <MaterialCommunityIcons name="run" size={20} color={colors.text.white} />
    ),
    Conditioning: (
      <MaterialCommunityIcons name="weight-lifter" size={20} color={colors.text.white} />
    ),
    Flexibility: (
      <MaterialCommunityIcons name="yoga" size={20} color={colors.text.white} />
    ),
    Strength: (
      <MaterialCommunityIcons name="arm-flex" size={20} color={colors.text.white} />
    ),
  };

  function renderCategoryFilter({ item: category }) {
    const isSelected = selectedCategory === category;
    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.filterButton,
          {
            borderColor: isSelected ? colors.text.primary : colors.border,
          },
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : category)}
        activeOpacity={0.7}
      >
        {categoryIcons[category]}
        <Text
          style={[
            typography.bodyMedium,
            {
              color: isSelected ? colors.text.primary : colors.text.white,
              fontWeight: "600",
              marginLeft: 8,
            },
          ]}
        >
          {category}
        </Text>
      </TouchableOpacity>
    );
  }

  function renderMuscleFilter({ item: muscle }) {
    const isSelected = selectedMuscle === muscle;
    return (
      <TouchableOpacity
        key={muscle}
        style={[
          styles.filterButton,
          {
            borderColor: isSelected ? colors.text.primary : colors.border,
          },
        ]}
        onPress={() => setSelectedMuscle(isSelected ? null : muscle)}
        activeOpacity={0.7}
      >
        <MuscleIcon muscle={muscle} size={20} />
        <Text
          style={[
            typography.bodyMedium,
            {
              color: isSelected ? colors.text.primary : colors.text.white,
              fontWeight: "600",
              marginLeft: 8,
            },
          ]}
        >
          {muscle}
        </Text>
      </TouchableOpacity>
    );
  }

  const handleSearch = () => {
    setSearchResults(filterExercises());
    setShowResults(true);
  };

  const handleBackToFilters = () => {
    setShowResults(false);
    setSelectedCategory(null);
    setSelectedMuscle(null);
    setSearchTerm("");
  };

  // Determine button text based on filters/search
  const isAnyFilter =
    !!searchTerm.trim() || !!selectedCategory || !!selectedMuscle;
  const actionButtonText = isAnyFilter
    ? "Show filtered exercises"
    : "Show all exercises";

  // Styles inside the component for theme access
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      marginTop: -32,
      paddingHorizontal: 24,
    },
    searchInput: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 24,
      fontSize: 16,
      backgroundColor: colors.card,
      color: colors.text.white,
    },
    sectionTitle: {
      marginBottom: 12,
      fontWeight: "600",
      color: colors.text.primary,
      fontSize: 18,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      margin: 6,
      width: "47%",
      alignSelf: "center",
      minWidth: 120,
      maxWidth: "48%",
      justifyContent: "flex-start",
      backgroundColor: colors.card,
    },
    actionButtonWrapper: {
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 8,
      zIndex: 10,
    },
    scrollContent: {
      paddingBottom: 32,
      paddingTop: 24,
      paddingHorizontal: 0,
    },
    fadeTop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 18,
      zIndex: 2,
      pointerEvents: "none",
      opacity: fadeOpacity,
      backgroundColor: colors.body,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    resultsContainer: {
      flex: 1,
      backgroundColor: colors.body,
      marginTop: 24,
    },
    noResultsText: {
      color: colors.text.white,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 40,
      ...typography.bodyMedium,
    },
  });

  // Animated fade for scroll indicator
  const fadeOpacity = scrollY.interpolate({
    inputRange: [0, 16],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      {!showResults ? (
        <>
          <View style={{ height: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <View style={{
              width: 40,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.text.muted,
              opacity: 0.35,
            }} />
          </View>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingHorizontal: 0 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          >
            <ScreenTitle title="Exercises" />

            <TextInput
              placeholder="Search exercises"
              placeholderTextColor={colors.text.white}
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              autoCorrect={false}
              autoCapitalize="none"
            />

            <Text style={styles.sectionTitle}>Filter by Category</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryFilter}
              keyExtractor={(item) => item}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              scrollEnabled={false}
              style={{ marginBottom: 24 }}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            />

            <Text style={styles.sectionTitle}>Filter by Muscle</Text>
            <FlatList
              data={muscles}
              renderItem={renderMuscleFilter}
              keyExtractor={(item) => item}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              scrollEnabled={false}
              style={{ marginBottom: 24 }}
              contentContainerStyle={{ paddingHorizontal: 0 }}
            />
            <View style={{ height: 80 }} />
          </ScrollView>
          <View style={styles.actionButtonWrapper}>
            <ActionButton
              text={actionButtonText}
              onPress={handleSearch}
              disabled={loading}
            />
          </View>
        </>
      ) : (
        <View style={styles.resultsContainer}>
          <ScreenTitle title="Exercises" />
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ExerciseCard
                exercise={item}
                onPress={() => navigation.navigate("Exercise", { exerciseId: item.id })}
                onMenuPress={(exercise) => {/* handle menu */ }}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 0 }}
            ListEmptyComponent={
              loading ? (
                <ActivityIndicator size="large" color={colors.text.primary} />
              ) : (
                <Text style={styles.noResultsText}>No exercises found.</Text>
              )
            }
          />
          <View style={styles.actionButtonWrapper}>
            <ActionButton
              text="Back to filters"
              onPress={handleBackToFilters}
            />
          </View>
        </View>
      )}
    </View>
  );
}
