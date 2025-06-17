import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useFartStore } from '../store/fartStore';
import { useFartIntensity } from '../hooks/useFartIntensity';

export function RecentEvents() {
  const events = useFartStore((state) => state.events);
  const deleteEvent = useFartStore((state) => state.deleteEvent);
  const { getIntensity, getIntensityLabel, getIntensityColor } = useFartIntensity();

  const recentEvents = events.slice(0, 5);

  if (recentEvents.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="text-center text-gray-500 py-8">
          <p className="text-4xl mb-2">💨</p>
          <p>No farts logged yet!</p>
          <p className="text-sm">Hold the button above to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <div className="space-y-3">
        <AnimatePresence>
          {recentEvents.map((event) => {
            const intensity = getIntensity(event.durationMs);
            const label = getIntensityLabel(event.durationMs);
            const colorClass = getIntensityColor(event.durationMs);
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                {/* Left: Intensity + Smell */}
                <div className="flex items-center space-x-3 mr-4">
                  <span className="text-3xl">{intensity}</span>
                  {event.smellIntensity && (
                    <span className="text-xl" title={`Smell: ${event.smellIntensity.label}`}>
                      {event.smellIntensity.emoji}
                    </span>
                  )}
                </div>

                {/* Center: Info + Triggers */}
                <div className="flex-1 min-w-0">
                  {/* Main Info Line */}
                  <div className="flex items-center justify-between mb-1">
                    <p className={`font-semibold text-lg ${colorClass}`}>
                      {label}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      {(event.durationMs / 1000).toFixed(1)}s
                    </p>
                  </div>

                  {/* Bottom Line: Time + Triggers */}
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
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
                          <span className="text-sm text-gray-500 font-medium ml-1">
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
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-3 opacity-0 group-hover:opacity-100"
                  title="Delete this fart"
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