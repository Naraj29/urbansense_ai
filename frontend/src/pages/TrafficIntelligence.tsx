import React, { useState, useEffect } from 'react';
import { Activity, Car, Bus, Truck, Bike, Footprints, AlertTriangle, Clock, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/api';

export const TrafficIntelligence: React.FC = () => {
  const [trafficData, setTrafficData] = useState<any>(null);
  const [odData, setOdData] = useState<any>(null);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const [tRes, odRes] = await Promise.all([
          apiService.getTrafficOverview(),
          apiService.getODFlow()
        ]);
        setTrafficData(tRes);
        setOdData(odRes);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTraffic();
  }, []);

  const classification = trafficData?.classification || {
    Car: 1420, Bus: 280, Truck: 190, Motorcycle: 2150, Bicycle: 340, Pedestrian: 890
  };

  const routesDelay = trafficData?.routes_delay || [];
  const hotspots = trafficData?.hotspots || [];
  const hourlyTrend = trafficData?.hourly_trend || [];
  const flows = odData?.flows || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <Activity className="w-5 h-5 text-blue-400" />
          <span>Traffic Intelligence & Flow Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">Edge AI multi-class vehicle detection, congestion hotspot mapping & route delay monitoring.</p>
      </div>

      {/* Vehicle Classification Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Cars</span>
            <Car className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Car}</p>
          <p className="text-[10px] text-slate-500 font-mono">42.8% volume</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Motorcycles</span>
            <Bike className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Motorcycle}</p>
          <p className="text-[10px] text-slate-500 font-mono">35.2% volume</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pedestrians</span>
            <Footprints className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Pedestrian}</p>
          <p className="text-[10px] text-slate-500 font-mono">Vulnerable Count</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Buses</span>
            <Bus className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Bus}</p>
          <p className="text-[10px] text-slate-500 font-mono">Public Transit</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Trucks / Heavy</span>
            <Truck className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Truck}</p>
          <p className="text-[10px] text-slate-500 font-mono">Freight Transit</p>
        </div>

        <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Bicycles</span>
            <Bike className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-white">{classification.Bicycle}</p>
          <p className="text-[10px] text-slate-500 font-mono">Non-Motorized</p>
        </div>
      </div>

      {/* Hourly Trend Chart & Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Volume Trend */}
        <div className="lg:col-span-2 bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Hourly Traffic Volume & Congestion Index</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">24h Moving Average</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyTrend}>
                <defs>
                  <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                <Area type="monotone" dataKey="volume" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Congestion Hotspots */}
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>Congestion Hotspots</span>
          </h3>

          <div className="space-y-3">
            {hotspots.map((h: any, idx: number) => (
              <div key={idx} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white">{h.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Avg Speed: <span className="text-amber-400">{h.avg_speed_kmh} km/h</span></p>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                  h.density === 'Severe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {h.density}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Delay Analytics Table */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Route Travel Delay Analytics</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Bus Corridor Route</th>
                <th className="p-3">Expected Time</th>
                <th className="p-3">Current Fleet Time</th>
                <th className="p-3">Route Delay</th>
                <th className="p-3">Congestion Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {routesDelay.map((r: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition">
                  <td className="p-3 font-semibold text-white">{r.route}</td>
                  <td className="p-3 font-mono">{r.expected_min} mins</td>
                  <td className="p-3 font-mono text-slate-200">{r.current_min} mins</td>
                  <td className="p-3 font-mono text-red-400 font-bold">+{r.delay_min} mins</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono border ${
                      r.status === 'Severe' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      r.status === 'High' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aggregated Origin-Destination (OD) Flow Matrix */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Aggregated Traffic Flow (Origin-Destination Analysis)</h3>
          <span className="text-[10px] bg-slate-900 text-amber-400 px-2.5 py-1 rounded border border-amber-500/30 font-mono">
            {odData?.disclaimer || 'Prototype / Aggregated Traffic Flow Analysis'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {flows.map((f: any, idx: number) => (
            <div key={idx} className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span>{f.origin}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                <span>{f.destination}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                <p>Est. Trips: <span className="text-emerald-400 font-bold">{f.passenger_trips}</span></p>
                <p className="text-[10px] text-slate-500">Peak: {f.peak_hour}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
