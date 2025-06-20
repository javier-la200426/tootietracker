import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFartStore } from '../store/fartStore';
import { useFartIntensity } from '../hooks/useFartIntensity';
import { TriggerModal } from './TriggerModal';
import { fartAudio } from '../utils/fartAudio';
import { useStealthMode } from '../contexts/StealthContext';
import { Eye, EyeOff } from 'lucide-react';

export function FartButton() {
  const { isSecretMode, toggleSecretMode } = useStealthMode();
  const [isPressed, setIsPressed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const soundStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRecordedRef = useRef<boolean>(false);
  const addEvent = useFartStore((state) => state.addEvent);
  const settings = useFartStore((state) => state.settings);
  const updateSettings = useFartStore((state) => state.updateSettings);
  const { getIntensity, getIntensityLabel } = useFartIntensity();

  const recordFart = useCallback((durationMs: number) => {
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const newEvent = {
      timestamp: new Date(),
      durationMs,
    };

    const realEventId = addEvent(newEvent);
    setLastEventId(realEventId);
    setTimeout(() => {
      setShowTriggerModal(true);
    }, 500);
  }, [addEvent]);

  const startFart = useCallback(() => {
    setIsPressed(true);
    startTimeRef.current = Date.now();
    hasRecordedRef.current = false;
    setDuration(0);
    
    // Only play sounds in normal mode (not secret mode)
    if (settings.soundEffects && !isSecretMode) {
      soundStartTimeoutRef.current = setTimeout(() => {
        fartAudio.startFartSound().catch(console.warn);

        soundUpdateIntervalRef.current = setInterval(() => {
          if (startTimeRef.current) {
            const currentDuration = Date.now() - startTimeRef.current;
            fartAudio.updateFartSound(currentDuration);
          }
        }, 50);
      }, 500);
    }

    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const currentDuration = Date.now() - startTimeRef.current;
        setDuration(currentDuration);
      }
    }, 10);
  }, [settings.soundEffects, isSecretMode]);

  const endFart = useCallback(() => {
    if (!startTimeRef.current) return;
    
    const finalDuration = Date.now() - startTimeRef.current;
    setIsPressed(false);
    setDuration(0);
    
    // Only play sounds in normal mode (not secret mode)
    if (settings.soundEffects && !isSecretMode) {
      if (soundStartTimeoutRef.current) {
        clearTimeout(soundStartTimeoutRef.current);
        soundStartTimeoutRef.current = null;
      }
      fartAudio.stopFartSound();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (soundUpdateIntervalRef.current) {
      clearInterval(soundUpdateIntervalRef.current);
      soundUpdateIntervalRef.current = null;
    }
    
    // Only play quick fart sound in normal mode (not secret mode)
    if (settings.soundEffects && !isSecretMode && finalDuration < 500) {
      fartAudio.playQuickFart().catch(console.warn);
    }
    
    if (!hasRecordedRef.current) {
      recordFart(finalDuration);
    }
    
    startTimeRef.current = null;
  }, [recordFart, settings.soundEffects, isSecretMode]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startFart();
  }, [startFart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endFart();
  }, [endFart]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endFart();
  }, [endFart]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startFart();
  }, [startFart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    endFart();
  }, [endFart]);

  const toggleSound = useCallback(() => {
    updateSettings({ soundEffects: !settings.soundEffects });
  }, [settings.soundEffects, updateSettings]);

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (soundUpdateIntervalRef.current) {
        clearInterval(soundUpdateIntervalRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPressed) {
        endFart();
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isPressed) {
        endFart();
      }
    };

    if (isPressed) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      document.addEventListener('touchcancel', handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isPressed, endFart]);

  const currentIntensity = getIntensity(duration);
  const intensityLabel = getIntensityLabel(duration);

  return (
    <>
      <div className="flex flex-col items-center space-y-6">
        {/* Control Buttons Row */}
        <div className="flex items-center space-x-4">
          {/* Secret Mode Switch - Shows what mode you'll switch TO */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isSecretMode ? <EyeOff size={18} className="text-gray-700 dark:text-gray-200" /> : <Eye size={18} className="text-gray-700 dark:text-gray-200" />}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isSecretMode ? 'Secret Mode' : 'Secret Mode'}
              </span>
            </div>
            <button
              onClick={toggleSecretMode}
              className={`w-12 h-6 rounded-full transition-colors ${
                isSecretMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={isSecretMode ? 'Switch to Normal Mode' : 'Switch to Secret Mode'}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isSecretMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle Button - Only show in normal mode (not secret mode) */}
          {!isSecretMode && (
            <motion.button
              onClick={toggleSound}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                settings.soundEffects 
                  ? 'bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-200 dark:hover:bg-purple-700'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
              title={settings.soundEffects ? 'Sound ON - Click to turn off' : 'Sound OFF - Click to turn on'}
            >
              <span className="text-lg">
                {settings.soundEffects ? '🔊' : '🔇'}
              </span>
              <span className="text-sm font-medium">
                {settings.soundEffects ? 'Sound ON' : 'Sound OFF'}
              </span>
            </motion.button>
          )}
        </div>

        <div className="relative">
          <motion.div
            className={`
              w-48 h-48 rounded-full font-bold text-white text-2xl
              ${isSecretMode 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-purple-500 to-blue-600'
              }
              shadow-lg active:shadow-xl
              flex items-center justify-center
              transition-all duration-200
              select-none cursor-pointer
              ${isPressed ? 'scale-95' : 'hover:scale-105'}
            `}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
            animate={isPressed ? { 
              scale: [1, 1.1, 1],
              rotate: [0, 2, -2, 0]
            } : {}}
            transition={{ 
              duration: 0.5,
              repeat: isPressed ? Infinity : 0,
              ease: "easeInOut"
            }}
            style={{ 
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none'
            }}
          >
            <span className="text-4xl pointer-events-none">
              {isSecretMode ? '✅' : '💨'}
            </span>
          </motion.div>

          {/* Ripple effects */}
          {isPressed && (
            <>
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  isSecretMode ? 'bg-blue-300' : 'bg-purple-300'
                } opacity-30 pointer-events-none`}
                initial={{ scale: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className={`absolute inset-0 rounded-full ${
                  isSecretMode ? 'bg-indigo-300' : 'bg-blue-300'
                } opacity-20 pointer-events-none`}
                initial={{ scale: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
            </>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {isPressed 
              ? 'Keep holding...' 
              : isSecretMode 
                ? 'Hold to log task' 
                : 'Hold to log fart'
            }
          </p>
          
          {isPressed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className={`text-lg font-bold ${
                isSecretMode ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'
              }`}>
                {(duration / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentIntensity} {isSecretMode ? 'Effort Level' : intensityLabel}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Trigger Modal */}
      {lastEventId && (
        <TriggerModal
          isOpen={showTriggerModal}
          onClose={() => setShowTriggerModal(false)}
          eventId={lastEventId}
        />
      )}
    </>
  );
}