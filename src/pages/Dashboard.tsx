import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Target, Flame, Wind, DoorClosed as Nose, CheckSquare, BarChart } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { TriggerChart, SmellChart } from '../components/Charts';
import { TierReveal } from '../components/TierReveal';
import { useFartStats } from '../hooks/useFartStats';
import { useStealthMode } from '../contexts/StealthContext';
import EChartsActivity from '../components/EChartsActivity';
import EChartsSmell from '../components/EChartsSmell';

export function Dashboard() {
  const { isSecretMode } = useStealthMode();
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
        emoji: isSecretMode ? '✅' : '💨',
        name: isSecretMode ? 'task' : 'fart',
        description: isSecretMode ? 'task tracking' : 'gas tracking',
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

    // Transform for stealth mode
    const stealthTierConfig = {
      balloon: { emoji: '📝', name: 'note', description: 'note completion' },
      bike: { emoji: '📋', name: 'checklist', description: 'checklist completion' },
      soccer: { emoji: '📊', name: 'report', description: 'report completion' },
      basket: { emoji: '📈', name: 'presentation', description: 'presentation completion' },
      car: { emoji: '🎯', name: 'project', description: 'project completion' },
      cow: { emoji: '🏆', name: 'achievement', description: 'achievement (effort equivalent)' },
      hippo: { emoji: '🎖️', name: 'medal', description: 'medal (effort equivalent)' },
      elephant: { emoji: '👑', name: 'crown', description: 'crown (effort equivalent)' },
    };

    const config = isSecretMode ? stealthTierConfig[tier as keyof typeof stealthTierConfig] : tierConfig[tier as keyof typeof tierConfig];
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
    
    // Special messaging for animals vs objects (or achievements vs tasks in stealth mode)
    const isAnimal = ['cow', 'hippo', 'elephant'].includes(tier);
    const titleText = isAnimal 
      ? isSecretMode
        ? `Effort equivalent of ${count} ${config.name}${plural} this week!`
        : `Gas equivalent of ${count} ${config.name}${plural} this week!`
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

  // Get smell/difficulty insights
  const getSmellInsight = () => {
    if (stats.averageSmell === 0) return null;
    
    const smellLabels = isSecretMode 
      ? ['', 'Easy', 'Simple', 'Medium', 'Hard', 'Extreme']
      : ['', 'Fresh', 'Light', 'Meh', 'Stinky', 'Toxic'];
    const avgLabel = smellLabels[Math.round(stats.averageSmell)] || 'Unknown';
    
    let insight = '';
    if (isSecretMode) {
      if (stats.averageSmell <= 2) {
        insight = "You're keeping it simple! 😇";
      } else if (stats.averageSmell <= 3) {
        insight = "Pretty manageable overall! 😊";
      } else if (stats.averageSmell <= 4) {
        insight = "Getting challenging! 😬";
      } else {
        insight = "Whew, that's intense! 🤢";
      }
    } else {
      if (stats.averageSmell <= 2) {
        insight = "You're keeping it fresh! 😇";
      } else if (stats.averageSmell <= 3) {
        insight = "Pretty mild overall! 😊";
      } else if (stats.averageSmell <= 4) {
        insight = "Getting a bit stinky! 😬";
      } else {
        insight = "Whew, that's potent! 🤢";
      }
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
        className={`min-h-screen pb-20 ${
          isSecretMode 
            ? 'bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900' 
            : 'bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900'
        }`}
      >
        <div className="max-w-md mx-auto px-4 pt-8">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              {isSecretMode ? 'Your Analytics' : 'Your Stats'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isSecretMode 
                ? 'Track your productive achievements' 
                : 'Track your gaseous achievements'
              }
            </p>
          </motion.div>

          {/* Gas Ladder Progress / Achievement Progress */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6"
          >
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                {tierDisplay.title}
              </p>
              
              {tierDisplay.showAnimation && (
                <>
                  {/* Progress Animation - same style for all tiers */}
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full ${
                      isSecretMode 
                        ? 'bg-gradient-to-br from-blue-200 to-indigo-300 dark:from-blue-700 dark:to-indigo-800' 
                        : 'bg-gradient-to-br from-purple-200 to-blue-300 dark:from-purple-700 dark:to-blue-800'
                    } opacity-30`}></div>
                    <motion.div
                      className={`absolute inset-0 rounded-full ${
                        isSecretMode 
                          ? 'bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600' 
                          : 'bg-gradient-to-br from-purple-400 to-blue-500 dark:from-purple-500 dark:to-blue-600'
                      }`}
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
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                        <motion.div
                          className={`${
                            isSecretMode 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                              : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          } h-2 rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${tierDisplay.fillPercent}%` }}
                          transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <p className={`text-sm font-medium text-transparent bg-clip-text ${
                        isSecretMode 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400' 
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400'
                      }`}>
                        {tierDisplay.mysteryText}
                      </p>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>

          {/* Smell/Difficulty Insight Card */}
          {smellInsight && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className={`${
                isSecretMode 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-2 border-blue-200 dark:from-blue-800 dark:to-indigo-800 dark:border-blue-700' 
                  : 'bg-gradient-to-r from-pink-100 to-purple-100 border-2 border-purple-200 dark:from-pink-800 dark:to-purple-800 dark:border-purple-700'
              } rounded-xl p-6 shadow-sm mb-6`}
            >
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  {isSecretMode ? <BarChart size={20} className="text-blue-600 dark:text-blue-400" /> : <Nose size={20} className="text-purple-600 dark:text-purple-400" />}
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {isSecretMode ? 'Difficulty Report' : 'Smell Report'}
                  </h3>
                </div>
                <p className={`${
                  isSecretMode ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
                } font-medium mb-1`}>
                  Average: {smellInsight.avgLabel} ({stats.averageSmell}/5)
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{smellInsight.insight}</p>
                {stats.stinkiestDay && stats.freshestDay && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <p>{isSecretMode ? '🎯 Hardest' : '🤢 Stinkiest'}: {stats.stinkiestDay}</p>
                    <p>{isSecretMode ? '😇 Easiest' : '😇 Freshest'}: {stats.freshestDay}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title={isSecretMode ? "Today's Tasks" : "Today's Farts"}
              value={stats.todaysFarts}
              icon={isSecretMode ? CheckSquare : Activity}
              color={isSecretMode ? "text-blue-600" : "text-purple-600"}
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
              title={isSecretMode ? "Longest Task" : "Longest Fart"}
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
            <EChartsActivity />
            <SmellChart />
            <EChartsSmell />
            <TriggerChart />
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}