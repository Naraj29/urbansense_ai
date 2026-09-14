import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DemoControlBar } from './components/common/DemoControlBar';

import { OverviewDashboard } from './pages/OverviewDashboard';
import { LiveFleet } from './pages/LiveFleet';
import { GISUrbanMap } from './pages/GISUrbanMap';
import { RoadConditions } from './pages/RoadConditions';
import { TrafficIntelligence } from './pages/TrafficIntelligence';
import { IncidentIntelligence } from './pages/IncidentIntelligence';
import { AuthorityActions } from './pages/AuthorityActions';
import { EdgeAIConsole } from './pages/EdgeAIConsole';
import { AIDetectionLab } from './pages/AIDetectionLab';
import { Analytics } from './pages/Analytics';
import { SystemHealth } from './pages/SystemHealth';

export const App: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleEventTriggered = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#0b132b] text-slate-100 flex flex-col font-sans antialiased">
        {/* Top Header */}
        <Header 
          demoMode={demoMode} 
          setDemoMode={setDemoMode} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Demo Mode Trigger Toolbar for Judges */}
        {demoMode && <DemoControlBar onEventTriggered={handleEventTriggered} />}

        {/* Main Content Layout */}
        <div className="flex flex-1 relative">
          <Sidebar 
            mobileOpen={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />

          <main className="flex-1 min-w-0 overflow-y-auto bg-[#0b132b] p-2 sm:p-4 md:p-6">
            <Routes>
              <Route path="/" element={<OverviewDashboard key={refreshTrigger} />} />
              <Route path="/fleet" element={<LiveFleet />} />
              <Route path="/map" element={<GISUrbanMap key={refreshTrigger} />} />
              <Route path="/road-conditions" element={<RoadConditions />} />
              <Route path="/traffic" element={<TrafficIntelligence />} />
              <Route path="/incidents" element={<IncidentIntelligence />} />
              <Route path="/authority-actions" element={<AuthorityActions key={refreshTrigger} />} />
              <Route path="/edge-console" element={<EdgeAIConsole />} />
              <Route path="/ai-lab" element={<AIDetectionLab />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/system-health" element={<SystemHealth />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
