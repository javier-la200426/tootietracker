import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Moon, Sun, Plus, Trash2, AlertTriangle, Package } from 'lucide-react';
import { useFartStore } from '../store/fartStore';

const emojiOptions = [
  // Fruits
  { emoji: '🍎', label: 'Apple', keywords: ['apple', 'red apple', 'fruit'] },
  { emoji: '🍏', label: 'Green Apple', keywords: ['green apple', 'apple', 'fruit'] },
  { emoji: '🍌', label: 'Banana', keywords: ['banana', 'fruit'] },
  { emoji: '🍊', label: 'Orange', keywords: ['orange', 'tangerine', 'citrus', 'fruit'] },
  { emoji: '🍋', label: 'Lemon', keywords: ['lemon', 'citrus', 'fruit'] },
  { emoji: '🍇', label: 'Grapes', keywords: ['grapes', 'fruit', 'wine'] },
  { emoji: '🍓', label: 'Strawberry', keywords: ['strawberry', 'berry', 'fruit'] },
  { emoji: '🫐', label: 'Blueberries', keywords: ['blueberries', 'berries', 'fruit'] },
  { emoji: '🍒', label: 'Cherries', keywords: ['cherries', 'cherry', 'fruit'] },
  { emoji: '🍑', label: 'Peach', keywords: ['peach', 'fruit'] },
  { emoji: '🍐', label: 'Pear', keywords: ['pear', 'fruit'] },
  { emoji: '🥭', label: 'Mango', keywords: ['mango', 'tropical', 'fruit'] },
  { emoji: '🍍', label: 'Pineapple', keywords: ['pineapple', 'tropical', 'fruit'] },
  { emoji: '🥝', label: 'Kiwi', keywords: ['kiwi', 'fruit'] },
  { emoji: '🍉', label: 'Watermelon', keywords: ['watermelon', 'melon', 'fruit'] },
  { emoji: '🍈', label: 'Melon', keywords: ['melon', 'cantaloupe', 'fruit'] },
  { emoji: '🥥', label: 'Coconut', keywords: ['coconut', 'tropical', 'fruit'] },
  { emoji: '🫒', label: 'Olive', keywords: ['olive', 'fruit'] },
  
  // Vegetables
  { emoji: '🍅', label: 'Tomato', keywords: ['tomato', 'vegetable'] },
  { emoji: '🥕', label: 'Carrot', keywords: ['carrot', 'vegetable'] },
  { emoji: '🥦', label: 'Broccoli', keywords: ['broccoli', 'vegetable', 'green'] },
  { emoji: '🥬', label: 'Leafy Greens', keywords: ['lettuce', 'greens', 'salad', 'vegetable', 'leafy'] },
  { emoji: '🥒', label: 'Cucumber', keywords: ['cucumber', 'vegetable'] },
  { emoji: '🧅', label: 'Onion', keywords: ['onion', 'vegetable'] },
  { emoji: '🧄', label: 'Garlic', keywords: ['garlic', 'vegetable'] },
  { emoji: '🌶️', label: 'Hot Pepper', keywords: ['pepper', 'hot pepper', 'spicy', 'chili', 'vegetable'] },
  { emoji: '🫑', label: 'Bell Pepper', keywords: ['bell pepper', 'pepper', 'vegetable'] },
  { emoji: '🌽', label: 'Corn', keywords: ['corn', 'maize', 'vegetable'] },
  { emoji: '🥔', label: 'Potato', keywords: ['potato', 'vegetable'] },
  { emoji: '🍆', label: 'Eggplant', keywords: ['eggplant', 'aubergine', 'vegetable'] },
  { emoji: '🥑', label: 'Avocado', keywords: ['avocado', 'fruit', 'vegetable'] },
  { emoji: '🍄', label: 'Mushroom', keywords: ['mushroom', 'fungi', 'vegetable'] },
  { emoji: '🥜', label: 'Peanuts', keywords: ['peanuts', 'nuts', 'legume'] },
  { emoji: '🫘', label: 'Beans', keywords: ['beans', 'legume', 'vegetable'] },
  { emoji: '🌰', label: 'Chestnut', keywords: ['chestnut', 'nuts'] },
  { emoji: '🧅', label: 'Root Vegetable', keywords: ['root', 'vegetable'] },
  { emoji: '🫛', label: 'Pea Pod', keywords: ['peas', 'pod', 'vegetable'] },
  { emoji: '🫚', label: 'Ginger', keywords: ['ginger', 'root', 'spice'] },
  
  // Prepared Foods
  { emoji: '🍞', label: 'Bread', keywords: ['bread', 'loaf', 'carb', 'grain'] },
  { emoji: '🥐', label: 'Croissant', keywords: ['croissant', 'pastry', 'bread'] },
  { emoji: '🥖', label: 'Baguette', keywords: ['baguette', 'bread', 'french'] },
  { emoji: '🫓', label: 'Flatbread', keywords: ['flatbread', 'bread', 'pita'] },
  { emoji: '🥨', label: 'Pretzel', keywords: ['pretzel', 'snack', 'bread'] },
  { emoji: '🥯', label: 'Bagel', keywords: ['bagel', 'bread'] },
  { emoji: '🥞', label: 'Pancakes', keywords: ['pancakes', 'breakfast', 'syrup'] },
  { emoji: '🧇', label: 'Waffle', keywords: ['waffle', 'breakfast', 'syrup'] },
  { emoji: '🧀', label: 'Cheese', keywords: ['cheese', 'dairy'] },
  { emoji: '🧈', label: 'Butter', keywords: ['butter', 'dairy'] },
  { emoji: '🥛', label: 'Milk', keywords: ['milk', 'dairy'] },
  { emoji: '🥚', label: 'Egg', keywords: ['egg', 'protein'] },
  { emoji: '🍳', label: 'Cooking', keywords: ['fried egg', 'cooking', 'breakfast'] },
  { emoji: '🥓', label: 'Bacon', keywords: ['bacon', 'meat', 'breakfast'] },
  { emoji: '🍖', label: 'Meat', keywords: ['meat', 'bone', 'protein'] },
  { emoji: '🍗', label: 'Chicken', keywords: ['chicken', 'poultry', 'leg', 'meat'] },
  { emoji: '🥩', label: 'Steak', keywords: ['steak', 'meat', 'beef'] },
  { emoji: '🍔', label: 'Hamburger', keywords: ['burger', 'hamburger', 'meat', 'fast food'] },
  { emoji: '🍟', label: 'Fries', keywords: ['fries', 'french fries', 'potato', 'fast food'] },
  { emoji: '🍕', label: 'Pizza', keywords: ['pizza', 'cheese', 'italian'] },
  { emoji: '🌭', label: 'Hot Dog', keywords: ['hot dog', 'sausage', 'meat'] },
  { emoji: '🥪', label: 'Sandwich', keywords: ['sandwich', 'bread', 'meat'] },
  { emoji: '🌮', label: 'Taco', keywords: ['taco', 'mexican', 'meat'] },
  { emoji: '🌯', label: 'Burrito', keywords: ['burrito', 'mexican', 'wrap'] },
  { emoji: '🫔', label: 'Tamale', keywords: ['tamale', 'mexican', 'corn'] },
  { emoji: '🥙', label: 'Pita', keywords: ['pita', 'stuffed flatbread', 'bread'] },
  { emoji: '🧆', label: 'Falafel', keywords: ['falafel', 'middle eastern', 'vegetarian'] },
  { emoji: '🥘', label: 'Paella', keywords: ['paella', 'pan', 'rice', 'spanish'] },
  { emoji: '🍲', label: 'Stew', keywords: ['stew', 'pot', 'soup'] },
  { emoji: '🫕', label: 'Fondue', keywords: ['fondue', 'cheese', 'chocolate'] },
  { emoji: '🥣', label: 'Bowl', keywords: ['bowl', 'cereal', 'soup'] },
  { emoji: '🥗', label: 'Salad', keywords: ['salad', 'green', 'healthy'] },
  { emoji: '🍿', label: 'Popcorn', keywords: ['popcorn', 'snack', 'movie'] },
  { emoji: '🧂', label: 'Salt', keywords: ['salt', 'seasoning'] },
  { emoji: '🥫', label: 'Canned Food', keywords: ['canned', 'can', 'preserved'] },
  
  // Beverages
  { emoji: '☕', label: 'Coffee', keywords: ['coffee', 'caffeine', 'hot beverage'] },
  { emoji: '🫖', label: 'Teapot', keywords: ['teapot', 'tea', 'hot beverage'] },
  { emoji: '🍵', label: 'Tea', keywords: ['tea', 'green tea', 'hot beverage'] },
  { emoji: '🥤', label: 'Soda', keywords: ['soda', 'soft drink', 'cup', 'straw'] },
  { emoji: '🧃', label: 'Juice Box', keywords: ['juice box', 'juice', 'drink'] },
  { emoji: '🧋', label: 'Bubble Tea', keywords: ['bubble tea', 'boba', 'tea', 'drink'] },
  { emoji: '🧉', label: 'Mate', keywords: ['mate', 'yerba mate', 'tea'] },
  { emoji: '🍼', label: 'Baby Bottle', keywords: ['baby bottle', 'milk', 'bottle'] },
  { emoji: '🍺', label: 'Beer', keywords: ['beer', 'alcohol', 'mug'] },
  { emoji: '🍻', label: 'Beers', keywords: ['beers', 'cheers', 'alcohol'] },
  { emoji: '🍷', label: 'Wine', keywords: ['wine', 'alcohol', 'red wine'] },
  { emoji: '🍾', label: 'Champagne', keywords: ['champagne', 'sparkling wine', 'celebration'] },
  { emoji: '🍸', label: 'Cocktail', keywords: ['cocktail', 'martini', 'alcohol'] },
  { emoji: '🍹', label: 'Tropical Drink', keywords: ['tropical drink', 'cocktail', 'vacation'] },
  { emoji: '🥂', label: 'Champagne Glasses', keywords: ['champagne glasses', 'cheers', 'celebration'] },
  { emoji: '🥃', label: 'Whiskey', keywords: ['whiskey', 'alcohol', 'tumbler'] },
  { emoji: '🍶', label: 'Sake', keywords: ['sake', 'japanese', 'alcohol'] },
  { emoji: '🧊', label: 'Ice', keywords: ['ice', 'cold', 'frozen'] }
];

