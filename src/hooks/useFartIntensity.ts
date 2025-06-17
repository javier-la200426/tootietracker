import type { IntensityLevel } from '../types';

export function useFartIntensity() {
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
    if (durationMs >= 10000) return 'Cosmic Fart';
    if (durationMs >= 5000) return 'Tornado Fart';
    if (durationMs >= 2000) return 'Epic Fart';
    if (durationMs >= 1200) return 'Strong Fart';
    if (durationMs >= 600) return 'Medium Fart';
    if (durationMs >= 100) return 'Light Fart';
    return 'Light Fart';
  };

  const getIntensityColor = (durationMs: number): string => {
    if (durationMs >= 10000) return 'text-purple-600'; // Cosmic
    if (durationMs >= 5000) return 'text-indigo-600';  // Tornado
    if (durationMs >= 2000) return 'text-red-500';     // Epic
    if (durationMs >= 1200) return 'text-orange-500';  // Strong
    if (durationMs >= 600) return 'text-blue-500';     // Medium
    if (durationMs >= 100) return 'text-green-500';    // Light
    return 'text-green-500'; // Light for <0.1 s too
  };

  return { getIntensity, getIntensityLabel, getIntensityColor };
}