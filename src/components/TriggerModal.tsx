import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Save, Sparkles, MapPin, Navigation } from 'lucide-react';
import { useFartStore } from '../store/fartStore';
import { useStealthMode } from '../contexts/StealthContext';
import type { Trigger, Preset, SmellIntensity, Location } from '../types';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
}

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
  
  // Asian Foods
  { emoji: '🍱', label: 'Bento', keywords: ['bento', 'japanese', 'lunch box'] },
  { emoji: '🍘', label: 'Rice Cracker', keywords: ['rice cracker', 'japanese', 'snack'] },
  { emoji: '🍙', label: 'Rice Ball', keywords: ['rice ball', 'onigiri', 'japanese'] },
  { emoji: '🍚', label: 'Rice', keywords: ['rice', 'cooked rice', 'grain'] },
  { emoji: '🍛', label: 'Curry', keywords: ['curry', 'rice', 'indian', 'spicy'] },
  { emoji: '🍜', label: 'Ramen', keywords: ['ramen', 'noodles', 'soup', 'japanese'] },
  { emoji: '🍝', label: 'Pasta', keywords: ['pasta', 'spaghetti', 'italian', 'noodles'] },
  { emoji: '🍠', label: 'Sweet Potato', keywords: ['sweet potato', 'roasted', 'vegetable'] },
  { emoji: '🍢', label: 'Oden', keywords: ['oden', 'japanese', 'skewer'] },
  { emoji: '🍣', label: 'Sushi', keywords: ['sushi', 'japanese', 'fish'] },
  { emoji: '🍤', label: 'Shrimp', keywords: ['shrimp', 'fried shrimp', 'seafood'] },
  { emoji: '🍥', label: 'Fish Cake', keywords: ['fish cake', 'kamaboko', 'japanese'] },
  { emoji: '🥮', label: 'Moon Cake', keywords: ['moon cake', 'chinese', 'festival'] },
  { emoji: '🍡', label: 'Dango', keywords: ['dango', 'japanese', 'sweet'] },
  { emoji: '🥟', label: 'Dumpling', keywords: ['dumpling', 'chinese', 'steamed'] },
  { emoji: '🥠', label: 'Fortune Cookie', keywords: ['fortune cookie', 'chinese', 'dessert'] },
  { emoji: '🥡', label: 'Takeout', keywords: ['takeout', 'chinese', 'box'] },
  
  // Seafood
  { emoji: '🦀', label: 'Crab', keywords: ['crab', 'seafood', 'shellfish'] },
  { emoji: '🦞', label: 'Lobster', keywords: ['lobster', 'seafood', 'shellfish'] },
  { emoji: '🦐', label: 'Shrimp', keywords: ['shrimp', 'seafood', 'shellfish'] },
  { emoji: '🦑', label: 'Squid', keywords: ['squid', 'seafood'] },
  { emoji: '🦪', label: 'Oyster', keywords: ['oyster', 'seafood', 'shellfish'] },
  
  // Sweets & Desserts
  { emoji: '🍦', label: 'Ice Cream', keywords: ['ice cream', 'soft serve', 'dessert'] },
  { emoji: '🍧', label: 'Shaved Ice', keywords: ['shaved ice', 'dessert', 'snow cone'] },
  { emoji: '🍨', label: 'Ice Cream Bowl', keywords: ['ice cream', 'dessert', 'bowl'] },
  { emoji: '🍩', label: 'Donut', keywords: ['donut', 'doughnut', 'dessert', 'sweet'] },
  { emoji: '🍪', label: 'Cookie', keywords: ['cookie', 'dessert', 'sweet'] },
  { emoji: '🎂', label: 'Birthday Cake', keywords: ['birthday cake', 'cake', 'dessert'] },
  { emoji: '🍰', label: 'Cake', keywords: ['cake', 'shortcake', 'dessert'] },
  { emoji: '🧁', label: 'Cupcake', keywords: ['cupcake', 'muffin', 'dessert'] },
  { emoji: '🥧', label: 'Pie', keywords: ['pie', 'dessert'] },
  { emoji: '🍫', label: 'Chocolate', keywords: ['chocolate', 'bar', 'sweet'] },
  { emoji: '🍬', label: 'Candy', keywords: ['candy', 'sweet'] },
  { emoji: '🍭', label: 'Lollipop', keywords: ['lollipop', 'candy', 'sweet'] },
  { emoji: '🍮', label: 'Custard', keywords: ['custard', 'pudding', 'dessert'] },
  { emoji: '🍯', label: 'Honey', keywords: ['honey', 'sweet', 'bee'] },
  
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

