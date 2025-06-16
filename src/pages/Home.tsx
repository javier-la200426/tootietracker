import React from 'react';
import { motion } from 'framer-motion';
import { FartButton } from '../components/FartButton';
import { RecentEvents } from '../components/RecentEvents';

export function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 pb-20"
    >
      <div className="max-w-md mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            Track Your Toots
          </motion.h1>
          <motion.p
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600"
          >
            Hold the button to log duration and intensity
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