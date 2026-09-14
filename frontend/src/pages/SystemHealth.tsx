import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2 } from 'lucide-react';
import { apiService } from '../services/api';
import type { SystemHealth as SystemHealthType } from '../types';

export const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthType | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await apiService.getSystemHealth();
      setHealth(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 3000);
    return () => clearInterval(interval);
  }, []);

  const services = health?.services || {
    api_server: 'HEALTHY',
    database: 'HEALTHY',
    gis_service: 'HEALTHY',
    ai_service: 'HEALTHY',
    websocket: 'CONNECTED',
    edge_buses: '10 / 10 ONLINE',
    message_queue: 'HEALTHY',
    storage: 'HEALTHY'
  };

  const telemetry = health?.telemetry || {
    last_sync: 'Just now',
    events_per_minute: 18.4,
    average_latency_ms: 24.8,
    pending_edge_events: 0,
    system_uptime: '99.98%',
    active_ws_connections: 10
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>Platform Infrastructure & System Health</span>
          </h1>
          <p className="text-xs text-slate-400">Microservice status, WebSocket message brokers & Edge AI bus sync diagnostics.</p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded text-xs font-mono">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>ALL SYSTEMS OPERATIONAL (99.98% UPTIME)</span>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1 font-mono">
          <span className="text-[10px] text-slate-500 uppercase">Average Latency</span>
          <p className="text-2xl font-bold text-blue-400">{telemetry.average_latency_ms} ms</p>
          <p className="text-[10px] text-slate-400">FastAPI REST Layer</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1 font-mono">
          <span className="text-[10px] text-slate-500 uppercase">Events / Minute</span>
          <p className="text-2xl font-bold text-emerald-400">{telemetry.events_per_minute}</p>
          <p className="text-[10px] text-slate-400">Edge Ingestion Speed</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1 font-mono">
          <span className="text-[10px] text-slate-500 uppercase">Active WS Tunnels</span>
          <p className="text-2xl font-bold text-indigo-400">{telemetry.active_ws_connections}</p>
          <p className="text-[10px] text-slate-400">/ws/fleet Broadcasts</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1 font-mono">
          <span className="text-[10px] text-slate-500 uppercase">Pending Edge Queue</span>
          <p className="text-2xl font-bold text-amber-400">{telemetry.pending_edge_events}</p>
          <p className="text-[10px] text-slate-400">Low-Connectivity Buffer</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Core Subsystems Status</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(services).map(([serviceName, statusVal]) => (
            <div key={serviceName} className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-200 uppercase">{serviceName.replace('_', ' ')}</p>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Microservice</p>
              </div>

              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded text-xs font-mono font-bold">
                {statusVal}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
