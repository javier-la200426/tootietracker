import type { IntensityLevel } from '../types';
import { useStealthMode } from '../contexts/StealthContext';

export function useFartIntensity() {
  const { isSecretMode } = useStealthMode();

  const getIntensity = (durationMs: number): IntensityLevel => {
    if (durationMs >= 10000) return '🌌'; // Cosmic fart (10+ seconds)
    if (durationMs >= 5000) return '🌪️'; // Tornado fart (5.0-9.9 seconds)
    if (durationMs >= 2000) return '💥'; // Epic fart (2.0-4.9 seconds)
    if (durationMs >= 1200) return '🔥'; // Strong fart (1.2-2.0 seconds)
    if (durationMs >= 600) return '💨'; // Medium fart (0.6-1.2 seconds)
    if (durationMs >= 100) return '🌬️'; // Light fart (0.1-0.6 seconds)
    return '🌬️'; // Light fart (<0.1 seconds)
  };

  const getIntensityLabel = (durationMs: number): string => {
    if (isSecretMode) {
      if (durationMs >= 10000) return 'Epic Task';
      if (durationMs >= 5000) return 'Major Task';
      if (durationMs >= 2000) return 'Big Task';
      if (durationMs >= 1200) return 'Medium Task';
      if (durationMs >= 600) return 'Quick Task';
      if (durationMs >= 100) return 'Brief Task';
      return 'Brief Task';
    } else {
      if (durationMs >= 10000) return 'Cosmic Fart';
      if (durationMs >= 5000) return 'Tornado Fart';
      if (durationMs >= 2000) return 'Epic Fart';
      if (durationMs >= 1200) return 'Strong Fart';
      if (durationMs >= 600) return 'Medium Fart';
      if (durationMs >= 100) return 'Light Fart';
      return 'Light Fart';
    }
  };

  const getIntensityColor = (durationMs: number): string => {
    if (isSecretMode) {
      if (durationMs >= 10000) return 'text-blue-600'; // Epic
      if (durationMs >= 5000) return 'text-indigo-600';  // Major
      if (durationMs >= 2000) return 'text-cyan-500';     // Big
      if (durationMs >= 1200) return 'text-sky-500';  // Medium
      if (durationMs >= 600) return 'text-blue-400';     // Quick
      if (durationMs >= 100) return 'text-slate-500';    // Brief
      return 'text-slate-500'; // Brief for <0.1 s too
    } else {
      if (durationMs >= 10000) return 'text-purple-600'; // Cosmic
      if (durationMs >= 5000) return 'text-indigo-600';  // Tornado
      if (durationMs >= 2000) return 'text-red-500';     // Epic
      if (durationMs >= 1200) return 'text-orange-500';  // Strong
      if (durationMs >= 600) return 'text-blue-500';     // Medium
      if (durationMs >= 100) return 'text-green-500';    // Light
      return 'text-green-500'; // Light for <0.1 s too
    }
  };

  return { getIntensity, getIntensityLabel, getIntensityColor };
}