import { useCallback } from "react";
import { getSkippedSessions, setSkippedSession } from "../services/trainingSessionService";

export default function useSkipSession(userId) {
  const handleSkip = useCallback(async (splitId, sessionIndex) => {
    if (!userId || !splitId || sessionIndex === undefined) return;
    
    try {
      await setSkippedSession(userId, {
        split: splitId,
        session: sessionIndex
      });
      return true;
    } catch (error) {
      console.error("Error skipping session:", error);
      return false;
    }
  }, [userId]);

  const getCurrentSkips = useCallback(async () => {
    if (!userId) return [];
    return await getSkippedSessions(userId);
  }, [userId]);

  return { handleSkip, getCurrentSkips };
}
