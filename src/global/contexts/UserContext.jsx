import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../services/supabaseService";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    info: null,     // Datos de la tabla Users
    settings: null, // Datos de la tabla UserSettings
    split: null,    // Rutina seleccionada (TrainingSplits)
  });
  const [loading, setLoading] = useState({
    info: false,
    settings: false,
    split: false,
  });
  const [error, setError] = useState({
    info: null,
    settings: null,
    split: null,
  });

  // Fetch user info from Users table
  const fetchUserInfo = async (authUser) => {
    if (!authUser?.email) {
      setUser(u => ({ ...u, info: null }));
      return;
    }
    setLoading(l => ({ ...l, info: true }));
    setError(e => ({ ...e, info: null }));
    try {
      const { data, error } = await supabase
        .from("Users")
        .select("*")
        .eq("email", authUser.email)
        .single();
      if (error) throw error;
      setUser(u => ({ ...u, info: data }));
    } catch (err) {
      setUser(u => ({ ...u, info: null }));
      setError(e => ({ ...e, info: err.message || "Error fetching user info" }));
    } finally {
      setLoading(l => ({ ...l, info: false }));
    }
  };

  // Fetch user settings
  const fetchUserSettings = async (userId) => {
    setLoading(l => ({ ...l, settings: true }));
    setError(e => ({ ...e, settings: null }));
    try {
      const { data, error } = await supabase
        .from("UserSettings")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error) throw error;
      setUser(u => ({ ...u, settings: data }));
    } catch (err) {
      setUser(u => ({ ...u, settings: null }));
      setError(e => ({ ...e, settings: err.message || "Error fetching user settings" }));
    } finally {
      setLoading(l => ({ ...l, settings: false }));
    }
  };

  // Fetch selected split/routine
  const fetchUserSplit = async (splitId) => {
    if (!splitId) {
      setUser(u => ({ ...u, split: null }));
      return;
    }
    setLoading(l => ({ ...l, split: true }));
    setError(e => ({ ...e, split: null }));
    try {
      const { data, error } = await supabase
        .from("TrainingSplits")
        .select("*")
        .eq("id", splitId)
        .single();
      if (error) throw error;
      setUser(u => ({ ...u, split: data }));
    } catch (err) {
      setUser(u => ({ ...u, split: null }));
      setError(e => ({ ...e, split: err.message || "Error fetching split" }));
    } finally {
      setLoading(l => ({ ...l, split: false }));
    }
  };

  // Get session and listen to auth changes
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        fetchUserInfo(session.user);
      } else {
        setUser(u => ({ ...u, info: null, settings: null, split: null }));
      }
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserInfo(session.user);
      } else {
        setUser(u => ({ ...u, info: null, settings: null, split: null }));
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Fetch user settings whenever user.info changes
  useEffect(() => {
    if (user.info?.id) {
      fetchUserSettings(user.info.id);
    } else {
      setUser(u => ({ ...u, settings: null, split: null }));
    }
  }, [user.info?.id]);

  // Fetch split whenever user.settings.selected_routine changes
  useEffect(() => {
    if (user.settings?.selected_routine) {
      fetchUserSplit(user.settings.selected_routine);
    } else {
      setUser(u => ({ ...u, split: null }));
    }
  }, [user.settings?.selected_routine]);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      loading,
      error,
      refetchUserInfo: () => user.info?.email && fetchUserInfo({ email: user.info.email }),
      refetchUserSettings: () => user.info?.id && fetchUserSettings(user.info.id),
      refetchUserSplit: () => user.settings?.selected_routine && fetchUserSplit(user.settings.selected_routine),
    }}>
      {children}
    </UserContext.Provider>
  );
};
