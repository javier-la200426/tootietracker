import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { useStealthMode } from '../contexts/StealthContext';

interface TierRevealProps {
  tier: string;
  emoji: string;
  name: string;
  description: string;
  count: number;
  onComplete: () => void;
}

export function TierReveal({ tier, emoji, name, description, count, onComplete }: TierRevealProps) {
  const { isSecretMode } = useStealthMode();
  const [showConfetti, setShowConfetti] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    
    // Show continue button after 4 seconds
    const buttonTimer = setTimeout(() => {
      setShowContinueButton(true);
    }, 4000);

    // Auto-close after 15 seconds if user doesn't click
    const autoCloseTimer = setTimeout(() => {
      onComplete();
    }, 15000);

    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [onComplete]);

  const getTierMessage = () => {
    if (isSecretMode) {
      const messages = {
        balloon: "Welcome to the Productivity Ladder! 📝",
        bike: "Level Up! You're completing checklists! 📋",
        soccer: "Amazing! You've reached report-level productivity! 📊",
        basket: "Incredible! Presentation-level work achieved! 📈",
        car: "Wow! You're completing major projects now! 🎯",
        cow: "Legendary! Achievement-level productivity! 🏆",
        hippo: "Epic! Medal-worthy productivity! 🎖️",
        elephant: "ULTIMATE! Crown-level productivity mastery! 👑"
      };
      return messages[tier as keyof typeof messages] || "New level unlocked!";
    } else {
      const messages = {
        balloon: "Welcome to the Gas Ladder! 🎈",
        bike: "Level Up! You're pumping bike tires! 🚲",
        soccer: "Amazing! You've reached soccer ball power! ⚽",
        basket: "Incredible! Basketball-level gas achieved! 🏀",
        car: "Wow! You're inflating car tires now! 🚗",
        cow: "Legendary! Cow-level gas power! 🐄",
        hippo: "Epic! Hippo-sized gas power! 🦛",
        elephant: "ULTIMATE! Elephant-level gas mastery! 🐘"
      };
      return messages[tier as keyof typeof messages] || "New level unlocked!";
    }
  };

  const getSubMessage = () => {
    const isAnimal = ['cow', 'hippo', 'elephant'].includes(tier);
    
    if (isSecretMode) {
      if (isAnimal) {
        const animalMessages = {
          cow: "Your productivity equals what it takes to earn an achievement!",
          hippo: "Your work output matches medal-worthy effort!",
          elephant: "You've achieved crown-level productivity mastery!"
        };
        return animalMessages[tier as keyof typeof animalMessages] || "Amazing productivity!";
      }
      
      const objectMessages = {
        balloon: "Every second of work counts on your journey!",
        bike: "Your productivity is growing stronger!",
        soccer: "You're becoming a productivity legend!",
        basket: "Your dedication is paying off!",
        car: "Serious productivity achieved!"
      };
      return objectMessages[tier as keyof typeof objectMessages] || "Keep going!";
    } else {
      if (isAnimal) {
        const animalMessages = {
          cow: "Your gas output equals what it takes to inflate a cow!",
          hippo: "Your gas power matches a hippo's volume!",
          elephant: "You've achieved elephant-sized gas mastery!"
        };
        return animalMessages[tier as keyof typeof animalMessages] || "Amazing gas power!";
      }
      
      const objectMessages = {
        balloon: "Every second of gas counts on your journey!",
        bike: "Your gas power is growing stronger!",
        soccer: "You're becoming a gas legend!",
        basket: "Your dedication is paying off!",
        car: "Serious gas power achieved!"
      };
      return objectMessages[tier as keyof typeof objectMessages] || "Keep going!";
    }
  };

  const getCountMessage = () => {
    const isAnimal = ['cow', 'hippo', 'elephant'].includes(tier);
    const plural = count > 1 ? 's' : '';
    
    if (isSecretMode) {
      if (isAnimal) {
        return `Effort equivalent of ${count} ${name}${plural} this week!`;
      }
      return `${count} ${name}${plural} this week!`;
    } else {
      if (isAnimal) {
        return `Gas equivalent of ${count} ${name}${plural} this week!`;
      }
      return `${count} ${name}${plural} this week!`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      >
        {/* Extended Confetti Background */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 ${
                  isSecretMode 
                    ? 'bg-gradient-to-r from-blue-400 to-indigo-400' 
                    : 'bg-gradient-to-r from-purple-400 to-blue-400'
                } rounded-full`}
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.8 + 0.3,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 4 + 3, // Longer falling duration
                  repeat: Infinity,
                  delay: Math.random() * 3,
                }}
              />
            ))}
            
            {/* Additional golden confetti for extra celebration */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={`gold-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                  scale: Math.random() * 0.6 + 0.4,
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 720, // Double rotation for gold pieces
                  x: Math.random() * window.innerWidth,
                }}
                transition={{
                  duration: Math.random() * 5 + 4, // Even longer for gold
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}

        {/* Main Reveal Content */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            damping: 15, 
            stiffness: 300,
            delay: 0.3 
          }}
          className="bg-white dark:bg-gray-800 rounded-3xl p-8 mx-4 max-w-sm text-center relative overflow-hidden"
        >
          {/* Extended Sparkle Effects */}
          <div className="absolute inset-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${15 + (i % 4) * 20}%`,
                  top: `${15 + Math.floor(i / 4) * 25}%`,
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ 
                  scale: [0, 1.2, 0], 
                  rotate: [0, 180, 360],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 3, // Longer sparkle duration
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              >
                <Sparkles size={18} className="text-yellow-400" />
              </motion.div>
            ))}
          </div>

          {/* Pulsing Background Glow */}
          <motion.div
            className={`absolute inset-0 ${
              isSecretMode 
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900' 
                : 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900'
            } rounded-3xl`}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Trophy Icon with extended animation */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mb-4 relative z-10"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            >
              <Trophy size={36} className="text-yellow-500 mx-auto" />
            </motion.div>
          </motion.div>

          {/* Main Emoji with extended bounce */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ 
              delay: 1, 
              duration: 0.8,
              type: "spring",
              stiffness: 200 
            }}
            className="text-8xl mb-4 relative z-10"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 2
              }}
            >
              {emoji}
            </motion.div>
          </motion.div>

          {/* Tier Message with typewriter effect */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 relative z-10"
          >
            <motion.div
              animate={{ 
                textShadow: [
                  "0 0 0px rgba(147, 51, 234, 0)",
                  isSecretMode 
                    ? "0 0 10px rgba(59, 130, 246, 0.5)"
                    : "0 0 10px rgba(147, 51, 234, 0.5)",
                  "0 0 0px rgba(147, 51, 234, 0)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 2
              }}
            >
              {getTierMessage()}
            </motion.div>
          </motion.h2>

          {/* Count Display with enhanced animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2, duration: 0.6 }}
            className="mb-4 relative z-10"
          >
            <motion.div
              className={`${
                isSecretMode 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800' 
                  : 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800'
              } rounded-xl p-4`}
              animate={{ 
                boxShadow: [
                  isSecretMode 
                    ? "0 4px 15px rgba(59, 130, 246, 0.2)"
                    : "0 4px 15px rgba(147, 51, 234, 0.2)",
                  isSecretMode 
                    ? "0 8px 25px rgba(59, 130, 246, 0.4)"
                    : "0 8px 25px rgba(147, 51, 234, 0.4)",
                  isSecretMode 
                    ? "0 4px 15px rgba(59, 130, 246, 0.2)"
                    : "0 4px 15px rgba(147, 51, 234, 0.2)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 2.5
              }}
            >
              <p className={`text-lg font-semibold ${
                isSecretMode ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
              }`}>
                {getCountMessage()}
              </p>
            </motion.div>
          </motion.div>

          {/* Sub Message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
            className="text-gray-600 dark:text-gray-300 mb-6 relative z-10"
          >
            {getSubMessage()}
          </motion.p>

          {/* Stars with staggered extended animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 0.6 }}
            className="flex justify-center space-x-2 mb-6 relative z-10"
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 3.2 + i * 0.15, 
                  duration: 0.5,
                  type: "spring" 
                }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: 4 + i * 0.2
                  }}
                >
                  <Star size={22} className="text-yellow-400 fill-current" />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* Continue Button - appears after 4 seconds */}
          <AnimatePresence>
            {showContinueButton && (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, type: "spring" }}
                onClick={onComplete}
                className={`px-8 py-3 ${
                  isSecretMode 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                } text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 relative z-10`}
              >
                <motion.div
                  animate={{ 
                    boxShadow: [
                      isSecretMode 
                        ? "0 4px 15px rgba(59, 130, 246, 0.3)"
                        : "0 4px 15px rgba(147, 51, 234, 0.3)",
                      isSecretMode 
                        ? "0 8px 25px rgba(59, 130, 246, 0.5)"
                        : "0 8px 25px rgba(147, 51, 234, 0.5)",
                      isSecretMode 
                        ? "0 4px 15px rgba(59, 130, 246, 0.3)"
                        : "0 4px 15px rgba(147, 51, 234, 0.3)"
                    ]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="absolute inset-0 rounded-xl"
                />
                Continue Your Journey!
              </motion.button>
            )}
          </AnimatePresence>

          {/* Subtle hint text */}
          {!showContinueButton && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: 3.5
              }}
              className="text-xs text-gray-400 dark:text-gray-500 mt-4 relative z-10"
            >
              Enjoying your achievement...
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}