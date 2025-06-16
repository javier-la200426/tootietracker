import type { FartEvent, FoodTrigger } from '../types';

// Future API service stubs - ready for Supabase integration
export class ApiService {
  static async fetchEvents(): Promise<FartEvent[]> {
    // TODO: Replace with actual Supabase call
    // return supabase.from('fart_events').select('*').order('timestamp', { ascending: false });
    throw new Error('API not implemented - using local storage');
  }

  static async saveEvent(event: Omit<FartEvent, 'id'>): Promise<FartEvent> {
    // TODO: Replace with actual Supabase call
    // return supabase.from('fart_events').insert([event]).select().single();
    throw new Error('API not implemented - using local storage');
  }

  static async deleteEvent(id: string): Promise<void> {
    // TODO: Replace with actual Supabase call
    // return supabase.from('fart_events').delete().eq('id', id);
    throw new Error('API not implemented - using local storage');
  }

  static async fetchTriggers(): Promise<FoodTrigger[]> {
    // TODO: Replace with actual Supabase call
    throw new Error('API not implemented - using local storage');
  }

  static async saveTrigger(trigger: Omit<FoodTrigger, 'id'>): Promise<FoodTrigger> {
    // TODO: Replace with actual Supabase call
    throw new Error('API not implemented - using local storage');
  }
}