import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Navigation, Trash2, Filter, Eye, EyeOff, Locate, ZoomIn, ZoomOut } from 'lucide-react';
import L from 'leaflet';
import { useFartStore } from '../store/fartStore';
import { useStealthMode } from '../contexts/StealthContext';
import { useFartIntensity } from '../hooks/useFartIntensity';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapEvent {
  id: string;
  lat: number;
  lng: number;
  timestamp: Date;
  durationMs: number;
  smellIntensity?: any;
  triggers?: any[];
}

// Custom marker icons based on intensity
const createCustomIcon = (intensity: string, isSecretMode: boolean) => {
  const colorMap: { [key: string]: string } = {
    '🌬️': '#10b981', // Green for light
    '💨': '#3b82f6', // Blue for medium
    '🔥': '#f59e0b', // Orange for strong
    '💥': '#ef4444', // Red for epic
    '🌪️': '#8b5cf6', // Purple for tornado
    '🌌': '#6366f1', // Indigo for cosmic
  };

  const color = colorMap[intensity] || '#6b7280';
  const emoji = isSecretMode ? '✅' : intensity;
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ${emoji}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// User location marker
const createUserLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #3b82f6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -10px;
          left: -10px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(59, 130, 246, 0.3);
          animation: pulse 2s infinite;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

// Map controls component
function MapControls({ onLocateUser, onZoomIn, onZoomOut }: {
  onLocateUser: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
      <button
        onClick={onLocateUser}
        className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Find my location"
      >
        <Locate size={20} className="text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={onZoomIn}
        className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Zoom in"
      >
        <ZoomIn size={20} className="text-gray-700 dark:text-gray-200" />
      </button>
      <button
        onClick={onZoomOut}
        className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        title="Zoom out"
      >
        <ZoomOut size={20} className="text-gray-700 dark:text-gray-200" />
      </button>
    </div>
  );
}

// Map event handlers
function MapEventHandler({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

export function Map() {
  const { isSecretMode } = useStealthMode();
  const events = useFartStore((state) => state.events);
  const settings = useFartStore((state) => state.settings);
  const deleteEvent = useFartStore((state) => state.deleteEvent);
  const { getIntensity, getIntensityLabel, getIntensityColor } = useFartIntensity();
  
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]); // Default to SF
  const [mapZoom, setMapZoom] = useState(13);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);
  const [filterIntensity, setFilterIntensity] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // Filter events that have location data
  const mapEvents: MapEvent[] = events
    .filter(event => event.location)
    .map(event => ({
      id: event.id,
      lat: event.location!.lat,
      lng: event.location!.lng,
      timestamp: event.timestamp,
      durationMs: event.durationMs,
      smellIntensity: event.smellIntensity,
      triggers: event.triggers,
    }));

  // Filter events based on intensity filter
  const filteredEvents = mapEvents.filter(event => {
    if (filterIntensity === 'all') return true;
    const intensity = getIntensity(event.durationMs);
    return intensity === filterIntensity;
  });

  // Get user's current location
  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter([location.lat, location.lng]);
          setMapZoom(15);
          
          // Fly to user location if map is ready
          if (mapInstance) {
            mapInstance.flyTo([location.lat, location.lng], 15, {
              duration: 1.5
            });
          }
        },
        (error) => {
          console.warn('Could not get user location:', error);
          alert('Could not access your location. Please check your browser permissions.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Initialize user location on component mount
  useEffect(() => {
    locateUser();
  }, []);

  const handleMapReady = (map: L.Map) => {
    setMapInstance(map);
  };

  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const intensityOptions = [
    { value: 'all', label: 'All', emoji: '🌍' },
    { value: '🌬️', label: 'Light', emoji: '🌬️' },
    { value: '💨', label: 'Medium', emoji: '💨' },
    { value: '🔥', label: 'Strong', emoji: '🔥' },
    { value: '💥', label: 'Epic', emoji: '💥' },
    { value: '🌪️', label: 'Tornado', emoji: '🌪️' },
    { value: '🌌', label: 'Cosmic', emoji: '🌌' },
  ];

  const stealthIntensityOptions = [
    { value: 'all', label: 'All', emoji: '🌍' },
    { value: '🌬️', label: 'Brief', emoji: '🌬️' },
    { value: '💨', label: 'Quick', emoji: '💨' },
    { value: '🔥', label: 'Medium', emoji: '🔥' },
    { value: '💥', label: 'Big', emoji: '💥' },
    { value: '🌪️', label: 'Major', emoji: '🌪️' },
    { value: '🌌', label: 'Epic', emoji: '🌌' },
  ];

  const currentIntensityOptions = isSecretMode ? stealthIntensityOptions : intensityOptions;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen pb-20 ${
        isSecretMode 
          ? 'bg-gradient-to-br from-blue-100 via-indigo-50 to-slate-100 dark:from-blue-900 dark:via-indigo-900 dark:to-slate-900' 
          : 'bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900'
      }`}
    >
      <div className="max-w-md mx-auto px-4 pt-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {isSecretMode ? 'Task Locations' : 'Fart Map'}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isSecretMode 
              ? 'See where you completed your tasks' 
              : 'See where you let it rip'
            }
          </p>
        </motion.div>

        {/* Filter Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filters</span>
            </div>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs transition-all ${
                showHeatmap
                  ? isSecretMode
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {showHeatmap ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>Heatmap</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {currentIntensityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterIntensity(option.value)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm transition-all ${
                  filterIntensity === option.value
                    ? isSecretMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Interactive Map Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 relative"
        >
          <div className="h-80 relative">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              className="rounded-xl"
            >
              <MapEventHandler onMapReady={handleMapReady} />
              
              {/* Map tiles - using OpenStreetMap */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={createUserLocationIcon()}
                >
                  <Popup>
                    <div className="text-center">
                      <p className="font-semibold">📍 Your Location</p>
                      <p className="text-sm text-gray-600">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Event markers */}
              {filteredEvents.map((event) => {
                const intensity = getIntensity(event.durationMs);
                const label = getIntensityLabel(event.durationMs);
                const stealthLabel = isSecretMode ? 
                  label.replace('Fart', 'Task').replace('fart', 'task') : 
                  label;

                return (
                  <Marker
                    key={event.id}
                    position={[event.lat, event.lng]}
                    icon={createCustomIcon(intensity, isSecretMode)}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{stealthLabel}</h3>
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title={`Delete this ${isSecretMode ? 'task' : 'fart'}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span className="font-medium">{(event.durationMs / 1000).toFixed(1)}s</span>
                          </div>
                          
                          {event.smellIntensity && (
                            <div className="flex justify-between">
                              <span>{isSecretMode ? 'Difficulty:' : 'Smell:'}</span>
                              <span className="font-medium">
                                {event.smellIntensity.emoji} {event.smellIntensity.label}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex justify-between">
                            <span>Time:</span>
                            <span className="font-medium">
                              {new Date(event.timestamp).toLocaleString([], { 
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                          
                          {event.triggers && event.triggers.length > 0 && (
                            <div>
                              <span className="text-gray-600">{isSecretMode ? 'Tools:' : 'Triggers:'}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {event.triggers.map((trigger) => (
                                  <span 
                                    key={trigger.id}
                                    className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                  >
                                    <span>{trigger.emoji}</span>
                                    <span>{trigger.label}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs text-gray-500 pt-2 border-t">
                            📍 {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map Controls */}
            <MapControls
              onLocateUser={locateUser}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
          </div>
        </motion.div>

        {/* Event List */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {isSecretMode ? 'Recent Task Locations' : 'Recent Fart Locations'}
          </h3>
          
          {filteredEvents.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <Navigation size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">
                {mapEvents.length === 0 
                  ? isSecretMode ? 'No task locations yet!' : 'No fart locations yet!'
                  : 'No events match your filter'
                }
              </p>
              <p className="text-sm">
                {mapEvents.length === 0 
                  ? isSecretMode 
                    ? 'Add location when logging tasks to see them here'
                    : 'Add location when logging farts to see them here'
                  : 'Try adjusting your intensity filter'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.slice(0, 10).map((event) => {
                const intensity = getIntensity(event.durationMs);
                const label = getIntensityLabel(event.durationMs);
                const colorClass = getIntensityColor(event.durationMs);
                const stealthLabel = isSecretMode ? 
                  label.replace('Fart', 'Task').replace('fart', 'task') : 
                  label;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (mapInstance) {
                        mapInstance.flyTo([event.lat, event.lng], 16, {
                          duration: 1.5
                        });
                      }
                    }}
                  >
                    {/* Location Pin */}
                    <div className="flex items-center space-x-3 mr-4">
                      <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm bg-blue-500" />
                      <span className="text-2xl">{isSecretMode ? '✅' : intensity}</span>
                      {event.smellIntensity && (
                        <span className="text-xl" title={`${isSecretMode ? 'Difficulty' : 'Smell'}: ${event.smellIntensity.label}`}>
                          {event.smellIntensity.emoji}
                        </span>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`font-semibold text-lg ${colorClass} dark:brightness-110`}>
                          {stealthLabel}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {(event.durationMs / 1000).toFixed(1)}s
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.timestamp).toLocaleString([], { 
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </p>
                        
                        {/* Trigger Emojis */}
                        {event.triggers && event.triggers.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {event.triggers.slice(0, 3).map((trigger) => (
                              <span 
                                key={trigger.id} 
                                className="text-sm" 
                                title={trigger.label}
                              >
                                {trigger.emoji}
                              </span>
                            ))}
                            {event.triggers.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">
                                +{event.triggers.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEvent(event.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all ml-3 opacity-0 group-hover:opacity-100"
                      title={`Delete this ${isSecretMode ? 'task' : 'fart'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Stats Summary */}
        {mapEvents.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mt-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Location Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {mapEvents.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isSecretMode ? 'Tasks' : 'Farts'} Tracked
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {new Set(mapEvents.map(e => `${Math.round(e.lat * 100)},${Math.round(e.lng * 100)}`)).size}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Unique Locations
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}