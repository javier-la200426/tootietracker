import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useFartStore } from '../store/fartStore';
import { useFartIntensity } from '../hooks/useFartIntensity';
import { TriggerModal } from './TriggerModal';

export function FartButton() {
  const [isPressed, setIsPressed] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [lastEventId, setLastEventId] = useState<string | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRecordedRef = useRef<boolean>(false); // Track if we've already recorded for this interaction
  const addEvent = useFartStore((state) => state.addEvent);
  const { getIntensity, getIntensityLabel } = useFartIntensity();

  const recordFart = useCallback((durationMs: number) => {
    // Prevent double recording
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const eventId = crypto.randomUUID();
    const newEvent = {
      id: eventId,
      timestamp: new Date(),
      durationMs,
    };
    
    console.log('Recording fart event:', newEvent); // Debug log
    
    // Add the event to the store
    addEvent({
      timestamp: newEvent.timestamp,
      durationMs: newEvent.durationMs,
    });
    
    // Show trigger modal after a short delay
    setLastEventId(eventId);
    setTimeout(() => {
      setShowTriggerModal(true);
    }, 500);
  }, [addEvent]);

  const startFart = useCallback(() => {
    setIsPressed(true);
    startTimeRef.current = Date.now();
    hasRecordedRef.current = false; // Reset recording flag
    setDuration(0);
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setDuration(Date.now() - startTimeRef.current);
      }
    }, 10);
  }, []);

  const endFart = useCallback(() => {
    if (!startTimeRef.current) return;
    
    const finalDuration = Date.now() - startTimeRef.current;
    setIsPressed(false);
    setDuration(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Only record if we haven't already recorded and duration is meaningful
    if (!hasRecordedRef.current && finalDuration >= 50) {
      recordFart(finalDuration);
    }
    
    startTimeRef.current = null;
  }, [recordFart]);

  // Handle simple click/tap (for very quick taps)
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only record a quick tap if we're not in a press interaction and haven't recorded yet
    if (!isPressed && !startTimeRef.current && !hasRecordedRef.current) {
      recordFart(100); // Default 0.1 second for quick taps
    }
  }, [recordFart, isPressed]);

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

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Add global mouse up listener to handle cases where mouse is released outside the button
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
        <div className="relative">
          <motion.div
            className={`
              w-48 h-48 rounded-full font-bold text-white text-2xl
              bg-gradient-to-br from-purple-500 to-blue-600
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
            <span className="text-4xl pointer-events-none">💨</span>
          </motion.div>

          {/* Ripple effects */}
          {isPressed && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-purple-300 opacity-30 pointer-events-none"
                initial={{ scale: 1 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-blue-300 opacity-20 pointer-events-none"
                initial={{ scale: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
              />
            </>
          )}
        </div>

        <div className="text-center space-y-2">
          <p className="text-gray-600 font-medium">
            {isPressed ? 'Keep holding...' : 'Hold to log fart'}
          </p>
          
          {isPressed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1"
            >
              <p className="text-lg font-bold text-purple-600">
                {(duration / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-gray-500">
                {currentIntensity} {intensityLabel}
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