import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, Settings, Wind } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-t border-purple-200 fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-purple-600 bg-purple-100'
                    : 'text-gray-600 hover:text-purple-500 hover:bg-purple-50'
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
  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
      <div className="max-w-md mx-auto flex items-center justify-center space-x-2">
        <Wind size={24} />
        <h1 className="text-xl font-bold">Fart Tracker</h1>
      </div>
    </header>
  );
}