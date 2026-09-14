import React, { useState, useEffect } from 'react';
import { AlertTriangle, Droplets, Shield, Activity, MapPin } from 'lucide-react';
import { apiService } from '../services/api';

export const RoadConditions: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchRoadData = async () => {
      try {
        const res = await apiService.getRoadConditions();
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRoadData();
  }, []);

  const metrics = data?.metrics || {
    potholes_detected: 42,
    damaged_roads_detected: 28,
    waterlogging_zones: 14,
    infrastructure_deficiencies: 18,
    total_road_defects: 102
  };

  const clusters = data?.clusters || [
    { location: 'Naini Bridge Approach Road', potholes: 12, waterlogging: 3, score: 38, rating: 'Critical', lat: 25.4190, lng: 81.8620 },
    { location: 'Subedarganj Station Corridor', potholes: 8, waterlogging: 5, score: 52, rating: 'Poor', lat: 25.4430, lng: 81.7980 },
    { location: 'Civil Lines MG Marg Segment', potholes: 3, waterlogging: 1, score: 78, rating: 'Moderate', lat: 25.4525, lng: 81.8349 },
    { location: 'Phaphamau Highway Link', potholes: 15, waterlogging: 8, score: 28, rating: 'Critical', lat: 25.4820, lng: 81.8550 },
    { location: 'Katra Market Main Square', potholes: 4, waterlogging: 2, score: 71, rating: 'Moderate', lat: 25.4600, lng: 81.8500 },
  ];

  const score = data?.rci_score || 58.4;
  const rating = data?.rci_rating || 'Poor';

  const getScoreColor = (r: string) => {
    switch (r) {
      case 'Good': return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
      case 'Moderate': return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'Poor': return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
      default: return 'text-red-400 border-red-500/40 bg-red-500/10';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <span>Road Condition Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">Automated surface degradation monitoring, pothole density mapping & infrastructure audit.</p>
      </div>

      {/* RCI Score & Defect Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Prototype RCI Score Gauge */}
        <div className="md:col-span-2 bg-[#1e293b] p-6 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prototype Road Condition Index</span>
            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">
              Multi-Factor Score
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-extrabold text-white">{score} <span className="text-lg font-normal text-slate-400">/ 100</span></p>
              <div className={`mt-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getScoreColor(rating)}`}>
                <Shield className="w-3.5 h-3.5" />
                <span>OVERALL STATUS: {rating.toUpperCase()}</span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-amber-500 border-r-amber-500 flex items-center justify-center font-bold text-lg text-slate-200">
              {score}%
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800/80">
            * <span className="font-semibold text-slate-300">Prototype Road Condition Index:</span> Calculated from weighted pothole frequency, surface cracking, waterlogging severity, and repeated bus detection timestamps.
          </p>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="md:col-span-3 grid grid-cols-2 gap-4">
          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Potholes Detected</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.potholes_detected}</p>
            <p className="text-[11px] text-amber-400">Requires Surface Patching</p>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Damaged Road Surfaces</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.damaged_roads_detected}</p>
            <p className="text-[11px] text-blue-400">Erosion & Cracking</p>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Waterlogging Zones</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.waterlogging_zones}</p>
            <p className="text-[11px] text-cyan-400">Drainage Failure</p>
          </div>

          <div className="bg-[#1e293b] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Infra Deficiencies</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">{metrics.infrastructure_deficiencies}</p>
            <p className="text-[11px] text-purple-400">Dividers & Signs</p>
          </div>
        </div>
      </div>

      {/* Pothole & Defect Clusters Table */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-red-400" />
          <span>High-Defect Density Corridors & Clusters</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Corridor / Location</th>
                <th className="p-3">GPS Coordinates</th>
                <th className="p-3">Pothole Count</th>
                <th className="p-3">Waterlogging</th>
                <th className="p-3">Segment RCI Score</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {clusters.map((c: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/60 transition">
                  <td className="p-3 font-semibold text-white">{c.location}</td>
                  <td className="p-3 font-mono text-slate-400">{c.lat}, {c.lng}</td>
                  <td className="p-3 font-mono text-amber-400 font-bold">{c.potholes}</td>
                  <td className="p-3 font-mono text-cyan-400 font-bold">{c.waterlogging}</td>
                  <td className="p-3 font-mono font-bold text-white">{c.score} / 100</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold font-mono border ${getScoreColor(c.rating)}`}>
                      {c.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
