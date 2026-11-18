"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "./api";
import { AppState } from "./types";

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getState();
      setState(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Failed to fetch platform state");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, loading, error, refresh };
}