// Smart emoji search function
const findMatchingEmoji = (inputText: string): string => {
  if (!inputText || inputText.length < 2) return '🍽️';
  
  const text = inputText.toLowerCase().trim();
  
  // Find exact label match first
  const exactMatch = emojiOptions.find(option => 
    option.label.toLowerCase() === text
  );
  if (exactMatch) return exactMatch.emoji;
  
  // Find partial label match
  const partialLabelMatch = emojiOptions.find(option => 
    option.label.toLowerCase().includes(text) || text.includes(option.label.toLowerCase())
  );
  if (partialLabelMatch) return partialLabelMatch.emoji;
  
  // Find keyword match
  const keywordMatch = emojiOptions.find(option => 
    option.keywords.some(keyword => 
      keyword.includes(text) || text.includes(keyword)
    )
  );
  if (keywordMatch) return keywordMatch.emoji;
  
  // Default fallback
  return '🍽️';
};

export function Settings() {
  const { 
    settings, 
    updateSettings, 
    addTrigger, 
    removeTrigger, 
    clearAllEvents,
    addCustomTrigger,
    removePreset,
    addPreset
  } = useFartStore();
  const [newTriggerName, setNewTriggerName] = useState('');
  const [newTriggerEmoji, setNewTriggerEmoji] = useState('🍎');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // New states for meal preset creation
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetEmoji, setNewPresetEmoji] = useState('🍽️');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);

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

  const handleAddPreset = () => {
    if (newPresetName.trim() && selectedTriggers.length > 0) {
      const presetTriggers = selectedTriggers.map(triggerId => {
        const trigger = settings.customTriggers.find(t => t.id === triggerId);
        return trigger ? {
          id: trigger.id,
          label: trigger.label,
          emoji: trigger.emoji
        } : null;
      }).filter(Boolean);

      if (presetTriggers.length > 0) {
        addPreset({
          name: newPresetName.trim(),
          emoji: newPresetEmoji,
          triggers: presetTriggers as any[]
        });
        
        // Reset form
        setNewPresetName('');
        setNewPresetEmoji('🍽️');
        setSelectedTriggers([]);
        setShowAddPreset(false);
      }
    }
  };

  const toggleTriggerSelection = (triggerId: string) => {
    setSelectedTriggers(prev => 
      prev.includes(triggerId) 
        ? prev.filter(id => id !== triggerId)
        : [...prev, triggerId]
    );
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
            
            {settings.presets.length > 0 && (
              <div className="space-y-3 mb-4">
                {settings.presets.map((preset) => (
                  <div key={preset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{preset.emoji}</span>
                      <div>
                        <span className="font-medium">{preset.name}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {preset.triggers.map((trigger) => (
                            <span key={trigger.id} className="inline-flex items-center text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full gap-1">
                              <span className="text-sm">{trigger.emoji}</span>
                              <span>{trigger.label}</span>
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
            )}

            {/* Add Preset Interface */}
            {!showAddPreset ? (
              <button
                onClick={() => setShowAddPreset(true)}
                disabled={settings.customTriggers.length === 0}
                className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={16} />
                <span>{settings.customTriggers.length === 0 ? 'Add triggers first to create presets' : 'Create New Meal Preset'}</span>
              </button>
            ) : (
              <div className="border-t pt-4 space-y-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newPresetEmoji}
                    onChange={(e) => setNewPresetEmoji(e.target.value)}
                    className="w-12 px-2 py-2 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="🍽️"
                  />
                  <input
                    type="text"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Meal name (e.g., 'Breakfast')"
                  />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Select triggers for this meal:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {settings.customTriggers.map((trigger) => (
                      <label key={trigger.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTriggers.includes(trigger.id)}
                          onChange={() => toggleTriggerSelection(trigger.id)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-lg">{trigger.emoji}</span>
                        <span className="font-medium">{trigger.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddPreset}
                    disabled={!newPresetName.trim() || selectedTriggers.length === 0}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={16} />
                    <span>Create Preset</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddPreset(false);
                      setNewPresetName('');
                      setNewPresetEmoji('🍽️');
                      setSelectedTriggers([]);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>

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
                      <span className="inline-flex items-center text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
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
                  onChange={(e) => {
                    const value = e.target.value;
                    setNewTriggerName(value);
                    const suggestedEmoji = findMatchingEmoji(value);
                    setNewTriggerEmoji(suggestedEmoji);
                  }}
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