import React, { useState, useEffect } from 'react';
import { Cpu, Wifi, Shield, RefreshCw, Menu, X } from 'lucide-react';

interface HeaderProps {
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  demoMode, 
  setDemoMode, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 flex items-center justify-between text-slate-100 sticky top-0 z-50">
      {/* Left: Mobile Menu Button & Brand */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
          <span className="font-bold text-base md:text-lg tracking-wider text-white">UrbanSense <span className="text-blue-400">AI</span></span>
        </div>

        <div className="hidden lg:block text-xs border-l border-slate-700 pl-4 text-slate-400">
          <p className="font-medium text-slate-300">BHARAT ELECTRONICS LIMITED (BEL)</p>
          <p className="text-slate-500 font-mono text-[11px]">Mobile Urban Intelligence Platform | PS #26124</p>
        </div>
      </div>

      {/* Center Live Telemetry */}
      <div className="hidden xl:flex items-center space-x-6 text-xs font-mono">
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-slate-300">EDGE BUS STREAM: <span className="text-emerald-400 font-bold">10 BUSES ONLINE</span></span>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
          <Wifi className="w-4 h-4 text-blue-400" />
          <span>LATENCY: <span className="text-blue-300">24ms</span></span>
        </div>
        <div className="text-slate-400 border-l border-slate-800 pl-4">
          <span>{time}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 md:space-x-4">
        <button
          onClick={() => setDemoMode(!demoMode)}
          className={`flex items-center space-x-1.5 px-2.5 md:px-3 py-1.5 rounded-full text-[11px] md:text-xs font-semibold transition ${
            demoMode 
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10' 
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${demoMode ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">DEMO SIMULATION MODE</span>
          <span className="sm:hidden">DEMO</span>
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Shield className="w-4 h-4 text-indigo-400" />
          <div>
            <p className="font-semibold text-slate-200">BEL Officer</p>
            <p className="text-[10px] text-slate-400 uppercase">ADMIN ROLE</p>
          </div>
        </div>
      </div>
    </header>
  );
};
