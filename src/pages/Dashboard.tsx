import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Target, Flame, Wind, DoorClosed as Nose } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { WeeklyChart, TriggerChart, SmellChart, SmellTrendChart } from '../components/Charts';
import { TierReveal } from '../components/TierReveal';
import { useFartStats } from '../hooks/useFartStats';

export function Dashboard() {
  const stats = useFartStats();
  const [showTierReveal, setShowTierReveal] = useState(false);
  const [lastSeenTier, setLastSeenTier] = useState<string | null>(null);

  // Define tier hierarchy for proper comparison
  const tierOrder = ['balloon', 'bike', 'soccer', 'basket', 'car', 'cow', 'hippo', 'elephant'];

  const isHigherTier = (currentTier: string, previousTier: string): boolean => {
    const currentIndex = tierOrder.indexOf(currentTier);
    const previousIndex = tierOrder.indexOf(previousTier);
    return currentIndex > previousIndex;
  };

  // Check if user has reached a new tier (only show animation for upgrades)
  useEffect(() => {
    const storedTier = localStorage.getItem('lastSeenTier');
    const storedUnits = localStorage.getItem('lastSeenUnits');
    
    // Always update localStorage with current values first
    localStorage.setItem('lastSeenTier', stats.tier);
    localStorage.setItem('lastSeenUnits', stats.units.toString());
    
    if (stats.units > 0) {
      // Only show animation if:
      // 1. This is the first time seeing any tier, OR
      // 2. Current tier is genuinely higher than the stored tier
      const isFirstTime = !storedTier;
      const isTierUpgrade = storedTier && isHigherTier(stats.tier, storedTier);
      
      if (isFirstTime || isTierUpgrade) {
        setLastSeenTier(storedTier);
        setShowTierReveal(true);
      }
    }
  }, [stats.tier, stats.units]);

  const handleTierRevealComplete = () => {
    setShowTierReveal(false);
    // localStorage is already updated in useEffect, no need to update here
  };

  const getTierDisplay = () => {
    const { tier, count, fillPercent, units } = stats;
    
    // Don't show anything if no units
    if (units === 0) {
      return {
        title: "Start tracking to see your progress!",
        showAnimation: false,
        fillPercent: 0,
        emoji: '💨',
        mysteryText: null,
      };
    }
    
    const tierConfig = {
      balloon: { emoji: '🎈', name: 'balloon', description: 'balloon' },
      bike: { emoji: '🚲', name: 'bike tire', description: 'bike tire' },
      soccer: { emoji: '⚽', name: 'soccer ball', description: 'soccer ball' },
      basket: { emoji: '🏀', name: 'basketball', description: 'basketball' },
      car: { emoji: '🚗', name: 'car tire', description: 'car tire' },
      cow: { emoji: '🐄', name: 'cow', description: 'cow (gas equivalent)' },
      hippo: { emoji: '🦛', name: 'hippo', description: 'hippo (gas equivalent)' },
      elephant: { emoji: '🐘', name: 'elephant', description: 'elephant (gas equivalent)' },
    };

    const config = tierConfig[tier as keyof typeof tierConfig];
    const plural = count > 1 ? 's' : '';
    
    // Create mystery text based on progress
    let mysteryText = null;
    if (fillPercent < 25) {
      mysteryText = "Something bigger is coming... 🌟";
    } else if (fillPercent < 50) {
      mysteryText = "You're getting closer to something amazing! ✨";
    } else if (fillPercent < 75) {
      mysteryText = "Almost there... the next level awaits! 🚀";
    } else if (fillPercent < 95) {
      mysteryText = "So close! One more push to unlock the next tier! 🔥";
    } else {
      mysteryText = "You're about to discover something incredible! 💫";
    }
    
    // Special messaging for animals vs objects
    const isAnimal = ['cow', 'hippo', 'elephant'].includes(tier);
    const titleText = isAnimal 
      ? `Gas equivalent of ${count} ${config.name}${plural} this week!`
      : `${config.emoji} ${count} ${config.name}${plural} this week!`;
    
    return {
      title: titleText,
      showAnimation: true,
      fillPercent,
      emoji: config.emoji,
      name: config.name,
      description: config.description,
      mysteryText: tier !== 'elephant' ? mysteryText : "You've reached the ultimate tier! 👑",
    };
  };

  const tierDisplay = getTierDisplay();

  // Get smell insights
  const getSmellInsight = () => {
    if (stats.averageSmell === 0) return null;
    
    const smellLabels = ['', 'Fresh', 'Light', 'Meh', 'Stinky', 'Toxic'];
    const avgLabel = smellLabels[Math.round(stats.averageSmell)] || 'Unknown';
    
    let insight = '';
    if (stats.averageSmell <= 2) {
      insight = "You're keeping it fresh! 😇";
    } else if (stats.averageSmell <= 3) {
      insight = "Pretty mild overall! 😊";
    } else if (stats.averageSmell <= 4) {
      insight = "Getting a bit stinky! 😬";
    } else {
      insight = "Whew, that's potent! 🤢";
    }
    
    return { avgLabel, insight };
  };

  const smellInsight = getSmellInsight();

  return (
    <>
      {/* Tier Reveal Modal - Only for upgrades */}
      {showTierReveal && stats.units > 0 && (
        <TierReveal
          tier={stats.tier}
          emoji={tierDisplay.emoji}
          name={tierDisplay.name}
          description={tierDisplay.description}
          count={stats.count}
          onComplete={handleTierRevealComplete}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 pb-20"
      >
        <div className="max-w-md mx-auto px-4 pt-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Stats</h1>
            <p className="text-gray-600">Track your gaseous achievements</p>
          </motion.div>

          {/* Gas Ladder Progress */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm mb-6"
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                {tierDisplay.title}
              </p>
              
              {tierDisplay.showAnimation && (
                <>
                  {/* Progress Animation - same style for all tiers */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-blue-300 opacity-30"></div>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"
                      initial={{ scale: 0.3 }}
                      animate={{ scale: 0.3 + (tierDisplay.fillPercent / 100) * 0.7 }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                    ></motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl">{tierDisplay.emoji}</span>
                    </div>
                  </div>

                  {/* Mystery Progress Text */}
                  {tierDisplay.mysteryText && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="space-y-2"
                    >
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <motion.div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${tierDisplay.fillPercent}%` }}
                          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <p className="text-sm font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                        {tierDisplay.mysteryText}
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Smell Insight Card */}
          {smellInsight && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 shadow-sm mb-6"
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Nose size={20} className="text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Smell Report</h3>
                </div>
                <p className="text-purple-700 font-medium mb-1">
                  Average: {smellInsight.avgLabel} ({stats.averageSmell}/5)
                </p>
                <p className="text-gray-600 text-sm">{smellInsight.insight}</p>
                {stats.stinkiestDay && stats.freshestDay && (
                  <div className="mt-3 text-xs text-gray-500">
                    <p>🤢 Stinkiest: {stats.stinkiestDay}</p>
                    <p>😇 Freshest: {stats.freshestDay}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title="Today's Farts"
              value={stats.todaysFarts}
              icon={Activity}
              color="text-purple-600"
              delay={0.3}
            />
            <StatCard
              title="Current Streak"
              value={`${stats.streak} days`}
              icon={Flame}
              color="text-orange-600"
              delay={0.4}
            />
            <StatCard
              title="Average Duration"
              value={`${(stats.averageDuration / 1000).toFixed(1)}s`}
              icon={Target}
              color="text-blue-600"
              delay={0.5}
            />
            <StatCard
              title="Longest Fart"
              value={`${(stats.longestFart / 1000).toFixed(1)}s`}
              icon={TrendingUp}
              color="text-green-600"
              delay={0.6}
            />
          </div>

          {/* Charts */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="space-y-6"
          >
            <WeeklyChart />
            <SmellChart />
            <SmellTrendChart />
            <TriggerChart />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}