const smellIntensityOptions: SmellIntensity[] = [
  { id: 'fresh', label: 'Fresh', emoji: '😇', level: 1 },
  { id: 'light', label: 'Light', emoji: '😊', level: 2 },
  { id: 'meh', label: 'Meh', emoji: '😐', level: 3 },
  { id: 'stinky', label: 'Stinky', emoji: '😬', level: 4 },
  { id: 'toxic', label: 'Toxic', emoji: '🤢', level: 5 },
];

const stealthSmellIntensityOptions: SmellIntensity[] = [
  { id: 'fresh', label: 'Easy', emoji: '😇', level: 1 },
  { id: 'light', label: 'Simple', emoji: '😊', level: 2 },
  { id: 'meh', label: 'Medium', emoji: '😐', level: 3 },
  { id: 'stinky', label: 'Hard', emoji: '😬', level: 4 },
  { id: 'toxic', label: 'Extreme', emoji: '🤢', level: 5 },
];

export function TriggerModal({ isOpen, onClose, eventId }: TriggerModalProps) {
  const { isSecretMode } = useStealthMode();
  const { 
    settings, 
    updateEventTriggers, 
    addCustomTrigger, 
    addPreset, 
    getTopTriggers, 
    getSmartSuggestion,
    updateEventLocation
  } = useFartStore();
  
  const [selectedTriggers, setSelectedTriggers] = useState<Trigger[]>([]);
  const [selectedSmellIntensity, setSelectedSmellIntensity] = useState<SmellIntensity | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tooltipEmoji, setTooltipEmoji] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState('');
  const [customEmoji, setCustomEmoji] = useState('🍽️');
  const [presetName, setPresetName] = useState('');
  
  // Location states
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'loading'>('prompt');
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);

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
        keyword.toLowerCase().includes(text) || text.includes(keyword.toLowerCase())
      )
    );
    if (keywordMatch) return keywordMatch.emoji;
    
    // No match found, return generic food emoji
    return '🍽️';
  };

  // Handle custom label change with smart emoji suggestion
  const handleCustomLabelChange = (value: string) => {
    setCustomLabel(value);
    const suggestedEmoji = findMatchingEmoji(value);
    setCustomEmoji(suggestedEmoji);
  };

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
      emoji: '🍽️', // Always use plate emoji for meal presets
      triggers: selectedTriggers,
    };
    
    addPreset(newPreset);
    setPresetName('');
    setShowPresetForm(false);
  };

  const handleLocationRequest = () => {
    setLocationPermissionStatus('loading');
    
    if (!navigator.geolocation) {
      setLocationPermissionStatus('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setLocationPermissionStatus('granted');
        setShowLocationPrompt(false);
        
        // Update the event with location
        updateEventLocation(eventId, location);
      },
      (error) => {
        console.warn('Location access denied:', error);
        setLocationPermissionStatus('denied');
        setShowLocationPrompt(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleSubmit = () => {
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
      setShowEmojiPicker(false);
      setTooltipEmoji(null);
      setCustomLabel('');
      setCustomEmoji('🍽️');
      setPresetName('');
      setShowLocationPrompt(false);
      setLocationPermissionStatus('prompt');
      setCurrentLocation(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const intensityOptions = isSecretMode ? stealthSmellIntensityOptions : smellIntensityOptions;

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
          className="fixed left-1/2 bottom-16 w-full max-w-md bg-white dark:bg-gray-800 rounded-t-3xl max-h-[85vh] z-50 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {isSecretMode ? 'Log Task Details' : 'Log Possible Triggers'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Smell/Difficulty Intensity Section */}
            <div className={`mb-6 p-4 ${
              isSecretMode 
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 dark:from-blue-900 dark:to-indigo-900 dark:border-blue-700' 
                : 'bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-purple-200 dark:from-pink-900 dark:to-purple-900 dark:border-purple-700'
            } rounded-xl`}>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3 text-center">
                {isSecretMode ? 'How difficult was it? 🎯' : 'How smelly was it? 👃'}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {intensityOptions.map((intensity) => (
                  <motion.button
                    key={intensity.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedSmellIntensity(intensity);
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all border-2 ${
                      selectedSmellIntensity?.id === intensity.id
                        ? isSecretMode
                          ? 'bg-blue-600 text-white shadow-lg border-blue-700 scale-105'
                          : 'bg-purple-600 text-white shadow-lg border-purple-700 scale-105'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
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
                  <span className={`text-sm font-medium ${
                    isSecretMode ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
                  }`}>
                    Selected: {selectedSmellIntensity.emoji} {selectedSmellIntensity.label}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Content that only shows after intensity is selected */}
            <AnimatePresence>
              {selectedSmellIntensity && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Location Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {isSecretMode ? 'Add task location? (Optional)' : 'Add fart location? (Optional)'}
                      </h3>
                      {currentLocation && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center space-x-1">
                          <MapPin size={12} />
                          <span>Location added!</span>
                        </span>
                      )}
                    </div>
                    
                    {!showLocationPrompt && !currentLocation && locationPermissionStatus !== 'denied' && (
                      <button
                        onClick={() => setShowLocationPrompt(true)}
                        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all w-full ${
                          isSecretMode
                            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900 dark:text-purple-200 dark:hover:bg-purple-800'
                        }`}
                      >
                        <MapPin size={16} />
                        <span className="font-medium">Add Location</span>
                      </button>
                    )}

                    {/* Location Permission Prompt */}
                    <AnimatePresence>
                      {showLocationPrompt && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-600"
                        >
                          <div className="text-center">
                            <Navigation size={32} className="text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                              Allow {isSecretMode ? 'Task Tracker' : 'Tootie Tracker'} to track location?
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {isSecretMode 
                                ? 'This will help you see where you completed tasks on the map.'
                                : 'This will help you see where you farted on the map.'
                              }
                            </p>
                            <div className="flex space-x-3">
                              <button
                                onClick={handleLocationRequest}
                                disabled={locationPermissionStatus === 'loading'}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                                  isSecretMode
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-purple-600 text-white hover:bg-purple-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {locationPermissionStatus === 'loading' ? (
                                  <span className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Getting location...</span>
                                  </span>
                                ) : (
                                  'Allow Location'
                                )}
                              </button>
                              <button
                                onClick={() => setShowLocationPrompt(false)}
                                className="flex-1 py-2 px-4 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium"
                              >
                                Skip
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {locationPermissionStatus === 'denied' && (
                      <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          Location access denied. You can enable it in your browser settings if you change your mind.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Exploratory Trigger Prompt */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                      {isSecretMode 
                        ? 'What tools or resources did you use? (Optional)' 
                        : 'What did you eat, drink, or do before this fart? (Optional)'
                      }
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTriggers.map((trigger) => (
                        <motion.button
                          key={trigger.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleTriggerToggle(trigger)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all ${
                            selectedTriggers.find(t => t.id === trigger.id)
                              ? isSecretMode
                                ? 'bg-blue-600 text-white'
                                : 'bg-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          <span className="text-sm">{trigger.emoji}</span>
                          <span className="text-sm font-medium">{trigger.label}</span>
                        </motion.button>
                      ))}
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowCustomForm(true)}
                        className="flex items-center space-x-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                      >
                        <Plus size={14} />
                        <span className="text-sm font-medium">Add Custom</span>
                      </motion.button>
                    </div>
                  </div>

                  {/* Custom Trigger Form */}
                  <AnimatePresence>
                    {showCustomForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                          {isSecretMode ? 'Add Custom Tool/Resource' : 'Add Custom Trigger'}
                        </h3>
                        <div className="space-y-3">
                          <div className="flex space-x-2">
                            {/* Emoji Picker Button and Grid */}
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="w-16 h-12 px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors bg-white dark:bg-gray-700"
                              >
                                <span className="text-lg">{customEmoji}</span>
                              </button>
                              
                              {/* Emoji Picker Grid */}
                              <AnimatePresence>
                                {showEmojiPicker && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute top-14 left-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-3 w-64"
                                  >
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Select an emoji:</div>
                                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                                      {emojiOptions.map((option) => (
                                        <motion.button
                                          key={option.emoji}
                                          type="button"
                                          whileTap={{ scale: 0.95 }}
                                          onMouseEnter={() => setTooltipEmoji(option.emoji)}
                                          onMouseLeave={() => setTooltipEmoji(null)}
                                          onTouchStart={() => setTooltipEmoji(option.emoji)}
                                          onTouchEnd={() => setTimeout(() => setTooltipEmoji(null), 2000)}
                                          onClick={() => {
                                            setCustomEmoji(option.emoji);
                                            setCustomLabel(option.label);
                                            setShowEmojiPicker(false);
                                            setTooltipEmoji(null);
                                          }}
                                          className={`relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors ${
                                            customEmoji === option.emoji ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                          }`}
                                          title={option.label}
                                        >
                                          <span className="text-lg">{option.emoji}</span>
                                          {tooltipEmoji === option.emoji && (
                                            <motion.div
                                              initial={{ opacity: 0, y: 5 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 dark:bg-gray-900 text-white text-xs rounded whitespace-nowrap z-50"
                                            >
                                              {option.label}
                                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800 dark:border-t-gray-900"></div>
                                            </motion.div>
                                          )}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            
                            <input
                              type="text"
                              value={customLabel}
                              onChange={(e) => handleCustomLabelChange(e.target.value)}
                              placeholder={isSecretMode ? 'Tool name' : 'Food name'}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                            />
                          </div>
                          {customLabel && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {findMatchingEmoji(customLabel) !== '🍽️' 
                                ? '✨ Smart match found!' 
                                : '🍽️ Using generic icon'}
                            </div>
                          )}
                          <div className="flex space-x-2">
                            <button
                              onClick={handleAddCustomTrigger}
                              disabled={!customLabel.trim()}
                              className={`flex-1 py-2 ${
                                isSecretMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                              } text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                            >
                              Add
                            </button>
                            <button
                              onClick={() => {
                                setShowCustomForm(false);
                                setShowEmojiPicker(false);
                                setCustomLabel('');
                                setCustomEmoji('🍽️');
                              }}
                              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selected Triggers Display */}
                  {selectedTriggers.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Selected ({selectedTriggers.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTriggers.map((trigger) => (
                          <motion.div
                            key={trigger.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`flex items-center space-x-2 px-3 py-2 ${
                              isSecretMode ? 'bg-blue-600' : 'bg-purple-600'
                            } text-white rounded-full`}
                          >
                            <span className="text-sm">{trigger.emoji}</span>
                            <span className="text-sm font-medium">{trigger.label}</span>
                            <button
                              onClick={() => handleTriggerToggle(trigger)}
                              className={`ml-1 ${
                                isSecretMode ? 'text-blue-200 hover:text-white' : 'text-purple-200 hover:text-white'
                              }`}
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Save as Preset */}
                  {selectedTriggers.length > 1 && (
                    <div className="mb-6">
                      {!showPresetForm ? (
                        <button
                          onClick={() => setShowPresetForm(true)}
                          className={`flex items-center space-x-2 ${
                            isSecretMode ? 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300' : 'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
                          } transition-colors`}
                        >
                          <Save size={16} />
                          <span className="text-sm font-medium">
                            {isSecretMode ? 'Save as toolkit preset' : 'Save as meal preset'}
                          </span>
                        </button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                        >
                          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                            {isSecretMode ? 'Save Toolkit Preset' : 'Save Meal Preset'}
                          </h3>
                          <div className="space-y-3">
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                placeholder={isSecretMode ? 'Preset name (e.g., Development Tools) 🛠️' : 'Preset name (e.g., Chipotle Bowl) 🍽️'}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSavePreset}
                                disabled={!presetName.trim()}
                                className={`flex-1 py-2 ${
                                  isSecretMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
                                } text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                              >
                                Save Preset
                              </button>
                              <button
                                onClick={() => setShowPresetForm(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Meal/Toolkit Presets */}
                  {settings.presets.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                        {isSecretMode ? 'Toolkit Presets' : 'Meal Presets'}
                      </h3>
                      <div className="space-y-2">
                        {settings.presets.map((preset) => (
                          <motion.button
                            key={preset.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePresetSelect(preset)}
                            className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{preset.emoji}</span>
                              <span className="font-medium text-gray-800 dark:text-gray-100">{preset.name}</span>
                            </div>
                            <div className="flex space-x-1">
                              {preset.triggers.slice(0, 3).map((trigger) => (
                                <span key={trigger.id} className="text-xs">{trigger.emoji}</span>
                              ))}
                              {preset.triggers.length > 3 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">+{preset.triggers.length - 3}</span>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Smart Suggestion */}
                  {smartSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mb-6 p-4 ${
                        isSecretMode 
                          ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-800 dark:to-indigo-800' 
                          : 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800 dark:to-blue-800'
                      } rounded-xl`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles size={16} className={isSecretMode ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'} />
                        <span className={`text-sm font-medium ${
                          isSecretMode ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
                        }`}>
                          {isSecretMode ? 'Frequently used tool?' : 'Could it be...?'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleTriggerToggle(smartSuggestion)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                          selectedTriggers.find(t => t.id === smartSuggestion.id)
                            ? isSecretMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-purple-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <span className="text-lg">{smartSuggestion.emoji}</span>
                        <span className="font-medium">{smartSuggestion.label}</span>
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 p-3 rounded-b-3xl">
            <div className="flex space-x-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 py-2 rounded-xl transition-colors font-medium ${
                  selectedTriggers.length > 0 || selectedSmellIntensity
                    ? isSecretMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    : isSecretMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
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