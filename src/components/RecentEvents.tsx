import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useFartStore } from '../store/fartStore';
import { useFartIntensity } from '../hooks/useFartIntensity';
import { useStealthMode } from '../contexts/StealthContext';

export function RecentEvents() {
  const { isSecretMode } = useStealthMode();
  const events = useFartStore((state) => state.events);
  const deleteEvent = useFartStore((state) => state.deleteEvent);
  const { getIntensity, getIntensityLabel, getIntensityColor } = useFartIntensity();

  const recentEvents = events.slice(0, 5);

  if (recentEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {isSecretMode ? 'Recent Tasks' : 'Recent Activity'}
        </h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <p className="text-4xl mb-2">{isSecretMode ? '✅' : '💨'}</p>
          <p>{isSecretMode ? 'No tasks logged yet!' : 'No farts logged yet!'}</p>
          <p className="text-sm">Hold the button above to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {isSecretMode ? 'Recent Tasks' : 'Recent Activity'}
      </h2>
      <div className="space-y-3">
        <AnimatePresence>
          {recentEvents.map((event) => {
            const intensity = getIntensity(event.durationMs);
            const label = getIntensityLabel(event.durationMs);
            const colorClass = getIntensityColor(event.durationMs);
            
            // Transform labels for stealth mode
            const stealthLabel = isSecretMode ? 
              label.replace('Fart', 'Task').replace('fart', 'task') : 
              label;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group"
              >
                {/* Left: Intensity + Smell/Difficulty */}
                <div className="flex items-center space-x-3 mr-4">
                  <span className="text-3xl">{isSecretMode ? '✅' : intensity}</span>
                  {event.smellIntensity && (
                    <span className="text-xl" title={`${isSecretMode ? 'Difficulty' : 'Smell'}: ${event.smellIntensity.label}`}>
                      {event.smellIntensity.emoji}
                    </span>
                  )}
                </div>

                {/* Center: Info + Triggers */}
                <div className="flex-1 min-w-0">
                  {/* Main Info Line */}
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-lg ${colorClass} dark:brightness-110`}>
                      {stealthLabel}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {(event.durationMs / 1000).toFixed(1)}s
                    </p>
                  </div>

                  {/* Bottom Line: Time + Triggers */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </p>
                    
                    {/* Trigger Emojis Only - No Text! */}
                    {event.triggers && event.triggers.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {event.triggers.slice(0, 4).map((trigger) => (
                          <span 
                            key={trigger.id} 
                            className="text-lg hover:scale-110 transition-transform" 
                            title={trigger.label}
                          >
                            {trigger.emoji}
                          </span>
                        ))}
                        {event.triggers.length > 4 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium ml-1">
                            +{event.triggers.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Delete Button */}
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all ml-3 opacity-0 group-hover:opacity-100"
                  title={`Delete this ${isSecretMode ? 'task' : 'fart'}`}
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}