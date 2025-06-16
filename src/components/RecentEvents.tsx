import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Tag } from 'lucide-react';
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
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{intensity}</span>
                    {event.smellIntensity && (
                      <span className="text-lg" title={`Smell: ${event.smellIntensity.label}`}>
                        {event.smellIntensity.emoji}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className={`font-medium ${colorClass}`}>
                        {label} • {(event.durationMs / 1000).toFixed(1)}s
                      </p>
                      {event.smellIntensity && (
                        <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                          {event.smellIntensity.label}
                        </span>
                      )}
                      {event.triggers && event.triggers.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag size={12} className="text-gray-400" />
                          <div className="flex space-x-1">
                            {event.triggers.slice(0, 3).map((trigger) => (
                              <span key={trigger.id} className="text-xs">{trigger.emoji}</span>
                            ))}
                            {event.triggers.length > 3 && (
                              <span className="text-xs text-gray-500">+{event.triggers.length - 3}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                      {event.triggers && event.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {event.triggers.slice(0, 2).map((trigger) => (
                            <span
                              key={trigger.id}
                              className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                            >
                              {trigger.emoji} {trigger.label}
                            </span>
                          ))}
                          {event.triggers.length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              +{event.triggers.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}