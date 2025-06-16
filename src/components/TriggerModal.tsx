import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Sparkles } from 'lucide-react';
import { useFartStore } from '../store/fartStore';
import type { Trigger, Preset, SmellIntensity } from '../types';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

const emojiOptions = ['🍎', '🍌', '🥕', '🥦', '🧅', '🌶️', '🥛', '🧀', '🍞', '🍝', '🍕', '🌮', '🍔', '🥤', '☕', '🍺', '🍷', '🥚', '🥓', '🫘'];

const smellIntensityOptions: SmellIntensity[] = [
  { id: 'fresh', label: 'Fresh', emoji: '😇', level: 1 },
  { id: 'light', label: 'Light', emoji: '😊', level: 2 },
  { id: 'meh', label: 'Meh', emoji: '😐', level: 3 },
  { id: 'stinky', label: 'Stinky', emoji: '😬', level: 4 },
  { id: 'toxic', label: 'Toxic', emoji: '🤢', level: 5 },
];

export function TriggerModal({ isOpen, onClose, eventId }: TriggerModalProps) {
  const { 
    settings, 
    updateEventTriggers, 
    addCustomTrigger, 
    addPreset, 
    getTopTriggers, 
    getSmartSuggestion 
  } = useFartStore();
  
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
  const [selectedSmellIntensity, setSelectedSmellIntensity] = useState<SmellIntensity | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍎');
  const [presetName, setPresetName] = useState('');
  const [presetEmoji, setPresetEmoji] = useState('🍽️');

  const topTriggers = getTopTriggers(3);
  const smartSuggestion = getSmartSuggestion();
  
  // Get default triggers (first 5) and top user triggers, avoiding duplicates
  const defaultTriggerIds = ['1', '2', '3', '4', '5']; // IDs of default triggers
  const defaultTriggers = settings.customTriggers.filter(t => defaultTriggerIds.includes(t.id));
  const userTriggers = topTriggers.filter(t => !defaultTriggerIds.includes(t.id));
  
  // Combine default triggers with top user triggers
  const suggestedTriggers = [
    ...defaultTriggers,
    ...userTriggers
  ].slice(0, 6);

  const handleTriggerToggle = (trigger: Trigger) => {
    setSelectedTriggers(prev => {
      const exists = prev.find(t => t.id === trigger.id);
      if (exists) {
        return prev.filter(t => t.id !== trigger.id);
      } else {
        return [...prev, trigger];
      }
    });
  };

  const handlePresetSelect = (preset: Preset) => {
    setSelectedTriggers(preset.triggers);
  };

  const handleAddCustomTrigger = () => {
    if (!customLabel.trim()) return;
    
    const newTrigger: Trigger = {
      id: crypto.randomUUID(),
      label: customLabel.trim(),
      emoji: customEmoji,
      count: 0,
    };
    
    addCustomTrigger(newTrigger);
    setSelectedTriggers(prev => [...prev, newTrigger]);
    setCustomLabel('');
    setCustomEmoji('🍎');
    setShowCustomForm(false);
  };

  const handleSavePreset = () => {
    if (!presetName.trim() || selectedTriggers.length === 0) return;
    
    const newPreset: Preset = {
      id: crypto.randomUUID(),
      name: presetName.trim(),
      emoji: presetEmoji,
      triggers: selectedTriggers,
    };
    
    addPreset(newPreset);
    setPresetName('');
    setPresetEmoji('🍽️');
    setShowPresetForm(false);
  };

  const handleSubmit = () => {
    console.log('TriggerModal handleSubmit eventId:', eventId); // Debug log
    console.log('TriggerModal handleSubmit selectedSmellIntensity:', selectedSmellIntensity); // Debug log
    updateEventTriggers(eventId, selectedTriggers, selectedSmellIntensity);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTriggers([]);
      setSelectedSmellIntensity(null);
      setShowCustomForm(false);
      setShowPresetForm(false);
      setCustomLabel('');
      setCustomEmoji('🍎');
      setPresetName('');
      setPresetEmoji('🍽️');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', x: '-50%' }}
          animate={{ y: 0, x: '-50%' }}
          exit={{ y: '100%', x: '-50%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          className="fixed left-1/2 bottom-16 w-full max-w-md bg-white rounded-t-3xl max-h-[85vh] z-50 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Log Possible Triggers</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Smell Intensity Section - Make it more prominent */}
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border-2 border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                How smelly was it? 👃
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {smellIntensityOptions.map((intensity) => (
                  <motion.button
                    key={intensity.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      console.log('Selected smell intensity:', intensity); // Debug log
                      setSelectedSmellIntensity(intensity);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                      selectedSmellIntensity?.id === intensity.id
                        ? 'bg-purple-600 text-white shadow-lg border-purple-700 scale-105'
                        : 'bg-white text-gray-700 hover:bg-purple-100 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="text-2xl mb-1">{intensity.emoji}</span>
                    <span className="text-xs font-medium text-center">{intensity.label}</span>
                  </motion.button>
                ))}
              </div>
              {selectedSmellIntensity && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 text-center"
                >
                  <span className="text-sm font-medium text-purple-700">
                    Selected: {selectedSmellIntensity.emoji} {selectedSmellIntensity.label}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Exploratory Trigger Prompt */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">What did you eat, drink, or do before this fart? <span className='font-normal'>(Optional)</span></h3>
              <div className="flex flex-wrap gap-2">
                {suggestedTriggers.map((trigger) => (
                  <motion.button
                    key={trigger.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleTriggerToggle(trigger)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
                      selectedTriggers.find(t => t.id === trigger.id)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                    }`}
                  >
                    <span className="text-sm">{trigger.emoji}</span>
                    <span className="text-sm font-medium">{trigger.label}</span>
                  </motion.button>
                ))}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCustomForm(true)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-purple-100 transition-all"
                >
                  <Plus size={14} />
                  <span className="text-sm font-medium">Add Custom</span>
                </motion.button>
              </div>
            </div>

            {/* Custom Trigger Form - Moved to appear right below Add Custom button */}
            <AnimatePresence>
              {showCustomForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 p-4 bg-gray-50 rounded-xl"
                >
                  <h3 className="text-sm font-medium text-gray-600 mb-3">Add Custom Trigger</h3>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <select
                        value={customEmoji}
                        onChange={(e) => setCustomEmoji(e.target.value)}
                        className="w-16 px-2 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {emojiOptions.map((emoji) => (
                          <option key={emoji} value={emoji}>{emoji}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                        placeholder="Food name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAddCustomTrigger}
                        disabled={!customLabel.trim()}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => setShowCustomForm(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Triggers Display - Moved above Smart Suggestion */}
            {selectedTriggers.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Selected ({selectedTriggers.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTriggers.map((trigger) => (
                    <motion.div
                      key={trigger.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-full"
                    >
                      <span className="text-sm">{trigger.emoji}</span>
                      <span className="text-sm font-medium">{trigger.label}</span>
                      <button
                        onClick={() => handleTriggerToggle(trigger)}
                        className="ml-1 text-purple-200 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Save as Preset - Moved below selected options */}
            {selectedTriggers.length > 1 && (
              <div className="mb-6">
                {!showPresetForm ? (
                  <button
                    onClick={() => setShowPresetForm(true)}
                    className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Save size={16} />
                    <span className="text-sm font-medium">Save as meal preset</span>
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-gray-50 rounded-xl"
                  >
                    <h3 className="text-sm font-medium text-gray-600 mb-3">Save Meal Preset</h3>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={presetEmoji}
                          onChange={(e) => setPresetEmoji(e.target.value)}
                          className="w-16 px-2 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="🍽️"
                        />
                        <input
                          type="text"
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="Preset name (e.g., Chipotle Bowl)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSavePreset}
                          disabled={!presetName.trim()}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Save Preset
                        </button>
                        <button
                          onClick={() => setShowPresetForm(false)}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Meal Presets - Moved above Smart Suggestion */}
            {settings.presets.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Meal Presets</h3>
                <div className="space-y-2">
                  {settings.presets.map((preset) => (
                    <motion.button
                      key={preset.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePresetSelect(preset)}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{preset.emoji}</span>
                        <span className="font-medium text-gray-800">{preset.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        {preset.triggers.slice(0, 3).map((trigger) => (
                          <span key={trigger.id} className="text-xs">{trigger.emoji}</span>
                        ))}
                        {preset.triggers.length > 3 && (
                          <span className="text-xs text-gray-500">+{preset.triggers.length - 3}</span>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Suggestion - Moved after Meal Presets */}
            {smartSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Could it be...?</span>
                </div>
                <button
                  onClick={() => handleTriggerToggle(smartSuggestion)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                    selectedTriggers.find(t => t.id === smartSuggestion.id)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  <span className="text-lg">{smartSuggestion.emoji}</span>
                  <span className="font-medium">{smartSuggestion.label}</span>
                </button>
              </motion.div>
            )}
          </div>

          {/* Fixed Action Buttons - Like a bottom nav bar */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-3 rounded-b-3xl">
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 py-2 rounded-xl transition-colors font-medium ${
                  selectedTriggers.length > 0 || selectedSmellIntensity
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {selectedTriggers.length > 0 || selectedSmellIntensity ? 
                  `Save ${selectedTriggers.length > 0 ? `(${selectedTriggers.length})` : ''}` : 
                  'Done'
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}