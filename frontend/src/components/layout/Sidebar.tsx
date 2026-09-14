import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Bus, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  CheckSquare, 
  Cpu, 
  Sparkles, 
  BarChart3, 
  Server,
  X 
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/fleet', label: 'Live Fleet', icon: Bus },
  { path: '/map', label: 'Urban Map', icon: MapPin },
  { path: '/road-conditions', label: 'Road Conditions', icon: AlertTriangle },
  { path: '/traffic', label: 'Traffic Intelligence', icon: Activity },
  { path: '/incidents', label: 'Incidents & ANPR', icon: ShieldAlert },
  { path: '/authority-actions', label: 'Authority Actions', icon: CheckSquare },
  { path: '/edge-console', label: 'Edge AI Console', icon: Cpu },
  { path: '/ai-lab', label: 'AI Detection Lab', icon: Sparkles },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/system-health', label: 'System Health', icon: Server },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col justify-between select-none shrink-0 transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="py-4 overflow-y-auto">
          <div className="px-4 mb-3 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">Command Operations</span>
            {mobileOpen && (
              <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 m-2 rounded-lg text-[11px] text-slate-400">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Edge Pipeline Active</span>
          </div>
          <p className="text-[10px] text-slate-500">NVIDIA Jetson AGX / Orin Architecture Ready</p>
        </div>
      </aside>
    </>
  );
};
