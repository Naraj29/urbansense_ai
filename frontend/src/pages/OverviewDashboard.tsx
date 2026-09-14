import React, { useState, useEffect } from 'react';
import { 
  Bus as BusIcon, 
  AlertTriangle, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Eye 
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { apiService } from '../services/api';
import type { DetectionEvent, Bus } from '../types';
import { EventDetailModal } from '../components/events/EventDetailModal';

export const OverviewDashboard: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  const fetchData = async () => {
    try {
      const [busesData, eventsData, analyticsData] = await Promise.all([
        apiService.getBuses(),
        apiService.getEvents({ limit: 10 }),
        apiService.getAnalyticsOverview()
      ]);
      setBuses(busesData);
      setEvents(eventsData);
      setAnalytics(analyticsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const kpis = analytics?.kpis || {
    active_buses: 10,
    events_today: 142,
    critical_alerts: 12,
    road_issues: 48,
    traffic_hotspots: 4,
    open_incidents: 19,
    resolved_issues: 86
  };

  const distributionData = [
    { name: 'Road Hazards', value: analytics?.event_distribution?.['Road Hazards'] || 48, color: '#f59e0b' },
    { name: 'Traffic', value: analytics?.event_distribution?.['Traffic'] || 32, color: '#3b82f6' },
    { name: 'Infrastructure', value: analytics?.event_distribution?.['Infrastructure'] || 24, color: '#a855f7' },
    { name: 'Safety Incidents', value: analytics?.event_distribution?.['Safety Incidents'] || 16, color: '#ef4444' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>Urban Intelligence Overview</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded font-mono">LIVE TELEMETRY</span>
          </h1>
          <p className="text-xs text-slate-400">Mobile sensing telemetry from public transport fleet across Prayagraj Metropolitan Area.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>REALTIME DATA SYNC ACTIVE</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Active Buses</span>
            <BusIcon className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-white">{kpis.active_buses}</p>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>100% Operational</span>
            </span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Events Today</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-white">{kpis.events_today}</p>
            <span className="text-[10px] text-blue-400 font-mono">+18 in last hour</span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Critical Alerts</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-red-400">{kpis.critical_alerts}</p>
            <span className="text-[10px] text-red-400 font-mono">Action Required</span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Road Defects</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-amber-400">{kpis.road_issues}</p>
            <span className="text-[10px] text-slate-400 font-mono">Potholes & Erosion</span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Traffic Hotspots</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-cyan-400">{kpis.traffic_hotspots}</p>
            <span className="text-[10px] text-slate-400 font-mono">Severe Delay Zones</span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Open Incidents</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-purple-400">{kpis.open_incidents}</p>
            <span className="text-[10px] text-slate-400 font-mono">In Workflow</span>
          </div>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-400">{kpis.resolved_issues}</p>
            <span className="text-[10px] text-emerald-400 font-mono">Feedback Logged</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Alerts Feed & Event Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts Feed */}
        <div className="lg:col-span-2 bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Recent Edge AI Detections</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Live Stream Feed</span>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 6).map((ev) => (
              <div 
                key={ev.id}
                onClick={() => setSelectedEvent(ev)}
                className="bg-slate-900/80 hover:bg-slate-800 p-3.5 rounded-lg border border-slate-800/80 transition flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    ev.severity === 'Critical' ? 'bg-red-500 animate-ping' :
                    ev.severity === 'High' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm text-white group-hover:text-blue-400 transition">{ev.event_type}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        ev.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                        ev.severity === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      }`}>
                        {ev.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center space-x-3 mt-1 font-mono">
                      <span>Bus: {ev.bus_number || `BUS-${ev.bus_id}`}</span>
                      <span>Confidence: {(ev.confidence * 100).toFixed(0)}%</span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span>{ev.latitude.toFixed(4)}, {ev.longitude.toFixed(4)}</span>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Eye className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown & Fleet Status List */}
        <div className="space-y-6">
          {/* Event Distribution Donut */}
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-3">
            <h3 className="font-bold text-sm text-white">Detection Distribution</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              {distributionData.map((d) => (
                <div key={d.name} className="flex items-center space-x-2 text-slate-300 font-mono">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] truncate">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Buses Mini List */}
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <BusIcon className="w-4 h-4 text-emerald-400" />
                <span>Live Fleet Nodes</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">10 Active</span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {buses.map((b) => (
                <div key={b.id} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-200">{b.bus_number}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">{b.route}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                      b.network_status === 'Online' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      b.network_status === 'Weak Network' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {b.network_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={fetchData}
      />
    </div>
  );
};
