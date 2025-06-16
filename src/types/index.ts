export interface FartEvent {
  id: string;
  timestamp: Date;
  durationMs: number;
  triggers?: Trigger[];
  smellIntensity?: SmellIntensity;
}

export interface SmellIntensity {
  id: string;
  label: string;
  emoji: string;
  level: number; // 1-5 scale
}

export interface Trigger {
  id: string;
  label: string;
  emoji: string;
  count?: number; // For tracking usage frequency
}

export interface Preset {
  id: string;
  name: string;
  triggers: Trigger[];
  emoji: string;
}

export interface FoodTrigger {
  id: string;
  name: string;
  emoji: string;
}

export interface AppSettings {
  soundEffects: boolean;
  darkMode: boolean;
  triggers: FoodTrigger[];
  customTriggers: Trigger[];
  presets: Preset[];
}

export type IntensityLevel = '💭' | '🌬️' | '💨' | '🔥' | '💥' | '🌪️' | '🌌';