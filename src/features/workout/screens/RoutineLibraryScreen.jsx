import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { BackButton, ScreenTitle } from "../../../global/components/UIElements";
import { UserContext } from "../../../global/contexts/UserContext";
import { supabase } from "../../../global/services/supabaseService";

export default function RoutineLibraryScreen({ navigation }) {
  const { colors, typography } = useThemeContext();
  const { user } = useContext(UserContext);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNonCustomSplits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("TrainingSplits")
          .select("*")
          .eq("is_custom", false)
          .order("title", { ascending: true });

        if (error) throw error;
        setSplits(data || []);
      } catch (error) {
        console.error("Error fetching splits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNonCustomSplits();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.body,
      padding: 24,
    },
    sectionTitle: {
      color: colors.text.white,
      ...typography.primaryMd,
      fontWeight: "bold",
      marginBottom: 12,
      marginTop: 20,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 18,
      minHeight: 120,
      marginBottom: 12,
      alignItems: "center",
      flexDirection: "column",
      position: "relative",
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 38,
      height: 38,
    },
    cardContent: {
      alignItems: "center",
      width: "100%",
    },
    cardTitle: {
      color: colors.text.white,
      ...typography.primaryMd,
      fontWeight: "bold",
      marginBottom: 4,
      textAlign: "center",
    },
    cardSubtitle: {
      color: colors.text.muted,
      ...typography.primarySm,
      fontWeight: "500",
      textAlign: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton onPress={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenTitle title="Routine Library" />

        {/* Section: Available routines */}
        <Text style={styles.sectionTitle}>Available Routines</Text>
        
        {splits.length === 0 ? (
          <Text style={styles.cardSubtitle}>No routines available</Text>
        ) : (
          splits.map((split) => (
            <TouchableOpacity
              key={split.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate("RoutineInfo", { split_id: split.id })}
            >
              <View style={styles.iconContainer}>
                <FontAwesome5 name="dumbbell" size={24} color={colors.text.muted} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{split.title}</Text>
                <Text style={styles.cardSubtitle}>
                  {split.description || "No description available"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}