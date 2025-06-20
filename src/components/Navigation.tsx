import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, MapPin, Settings, Wind, CheckSquare } from 'lucide-react';
import { useStealthMode } from '../contexts/StealthContext';

export function Navigation() {
  const location = useLocation();
  const { isSecretMode } = useStealthMode();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: isSecretMode ? 'Tasks' : 'Home' 
    },
    { 
      path: '/dashboard', 
      icon: BarChart3, 
      label: isSecretMode ? 'Analytics' : 'Dashboard' 
    },
    { 
      path: '/map', 
      icon: MapPin, 
      label: isSecretMode ? 'Locations' : 'Map' 
    },
    { 
      path: '/settings', 
      icon: Settings, 
      label: 'Settings' 
    },
  ];

  return (
    <nav className={`${
      isSecretMode 
        ? 'bg-white/90 backdrop-blur-sm border-t border-blue-200 dark:bg-gray-800/90 dark:border-blue-700' 
        : 'bg-white/90 backdrop-blur-sm border-t border-purple-200 dark:bg-gray-800/90 dark:border-purple-700'
    } fixed bottom-0 left-0 right-0 z-50`}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? isSecretMode
                      ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
                      : 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900'
                    : isSecretMode
                      ? 'text-gray-600 hover:text-blue-500 hover:bg-blue-50 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-blue-900'
                      : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50 dark:text-gray-300 dark:hover:text-purple-400 dark:hover:bg-purple-900'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function Header() {
  const { isSecretMode } = useStealthMode();

  return (
    <header className={`${
      isSecretMode 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700' 
        : 'bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-700 dark:to-blue-700'
    } text-white p-4`}>
      <div className="max-w-md mx-auto flex items-center justify-center space-x-2">
        {isSecretMode ? <CheckSquare size={24} /> : <Wind size={24} />}
        <h1 className="text-xl font-bold">
          {isSecretMode ? 'Task Tracker' : 'Fart Tracker'}
        </h1>
      </div>
    </header>
  );
}