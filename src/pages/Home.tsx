import React from 'react';
import { motion } from 'framer-motion';
import { FartButton } from '../components/FartButton';
import { RecentEvents } from '../components/RecentEvents';
import { useStealthMode } from '../contexts/StealthContext';

export function Home() {
  const { isSecretMode } = useStealthMode();

  return (
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
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2"
          >
            {isSecretMode ? 'Track Your Tasks' : 'Track Your Toots'}
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 dark:text-gray-300"
          >
            {isSecretMode 
              ? 'Hold the button to log task duration and difficulty' 
              : 'Hold the button to log duration and intensity'
            }
          </motion.p>
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <FartButton />
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <RecentEvents />
        </motion.div>
      </div>
    </motion.div>
  );
}