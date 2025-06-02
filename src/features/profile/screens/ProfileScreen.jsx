import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { supabase } from "../../../global/services/supabaseService";
import { UserContext } from "../../../global/contexts/UserContext";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useThemeContext } from "../../../global/contexts/ThemeContext";
import { capitalizeFirstLetter } from "../../../global/components/Normalize";

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(UserContext);
  const { colors } = useThemeContext();

  const [measurements, setMeasurements] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.body },
    scrollContent: { padding: 24, paddingTop: 30, paddingBottom: 40 },
    logoutBtn: {
      position: "absolute",
      top: 36,
      right: 24,
      zIndex: 100,
      backgroundColor: colors.body,
      borderRadius: 24,
      padding: 6,
      elevation: 6,
      shadowColor: colors.shadow,
      shadowOpacity: 0.13,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: 20,
      marginBottom: 10,
      marginTop: 14,
      color: colors.text.white,
    },
    infoCard: {
      borderRadius: 14,
      padding: 14,
      marginBottom: 18,
      backgroundColor: colors.card,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },
    infoLabel: {
      fontWeight: "bold",
      fontSize: 15,
      color: colors.text.muted,
    },
    infoValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text.white,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      alignSelf: "flex-start",
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      backgroundColor: colors.bg.primary,
    },
    addBtnText: {
      fontWeight: "bold",
      fontSize: 15,
      marginLeft: 4,
      color: colors.text.white,
    },
    lastUpdateText: {
      color: colors.text.muted,
      fontSize: 13,
      marginBottom: 2,
      fontStyle: "italic",
    },
    sessionsScroll: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 10,
    },
    sessionCard: {
      borderRadius: 12,
      padding: 14,
      marginRight: 14,
      minWidth: 220,
      elevation: 2,
      backgroundColor: colors.card,
    },
    sessionDate: {
      fontWeight: "bold",
      fontSize: 16,
      marginLeft: 8,
      marginBottom: 4,
      color: colors.text.white,
    },
    sessionStat: {
      fontSize: 13,
      marginTop: 2,
      color: colors.text.white,
    },
    sessionStatValue: {
      fontWeight: "bold",
      color: colors.text.white,
    },
    sessionCardSmall: {
      borderRadius: 8,
      padding: 10,
      marginRight: 10,
      minWidth: 120,
      alignItems: "center",
      elevation: 1,
      backgroundColor: colors.card,
    },
    sessionDateSmall: {
      fontWeight: "bold",
      fontSize: 13,
      marginBottom: 2,
      color: colors.text.white,
    },
    sessionStatSmall: {
      fontSize: 12,
      color: colors.text.white,
    },
    mutedText: {
      color: colors.text.muted,
    }
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (!user?.info?.id) return;

      // Fetch last 10 measurements
      const { data: measurementsData } = await supabase
        .from("Measurements")
        .select("*")
        .eq("user_id", user.info.id)
        .order("date", { ascending: false })
        .limit(10);

      setMeasurements(measurementsData || []);

      // Fetch last 10 sessions, only finished
      const { data: sessionsData } = await supabase
        .from("TrainingSessions")
        .select("id, start_time, end_time, volume, calories_burned")
        .eq("user_id", user.info.id)
        .not("end_time", "is", null)
        .order("start_time", { ascending: false })
        .limit(10);

      setSessions(sessionsData || []);
      setLoading(false);
    }
    fetchData();
  }, [user?.info?.id]);

  // Logout logic
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser({ info: null, settings: null, split: null });
    navigation.replace("Auth");
  };

  // Show "Coming soon" alert for all WIP features
  const launchWorkInProgress = () => {
    Alert.alert(
      "Coming soon",
      "This feature will be available in a future update."
    );
  };

  // Format date and time
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration as Xm Ys
  const formatDuration = (start, end) => {
    if (!start || !end) return "-";
    const s = new Date(start);
    const e = new Date(end);
    const secs = Math.floor((e - s) / 1000);
    const m = Math.floor(secs / 60);
    const sRem = secs % 60;
    return `${m}m ${sRem}s`;
  };

  // Helper to prettify measurement keys and add units
  const prettifyMeasurement = (key, value) => {
    switch (key) {
      case "weight_kg":
        return ["Weight", `${value} kg`];
      case "weight_lb":
        return ["Weight", `${value} lb`];
      case "height_cm":
        return ["Height", `${value} cm`];
      case "height_ft":
        return ["Height", `${value} ft`];
      case "age":
      case "Age":
        return ["Age", `${value} years`];
      default:
        // Capitalize first letter and show value as is
        return capitalizeFirstLetter(value);
    }
  };

  // User info rows
  const infoRows = [
    { label: "Username", value: user?.info?.username || "-" },
    { label: "Email", value: user?.info?.email || "-" },
    { label: "Gender", value: user?.info?.gender || "-" },
    user?.info?.age ? { label: "Age", value: `${user.info.age} years` } : null,
    user?.info?.height ? { label: "Height", value: `${user.info.height} cm` } : null,
    user?.info?.weight ? { label: "Weight", value: `${user.info.weight} kg` } : null,
    { label: "Goal", value: user?.settings?.fitness_goal || "-" },
    { label: "Routine", value: user?.split?.title || "-" },
    { label: "Duration", value: user?.split?.duration || "-" },
    { label: "Days per week", value: user?.split?.days_per_week || "-" },
    { label: "Sessions per week", value: user?.split?.sessions?.toString() || "-" },
  ].filter(Boolean);

  // Group measurements by date
  const measurementsByDate = measurements.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  // Get last update date for measurements
  const lastMeasurementDate = measurements.length > 0 ? measurements[0].date : null;

  return (
    <View style={styles.container}>
      {/* Logout button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <FontAwesome5 name="power-off" size={22} color={colors.text.danger} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User info section */}
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.infoCard}>
          {infoRows.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.infoRow}
              onPress={launchWorkInProgress}
              activeOpacity={0.7}
            >
              <Text style={styles.infoLabel}>{item.label}:</Text>
              <Text style={styles.infoValue}>{item.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Measurements section */}
        <Text style={styles.sectionTitle}>Measurements</Text>
        <View style={styles.infoCard}>
          {measurements.length === 0 && (
            <Text style={styles.infoValue}>No measurements yet.</Text>
          )}
          {lastMeasurementDate && (
            <Text style={styles.lastUpdateText}>
              Last update: {formatDate(lastMeasurementDate)}
            </Text>
          )}
          {Object.keys(measurementsByDate).map((date) => (
            <View key={date} style={{ marginBottom: 10 }}>
              {measurementsByDate[date].map((m, idx) => {
                const [prettyKey, prettyValue] = prettifyMeasurement(m.key, m.value);
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.infoRow}
                    onPress={launchWorkInProgress}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.infoLabel}>{prettyKey}:</Text>
                    <Text style={styles.infoValue}>{prettyValue}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={launchWorkInProgress}
          >
            <MaterialIcons name="add" size={20} color={colors.text.white} />
            <Text style={styles.addBtnText}>Add measurement</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Sessions section */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sessionsScroll}
        >
          {loading ? (
            <Text style={styles.infoValue}>Loading...</Text>
          ) : sessions.length === 0 ? (
            <Text style={styles.infoValue}>No sessions yet.</Text>
          ) : (
            sessions.slice(0, 2).map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.sessionCard}
                onPress={launchWorkInProgress}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <MaterialIcons name="fitness-center" size={22} color={colors.text.primary} />
                  <Text style={styles.sessionDate}>{formatDate(s.start_time)}</Text>
                </View>
                <Text style={styles.sessionStat}>
                  Duration: <Text style={styles.sessionStatValue}>{formatDuration(s.start_time, s.end_time)}</Text>
                </Text>
                <Text style={styles.sessionStat}>
                  Volume: <Text style={styles.sessionStatValue}>{s.volume ? `${s.volume} kg` : "-"}</Text>
                </Text>
                <Text style={styles.sessionStat}>
                  Calories: <Text style={styles.sessionStatValue}>{s.calories_burned ? `${s.calories_burned} kcal` : "-"}</Text>
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
        {/* Horizontal scroller for all last 10 sessions */}
        {sessions.length > 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.sessionsScroll}
          >
            {sessions.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.sessionCardSmall}
                onPress={launchWorkInProgress}
                activeOpacity={0.7}
              >
                <Text style={styles.sessionDateSmall}>{formatDate(s.start_time)}</Text>
                <Text style={styles.sessionStatSmall}>
                  {formatDuration(s.start_time, s.end_time)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}
