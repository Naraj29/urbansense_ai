import React, { useState, useEffect } from 'react';
import { Bus as BusIcon, Camera, MapPin, Cpu } from 'lucide-react';
import { apiService } from '../services/api';
import type { Bus } from '../types';

export const LiveFleet: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const fetchFleet = async () => {
    try {
      const res = await apiService.getBuses();
      setBuses(res);
      if (!selectedBus && res.length > 0) setSelectedBus(res[0]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchFleet();
    const interval = setInterval(fetchFleet, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleNetworkChange = async (busId: number, status: string) => {
    try {
      await apiService.setBusNetworkStatus(busId, status);
      fetchFleet();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <BusIcon className="w-5 h-5 text-emerald-400" />
            <span>Mobile Sensing Fleet Nodes</span>
          </h1>
          <p className="text-xs text-slate-400">Onboard Edge AI telemetry, camera sensor health & network state simulation.</p>
        </div>

        <div className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-emerald-400">
          10 BUSES DEPLOYED | 40 CAMERAS ACTIVE
        </div>
      </div>

      {/* Main Grid: Bus Cards & Detailed Telemetry Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Fleet Bus Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {buses.map((bus) => (
            <div
              key={bus.id}
              onClick={() => setSelectedBus(bus)}
              className={`p-4 rounded-xl border transition cursor-pointer ${
                selectedBus?.id === bus.id
                  ? 'bg-blue-600/10 border-blue-500 shadow-lg'
                  : 'bg-[#1e293b] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BusIcon className="w-5 h-5 text-blue-400" />
                  <span className="font-bold text-white text-sm">{bus.bus_number}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                  bus.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {bus.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2 font-mono truncate">{bus.route}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-[11px]">
                <div className="flex items-center space-x-1.5 text-slate-300">
                  <Camera className="w-3.5 h-3.5 text-indigo-400" />
                  <span>4 AI Cameras</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>{bus.latitude.toFixed(3)}, {bus.longitude.toFixed(3)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 text-[10px] text-slate-400 font-mono border-t border-slate-800/60">
                <span>NETWORK:</span>
                <span className={`font-bold ${
                  bus.network_status === 'Online' ? 'text-emerald-400' :
                  bus.network_status === 'Weak Network' ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {bus.network_status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Single Bus Edge AI Telemetry */}
        {selectedBus && (
          <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-5 sticky top-24">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span>{selectedBus.bus_number}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedBus.route}</p>
            </div>

            {/* Network State Controls for Low-Connectivity Queueing Demo */}
            <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Network Connectivity Simulation
              </span>
              <p className="text-[11px] text-slate-400 leading-tight">
                Simulate low/offline connectivity to test local Edge queue batch uploads.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  onClick={() => handleNetworkChange(selectedBus.id, 'Online')}
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    selectedBus.network_status === 'Online'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Online
                </button>
                <button
                  onClick={() => handleNetworkChange(selectedBus.id, 'Weak Network')}
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    selectedBus.network_status === 'Weak Network'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Weak
                </button>
                <button
                  onClick={() => handleNetworkChange(selectedBus.id, 'Offline')}
                  className={`py-1.5 text-xs font-semibold rounded border transition ${
                    selectedBus.network_status === 'Offline'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Offline
                </button>
              </div>
            </div>

            {/* Camera Streams Health */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Camera Sensor Matrix</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {['Front', 'Rear', 'Left', 'Right'].map((cam) => (
                  <div key={cam} className="bg-slate-900 p-2.5 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-300 font-semibold">{cam}</span>
                    <span className="text-[10px] text-emerald-400 font-mono">30 FPS</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge AI Telemetry details */}
            <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-xs font-mono space-y-1 text-slate-300">
              <p>Device: NVIDIA Jetson Orin AGX Node</p>
              <p>Model: YOLOv8-Custom-Urban v1.2</p>
              <p>Inference Latency: 16.4ms</p>
              <p>Queue Buffer: {selectedBus.network_status === 'Offline' ? '4 Pending' : '0 Clean'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
