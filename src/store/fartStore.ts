import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FartEvent, AppSettings, FoodTrigger, Trigger, Preset, SmellIntensity, Location } from '../types';

interface FartStore {
  events: FartEvent[];
  settings: AppSettings;
  
  // Event actions
  addEvent: (event: Omit<FartEvent, 'id'>) => string;
  updateEventTriggers: (eventId: string, triggers: Trigger[], smellIntensity?: SmellIntensity | null) => void;
  updateEventLocation: (eventId: string, location: Location) => void;
  deleteEvent: (id: string) => void;
  clearAllEvents: () => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  addTrigger: (trigger: Omit<FoodTrigger, 'id'>) => void;
  removeTrigger: (id: string) => void;
  
  // Smart trigger actions
  addCustomTrigger: (trigger: Omit<Trigger, 'id' | 'count'>) => void;
  incrementTriggerCount: (triggerId: string) => void;
  addPreset: (preset: Omit<Preset, 'id'>) => void;
  removePreset: (id: string) => void;
  getTopTriggers: (limit?: number) => Trigger[];
  getSmartSuggestion: () => Trigger | null;
}

const defaultTriggers: FoodTrigger[] = [
  { id: '1', name: 'Beans', emoji: '🫘' },
  { id: '2', name: 'Broccoli', emoji: '🥦' },
  { id: '3', name: 'Onions', emoji: '🧅' },
  { id: '4', name: 'Dairy', emoji: '🥛' },
  { id: '5', name: 'Spicy Food', emoji: '🌶️' },
];

// Convert default triggers to trackable triggers format
const defaultTrackableTriggers: Trigger[] = [
  { id: '1', label: 'Beans', emoji: '🫘', count: 0 },
  { id: '2', label: 'Broccoli', emoji: '🥦', count: 0 },
  { id: '3', label: 'Onions', emoji: '🧅', count: 0 },
  { id: '4', label: 'Dairy', emoji: '🥛', count: 0 },
  { id: '5', label: 'Spicy Food', emoji: '🌶️', count: 0 },
];

export const useFartStore = create<FartStore>()(
  persist(
    (set, get) => ({
      events: [],
      settings: {
        soundEffects: true,
        darkMode: false,
        triggers: defaultTriggers,
        customTriggers: defaultTrackableTriggers,
        presets: [],
      },

      addEvent: (eventData) => {
        const newEvent: FartEvent = {
          id: crypto.randomUUID(),
          ...eventData,
        };
        console.log('Adding new event in store:', newEvent); // Debug log
        set((state) => {
          const updatedEvents = [newEvent, ...state.events].slice(0, 1000);
          console.log('Events after addEvent:', updatedEvents.map(e => e.id)); // Debug log
          return {
            events: updatedEvents,
          };
        });
        // Return the ID so it can be used by the caller
        return newEvent.id;
      },

      updateEventTriggers: (eventId, triggers, smellIntensity) => {
        console.log('updateEventTriggers called with eventId:', eventId); // Debug log
        set((state) => {
          const updatedEvents = state.events.map((event) => {
            if (event.id === eventId) {
              const updatedEvent = { 
                ...event, 
                triggers,
                ...(smellIntensity ? { smellIntensity } : {})
              };
              console.log('Updated event:', updatedEvent); // Debug log
              return updatedEvent;
            }
            return event;
          });
          console.log('All updated events after updateEventTriggers:', updatedEvents.map(e => e.id)); // Debug log
          return { events: updatedEvents };
        });
        // Increment trigger counts
        triggers.forEach((trigger) => {
          get().incrementTriggerCount(trigger.id);
        });
      },

      updateEventLocation: (eventId, location) => {
        set((state) => {
          const updatedEvents = state.events.map((event) => {
            if (event.id === eventId) {
              return { ...event, location };
            }
            return event;
          });
          return { events: updatedEvents };
        });
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },

      clearAllEvents: () => {
        set({ events: [] });
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      addTrigger: (triggerData) => {
        const newTrigger: FoodTrigger = {
          ...triggerData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          settings: {
            ...state.settings,
            triggers: [...state.settings.triggers, newTrigger],
          },
        }));
      },

      removeTrigger: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            triggers: state.settings.triggers.filter((trigger) => trigger.id !== id),
          },
        }));
      },

      addCustomTrigger: (triggerData) => {
        const newTrigger: Trigger = {
          ...triggerData,
          id: crypto.randomUUID(),
          count: 0,
        };
        set((state) => ({
          settings: {
            ...state.settings,
            customTriggers: [...(state.settings.customTriggers || []), newTrigger],
          },
        }));
      },

      incrementTriggerCount: (triggerId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            customTriggers: (state.settings.customTriggers || []).map((trigger) =>
              trigger.id === triggerId
                ? { ...trigger, count: (trigger.count || 0) + 1 }
                : trigger
            ),
          },
        }));
      },

      addPreset: (presetData) => {
        const newPreset: Preset = {
          ...presetData,
          id: crypto.randomUUID(),
        };
        set((state) => ({
          settings: {
            ...state.settings,
            presets: [...state.settings.presets, newPreset],
          },
        }));
      },

      removePreset: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            presets: state.settings.presets.filter((preset) => preset.id !== id),
          },
        }));
      },

      getTopTriggers: (limit = 3) => {
        const customTriggers = get().settings.customTriggers || [];
        return customTriggers
          .filter((trigger) => (trigger.count || 0) > 0)
          .sort((a, b) => (b.count || 0) - (a.count || 0))
          .slice(0, limit);
      },

      getSmartSuggestion: () => {
        const { events } = get();
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        // Get all triggers from events in the past week
        const recentTriggers: { [key: string]: number } = {};
        
        events
          .filter((event) => new Date(event.timestamp) >= weekAgo)
          .forEach((event) => {
            event.triggers?.forEach((trigger) => {
              recentTriggers[trigger.id] = (recentTriggers[trigger.id] || 0) + 1;
            });
          });

        // Check if there are any recent triggers before calling reduce
        const triggerIds = Object.keys(recentTriggers);
        if (triggerIds.length === 0) {
          return null;
        }

        // Find the most frequent trigger
        const topTriggerId = triggerIds.reduce((a, b) =>
          recentTriggers[a] > recentTriggers[b] ? a : b
        );

        if (!topTriggerId) return null;

        // Find the trigger object
        const customTriggers = get().settings.customTriggers || [];
        return customTriggers.find((trigger) => trigger.id === topTriggerId) || null;
      },
    }),
    {
      name: 'fart-tracker-storage',
    }
  )
);