import { useState, useEffect } from "react";
import { getNextWorkoutForUser } from "../services/trainingSessionService";

// React hook to fetch and track the user's next workout, based on both completed and skipped sessions.
export default function useNextWorkout(user, isFocused) {
  const [nextWorkout, setNextWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchNext() {
      setLoading(true);
      const next = await getNextWorkoutForUser(user);
      if (mounted) {
        setNextWorkout(next);
        setLoading(false);
      }
    }
    if (user && isFocused) {
      fetchNext();
    } else {
      setNextWorkout(null);
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [user, isFocused]);

  return { nextWorkout, loading };
}
