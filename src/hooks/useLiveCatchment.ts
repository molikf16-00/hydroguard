import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_CATCHMENT_CONFIG } from "../config/catchmentConfig";
import { fetchLiveCatchmentData, LiveCatchmentState } from "../utils/openMeteo";
import { cacheAgeMinutes } from "../utils/dataQuality";

export function useLiveCatchment() {
  const [data, setData] = useState<LiveCatchmentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    try {
      let result: LiveCatchmentState;
      if (import.meta.env.VITE_DATA_MODE === "server") {
        const response = await fetch("/api/catchment", {
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(45000),
          ]),
        });
        if (!response.ok)
          throw new Error(
            "Live collection is unavailable. Please retry shortly.",
          );
        result = await response.json();
        if (
          !result.fetchedAtIso ||
          !Array.isArray(result.villages) ||
          !result.riskScore
        )
          throw new Error("Invalid server response.");
      } else {
        result = await fetchLiveCatchmentData(
          DEFAULT_CATCHMENT_CONFIG,
          controller.signal,
        );
      }
      if (cacheAgeMinutes(result.fetchedAtIso) === null)
        throw new Error("Data has expired. A fresh response is required.");
      if (!controller.signal.aborted) {
        setNow(Date.now());
        setData(result);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setData(null);
        setError(err instanceof Error ? err.message : "Live data unavailable.");
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      if (!document.hidden) void refresh();
    }, 600000);
    const clock = setInterval(() => setNow(Date.now()), 30000);
    const resume = () => {
      if (!document.hidden) void refresh();
    };
    window.addEventListener("online", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      request.current?.abort();
      clearInterval(timer);
      clearInterval(clock);
      window.removeEventListener("online", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [refresh]);
  const age = data ? cacheAgeMinutes(data.fetchedAtIso, now) : null;
  return {
    data: age === null ? null : data,
    loading,
    error:
      data && age === null
        ? "Data has expired. Refresh to retrieve current values."
        : error,
    refresh,
    age: Math.round(age ?? 0),
  };
}
