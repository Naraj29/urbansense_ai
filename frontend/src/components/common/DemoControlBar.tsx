import React, { useState } from 'react';
import { Play, Pause, Zap, AlertTriangle, Activity, Droplets, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { apiService } from '../../services/api';

interface DemoControlBarProps {
  onEventTriggered?: () => void;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ onEventTriggered }) => {
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [lastNotification, setLastNotification] = useState<string | null>(null);

  const handleToggleSim = async () => {
    try {
      const res = await apiService.toggleSimulation();
      setIsSimRunning(res.is_running);
      showNotification(`Simulation ${res.is_running ? 'Started' : 'Paused'}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrigger = async (eventType: string, severity: string = 'High') => {
    try {
      const res = await apiService.triggerDemoEvent(eventType, severity);
      showNotification(`Generated ${eventType} (${severity}) - Event #${res.event_id || 'Queued'}`);
      if (onEventTriggered) onEventTriggered();
    } catch (e) {
      console.error(e);
    }
  };

  const showNotification = (msg: string) => {
    setLastNotification(msg);
    setTimeout(() => setLastNotification(null), 4000);
  };

  return (
    <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shadow-inner">
      <div className="flex items-center space-x-3 text-xs font-semibold">
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded font-mono flex items-center space-x-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SIH JUDGING DEMO BAR</span>
        </span>

        <button
          onClick={handleToggleSim}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs transition ${
            isSimRunning ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {isSimRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isSimRunning ? 'Pause Sim' : 'Start Sim'}</span>
        </button>
      </div>

      {/* Trigger Buttons */}
      <div className="flex items-center space-x-2 text-xs overflow-x-auto">
        <button
          onClick={() => handleTrigger('Hit and Run', 'Critical')}
          className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 px-2.5 py-1 rounded transition"
        >
          <Zap className="w-3.5 h-3.5 text-red-400" />
          <span>⚡ Critical Hit & Run</span>
        </button>

        <button
          onClick={() => handleTrigger('Pothole', 'High')}
          className="flex items-center space-x-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded transition"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>🚧 Pothole</span>
        </button>

        <button
          onClick={() => handleTrigger('Traffic Congestion', 'High')}
          className="flex items-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded transition"
        >
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>🚦 Congestion</span>
        </button>

        <button
          onClick={() => handleTrigger('Waterlogging', 'Medium')}
          className="flex items-center space-x-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded transition"
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          <span>💧 Waterlogging</span>
        </button>

        <button
          onClick={() => handleTrigger('Rash Driving', 'Critical')}
          className="flex items-center space-x-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded transition"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
          <span>🚨 Rash Driving</span>
        </button>
      </div>

      {/* Trigger Notification Toast */}
      {lastNotification && (
        <div className="flex items-center space-x-2 text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 px-3 py-1 rounded animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lastNotification}</span>
        </div>
      )}
    </div>
  );
};
