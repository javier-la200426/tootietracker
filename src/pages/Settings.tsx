import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Moon, Sun, Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useFartStore } from '../store/fartStore';

export function Settings() {
  const { 
    settings, 
    updateSettings, 
    addTrigger, 
    removeTrigger, 
    clearAllEvents,
    addCustomTrigger,
    removePreset
  } = useFartStore();
  const [newTriggerName, setNewTriggerName] = useState('');
  const [newTriggerEmoji, setNewTriggerEmoji] = useState('🍎');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleAddTrigger = () => {
    if (newTriggerName.trim()) {
      // Add to both triggers (for settings compatibility) and customTriggers (for tracking)
      addTrigger({
        name: newTriggerName.trim(),
        emoji: newTriggerEmoji,
      });
      addCustomTrigger({
        label: newTriggerName.trim(),
        emoji: newTriggerEmoji,
      });
      setNewTriggerName('');
      setNewTriggerEmoji('🍎');
    }
  };

  const handleReset = () => {
    clearAllEvents();
    setShowResetConfirm(false);
  };

  return (
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your fart tracking experience</p>
        </motion.div>

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">General</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.soundEffects ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  <span className="font-medium">Sound Effects</span>
                </div>
                <button
                  onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.soundEffects ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="font-medium">Dark Mode</span>
                </div>
                <button
                  onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.darkMode ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Meal Presets */}
          {settings.presets.length > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Package size={20} />
                <span>Meal Presets</span>
              </h2>
              
              <div className="space-y-3">
                {settings.presets.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{preset.emoji}</span>
                      <div>
                        <span className="font-medium">{preset.name}</span>
                        <div className="flex space-x-1 mt-1">
                          {preset.triggers.map((trigger) => (
                            <span key={trigger.id} className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                              {trigger.emoji} {trigger.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removePreset(preset.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Food Triggers */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Triggers</h2>
            
            <div className="space-y-3 mb-4">
              {settings.customTriggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{trigger.emoji}</span>
                    <span className="font-medium">{trigger.label}</span>
                    {trigger.count && trigger.count > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                        {trigger.count}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      // Remove from both customTriggers and triggers if it's a default trigger
                      const defaultTriggerIds = ['1', '2', '3', '4', '5'];
                      if (defaultTriggerIds.includes(trigger.id)) {
                        removeTrigger(trigger.id);
                      }
                      // Remove from customTriggers (this handles both default and custom triggers)
                      const updatedCustomTriggers = settings.customTriggers.filter(t => t.id !== trigger.id);
                      updateSettings({ customTriggers: updatedCustomTriggers });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTriggerEmoji}
                  onChange={(e) => setNewTriggerEmoji(e.target.value)}
                  className="w-12 px-2 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="🍎"
                />
                <input
                  type="text"
                  value={newTriggerName}
                  onChange={(e) => setNewTriggerName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Food name"
                />
              </div>
              <button
                onClick={handleAddTrigger}
                disabled={!newTriggerName.trim()}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
                <span>Add Trigger</span>
              </button>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-red-200"
          >
            <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
              <AlertTriangle size={20} />
              <span>Danger Zone</span>
            </h2>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset All Data
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-red-600">
                  Are you sure? This will permanently delete all your fart logs, triggers, and presets.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}