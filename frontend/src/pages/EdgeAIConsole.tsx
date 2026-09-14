import React, { useState, useEffect } from 'react';
import { Cpu, Database } from 'lucide-react';
import { apiService } from '../services/api';

export const EdgeAIConsole: React.FC = () => {
  const [statusData, setStatusData] = useState<any>(null);
  const [selectedBusId, setSelectedBusId] = useState<number>(1);

  const fetchConsoleStatus = async () => {
    try {
      const res = await apiService.getEdgeConsoleStatus();
      setStatusData(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchConsoleStatus();
    const interval = setInterval(fetchConsoleStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const selectedBus = statusData?.buses?.find((b: any) => b.bus_id === selectedBusId) || statusData?.buses?.[0];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Onboard Edge AI Device Console</span>
          </h1>
          <p className="text-xs text-slate-400">Emulates NVIDIA Jetson onboard bus computer processing local camera feeds & filtering events.</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 font-mono text-slate-300">
            TOTAL TRANSMITTED: <span className="text-emerald-400 font-bold">{statusData?.total_transmitted_events || 142}</span>
          </div>
        </div>
      </div>

      {/* Main Console Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bus Selector */}
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-3">
          <h3 className="font-bold text-sm text-white">Connected Bus Units</h3>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {statusData?.buses?.map((bus: any) => (
              <div
                key={bus.bus_id}
                onClick={() => setSelectedBusId(bus.bus_id)}
                className={`p-3 rounded-lg border cursor-pointer transition text-xs ${
                  selectedBusId === bus.bus_id
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{bus.bus_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    bus.network_status === 'Online' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {bus.network_status}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mt-1">{bus.route}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Bus Edge Processing Telemetry */}
        {selectedBus && (
          <div className="lg:col-span-2 bg-[#1e293b] p-6 rounded-xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-mono">{selectedBus.bus_number} Edge Terminal</h3>
                <p className="text-xs text-slate-400">{selectedBus.route}</p>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-emerald-400">
                  FPS: {selectedBus.fps}
                </span>
                <span className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-blue-400">
                  {selectedBus.inference_status}
                </span>
              </div>
            </div>

            {/* Camera Streams Grid Simulator */}
            <div className="grid grid-cols-2 gap-4">
              {['Front Camera (Main Detector)', 'Rear Camera (ANPR)', 'Left Side Camera (Lane Weaver)', 'Right Side Camera (Infra Audit)'].map((camName, idx) => (
                <div key={idx} className="bg-slate-950 rounded-lg border border-slate-800 p-3 relative h-40 flex flex-col justify-between overflow-hidden group">
                  <div className="flex items-center justify-between text-[11px] font-mono z-10">
                    <span className="bg-slate-900/90 text-slate-300 px-2 py-0.5 rounded border border-slate-800">{camName}</span>
                    <span className="text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      <span>LIVE</span>
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center text-slate-700 font-mono text-xs select-none">
                    [RAW VIDEO FEED - PROCESSED ON EDGE]
                  </div>

                  <div className="z-10 bg-slate-900/90 p-2 rounded border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>Bounding Boxes: Active</span>
                    <span className="text-blue-400 font-bold">14.8ms</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Event Buffer & Local Queue Information */}
            <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                  <Database className="w-4 h-4 text-amber-400" />
                  <span>Low-Connectivity Event Queue Buffer</span>
                </span>
                <span className="text-amber-400 font-bold">
                  {selectedBus.pending_queue_count} Pending Batch Uploads
                </span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                When network drops to Offline, full videos are NOT transmitted. Edge AI filters high-confidence defect metadata into a localized queue, transmitting batch JSON payloads immediately upon network restoration.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
