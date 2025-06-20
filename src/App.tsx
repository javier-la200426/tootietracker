import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { StealthProvider } from './contexts/StealthContext';
import { Header, Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Map } from './pages/Map';
import { Settings } from './pages/Settings';
import { useFartStore } from './store/fartStore';

function App() {
  const settings = useFartStore((state) => state.settings);

  return (
    <StealthProvider>
      <Router>
        <div className={`min-h-screen ${settings.darkMode ? 'dark' : ''}`}>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/map" element={<Map />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </Router>
    </StealthProvider>
  );
}

export default App;