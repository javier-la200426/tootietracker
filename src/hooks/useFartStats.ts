import { useMemo } from 'react';
import { useFartStore } from '../store/fartStore';

export function useFartStats() {
  const events = useFartStore((state) => state.events);

  const stats = useMemo(() => {
    if (events.length === 0) {
      return {
        totalFarts: 0,
        todaysFarts: 0,
        weeklyFarts: 0,
        averageDuration: 0,
        longestFart: 0,
        streak: 0,
        dailyData: [],
        weeklyData: [],
        // Gas ladder stats
        units: 0,
        tier: 'balloon' as const,
        count: 0,
        fillPercent: 0,
        // Smell stats
        averageSmell: 0,
        smellDistribution: { fresh: 0, light: 0, meh: 0, stinky: 0, toxic: 0 },
        stinkiestDay: null,
        freshestDay: null,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todaysFarts = events.filter(event => 
      new Date(event.timestamp) >= today
    ).length;

    const weeklyFarts = events.filter(event => 
      new Date(event.timestamp) >= weekAgo
    ).length;

    const totalDuration = events.reduce((sum, event) => sum + event.durationMs, 0);
    const averageDuration = Math.round(totalDuration / events.length);
    const longestFart = Math.max(...events.map(event => event.durationMs));

    // Calculate streak (consecutive days with at least one fart)
    let streak = 0;
    const currentDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      
      const hasEventThisDay = events.some(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= dayStart && eventDate < dayEnd;
      });
      
      if (hasEventThisDay) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Generate daily data for the past week
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= date && eventDate < nextDate;
      }).length;
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
      });
    }

    // Gas Ladder System - sum durations and compute units
    const weeklyEvents = events.filter(event => 
      new Date(event.timestamp) >= weekAgo
    );
    
    const totalSeconds = weeklyEvents.reduce((sum, e) => sum + e.durationMs / 1000, 0);
    const units = parseFloat(totalSeconds.toFixed(1)); // Keep 1 decimal place

    // Determine tier
    const tier =
      units <= 5   ? 'balloon'  :
      units <= 10  ? 'bike'     :
      units <= 18  ? 'soccer'   :
      units <= 30  ? 'basket'   :
      units <= 50  ? 'car'      :
      units <= 99  ? 'cow'      :
      units <= 199 ? 'hippo'    : 'elephant';

    // Compute counts per tier
    const counts = {
      balloon:  Math.floor(units),
      bike:     Math.max(1, Math.floor((units - 5)  / 5)),
      soccer:   Math.max(1, Math.floor((units - 10) / 8)),
      basket:   Math.max(1, Math.floor((units - 18) / 12)),
      car:      Math.max(1, Math.floor((units - 30) / 20)),
      cow:      Math.max(1, Math.floor((units - 50) / 50)),
      hippo:    Math.max(1, Math.floor((units - 100) / 100)),
      elephant: Math.max(1, Math.floor(units / 200)),
    };

    // Fill % calculation for progress animation
    let fillPercent = 0;
    if (tier === 'balloon') {
      fillPercent = Math.min((units / 5) * 100, 100);
    } else if (tier === 'bike') {
      const progress = (units - 5) % 5;
      fillPercent = (progress / 5) * 100;
    } else if (tier === 'soccer') {
      const progress = (units - 10) % 8;
      fillPercent = (progress / 8) * 100;
    } else if (tier === 'basket') {
      const progress = (units - 18) % 12;
      fillPercent = (progress / 12) * 100;
    } else if (tier === 'car') {
      const progress = (units - 30) % 20;
      fillPercent = (progress / 20) * 100;
    } else if (tier === 'cow') {
      const progress = (units - 50) % 50;
      fillPercent = (progress / 50) * 100;
    } else if (tier === 'hippo') {
      const progress = (units - 100) % 100;
      fillPercent = (progress / 100) * 100;
    } else { // elephant
      const progress = units % 200;
      fillPercent = (progress / 200) * 100;
    }

    // Smell Statistics
    const eventsWithSmell = events.filter(event => event.smellIntensity);
    
    let averageSmell = 0;
    const smellDistribution = { fresh: 0, light: 0, meh: 0, stinky: 0, toxic: 0 };
    
    if (eventsWithSmell.length > 0) {
      const totalSmellLevel = eventsWithSmell.reduce((sum, event) => 
        sum + (event.smellIntensity?.level || 0), 0
      );
      averageSmell = parseFloat((totalSmellLevel / eventsWithSmell.length).toFixed(1));
      
      // Calculate smell distribution
      eventsWithSmell.forEach(event => {
        const smellId = event.smellIntensity?.id;
        if (smellId && smellId in smellDistribution) {
          smellDistribution[smellId as keyof typeof smellDistribution]++;
        }
      });
    }

    // Find stinkiest and freshest days
    let stinkiestDay = null;
    let freshestDay = null;
    let maxDaySmell = 0;
    let minDaySmell = 6; // Higher than max possible

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= date && eventDate < nextDate && event.smellIntensity;
      });
      
      if (dayEvents.length > 0) {
        const avgDaySmell = dayEvents.reduce((sum, event) => 
          sum + (event.smellIntensity?.level || 0), 0
        ) / dayEvents.length;
        
        if (avgDaySmell > maxDaySmell) {
          maxDaySmell = avgDaySmell;
          stinkiestDay = date.toLocaleDateString('en-US', { weekday: 'long' });
        }
        
        if (avgDaySmell < minDaySmell) {
          minDaySmell = avgDaySmell;
          freshestDay = date.toLocaleDateString('en-US', { weekday: 'long' });
        }
      }
    }

    return {
      totalFarts: events.length,
      todaysFarts,
      weeklyFarts,
      averageDuration,
      longestFart,
      streak,
      dailyData,
      weeklyData: dailyData,
      // Gas ladder stats
      units,
      tier,
      count: counts[tier as keyof typeof counts],
      fillPercent,
      // Smell stats
      averageSmell,
      smellDistribution,
      stinkiestDay,
      freshestDay,
    };
  }, [events]);

  return stats;
}