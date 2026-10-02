import { useState, useEffect, useRef, useCallback } from 'react';
import type { StreamState, TickMessage, Trend, EventRisk, ForecastPoint } from '@/types/schema';
import { MOCK_PREDICTIONS, MOCK_HISTORIES } from '@/api/mockData';

const WS_BASE = 'ws://localhost:8000/api/v1';

// ─── Default state ────────────────────────────────────────────────────────

function makeInitialState(patientId: string): StreamState {
  const pred = MOCK_PREDICTIONS[patientId];
  const history = MOCK_HISTORIES[patientId] ?? [];
  const lastPoint = history[history.length - 1];
  return {
    isConnected: false,
    isPlaying: false,
    speed: 60,
    simulatedTime: new Date(),
    currentGlucose: lastPoint?.glucose ?? 150,
    trend: 'flat',
    recentReadings: history.slice(-24).map((h) => ({ timestamp: h.timestamp, glucose: h.glucose ?? 150 })),
    eventRisk: pred?.event_risk ?? null,
    forecast: pred?.forecast ?? [],
    lastTick: null,
  };
}

// ─── Glucose simulation (mock fallback) ───────────────────────────────────

function simulateNextGlucose(
  current: number,
  trend: Trend,
  meal: boolean
): { glucose: number; trend: Trend } {
  let delta = trend === 'rising' ? 2.5 : trend === 'falling' ? -1.8 : 0.3;
  delta += (Math.random() - 0.5) * 4; // noise
  if (meal) delta += 18; // meal injection
  const next = Math.max(55, Math.min(360, current + delta));
  const newTrend: Trend =
    delta > 1.5 ? 'rising' : delta < -1.0 ? 'falling' : 'flat';
  return { glucose: Math.round(next), trend: newTrend };
}

function buildEventRisk(glucose: number, trend: Trend): EventRisk {
  const baseProb = glucose > 200 ? 0.75 : glucose > 180 ? 0.45 : glucose > 160 ? 0.2 : 0.08;
  const trendAdj = trend === 'rising' ? 0.15 : trend === 'falling' ? -0.1 : 0;
  const prob = Math.min(1, Math.max(0, baseProb + trendAdj));
  return {
    probability: parseFloat(prob.toFixed(2)),
    severity: prob > 0.7 ? 'high' : prob > 0.35 ? 'moderate' : 'low',
    estimated_minutes_to_event: prob > 0.5 ? Math.round((250 - glucose) / 2.5) : null,
    peak_predicted_mgdl: Math.round(glucose + (trend === 'rising' ? 50 : 15)),
  };
}

function buildForecast(current: number, trend: Trend): ForecastPoint[] {
  const offsets = [15, 30, 45, 60, 75, 90, 105, 120];
  let val = current;
  return offsets.map((offset) => {
    const delta = trend === 'rising' ? 2.0 : trend === 'falling' ? -1.2 : 0.4;
    val = Math.max(60, Math.min(360, val + delta * 15 + (Math.random() - 0.5) * 5));
    const spread = 8 + offset * 0.25;
    return {
      offset_min: offset,
      p50: Math.round(val),
      p10: Math.round(val - spread),
      p90: Math.round(val + spread),
    };
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────

export function usePatientStream(patientId: string) {
  const [state, setState] = useState<StreamState>(() => makeInitialState(patientId));
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bufferRef = useRef<{ timestamp: number; glucose: number }[]>([]);
  const mealPendingRef = useRef(false);
  const throttleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef(60);
  const playingRef = useRef(false);

  // Flush buffer to React state (throttled to ~100ms)
  const flushBuffer = useCallback(() => {
    if (throttleRef.current) return;
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
      const buf = bufferRef.current;
      if (buf.length === 0) return;
      setState((prev) => {
        const last = buf[buf.length - 1];
        const { glucose, trend } = simulateNextGlucose(last.glucose, prev.trend, false);
        return {
          ...prev,
          currentGlucose: last.glucose,
          trend,
          recentReadings: [...prev.recentReadings.slice(-47), ...buf].slice(-48),
          eventRisk: buildEventRisk(last.glucose, prev.trend),
          forecast: buildForecast(last.glucose, prev.trend),
          simulatedTime: new Date(last.timestamp),
          lastTick: {
            type: 'tick',
            timestamp: new Date(last.timestamp).toISOString(),
            patient_id: patientId,
            glucose_mgdl: last.glucose,
            trend,
          },
        };
      });
      bufferRef.current = [];
    }, 100);
  }, [patientId]);

  // Mock simulation tick
  const runMockTick = useCallback(() => {
    setState((prev) => {
      const hasMeal = mealPendingRef.current;
      mealPendingRef.current = false;
      const { glucose, trend } = simulateNextGlucose(prev.currentGlucose, prev.trend, hasMeal);
      const ts = prev.simulatedTime.getTime() + 15 * 60 * 1000; // 15 min per tick
      bufferRef.current.push({ timestamp: ts, glucose });
      return prev; // state flushed via flushBuffer
    });
    flushBuffer();
  }, [flushBuffer]);

  // Start/stop timer based on playing state + speed
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const intervalMs = (15 * 60 * 1000) / speedRef.current; // real ms for 15 simulated min
    timerRef.current = setInterval(runMockTick, Math.max(intervalMs, 100));
  }, [runMockTick]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  // Try WebSocket, fall back to mock
  const connectWebSocket = useCallback(() => {
    try {
      const ws = new WebSocket(`${WS_BASE}/patients/${patientId}/stream`);
      wsRef.current = ws;

      ws.onopen = () => setState((p) => ({ ...p, isConnected: true }));
      ws.onmessage = (e) => {
        try {
          const msg: TickMessage = JSON.parse(e.data);
          if (msg.type === 'tick' && msg.glucose_mgdl) {
            bufferRef.current.push({ timestamp: Date.now(), glucose: msg.glucose_mgdl });
            flushBuffer();
          }
        } catch { /* ignore parse errors */ }
      };
      ws.onerror = () => {
        // Silently fall back to mock simulation
        ws.close();
      };
      ws.onclose = () => {
        setState((p) => ({ ...p, isConnected: false }));
        wsRef.current = null;
        // If playing, keep mock simulation going
        if (playingRef.current) startTimer();
      };
    } catch {
      // WebSocket not available, use mock
    }
  }, [patientId, flushBuffer, startTimer]);

  // Reset when patient changes
  useEffect(() => {
    stopTimer();
    bufferRef.current = [];
    playingRef.current = false;
    setState(makeInitialState(patientId));
  }, [patientId, stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      wsRef.current?.close();
      if (throttleRef.current) clearTimeout(throttleRef.current);
    };
  }, [stopTimer]);

  // ─── Public Controls ─────────────────────────────────────────────────

  const play = useCallback(() => {
    playingRef.current = true;
    connectWebSocket();
    startTimer();
    setState((p) => ({ ...p, isPlaying: true }));
  }, [connectWebSocket, startTimer]);

  const pause = useCallback(() => {
    playingRef.current = false;
    stopTimer();
    wsRef.current?.close();
    setState((p) => ({ ...p, isPlaying: false, isConnected: false }));
  }, [stopTimer]);

  const setSpeed = useCallback((speed: number) => {
    speedRef.current = speed;
    setState((p) => ({ ...p, speed }));
    if (playingRef.current) startTimer(); // restart with new interval
  }, [startTimer]);

  const injectMeal = useCallback((_carbs_g: number) => {
    mealPendingRef.current = true;
  }, []);

  return { state, play, pause, setSpeed, injectMeal };
}
