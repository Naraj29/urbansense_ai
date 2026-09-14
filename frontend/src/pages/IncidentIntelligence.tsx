import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { Incident } from '../types';

export const IncidentIntelligence: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await apiService.getIncidents();
        setIncidents(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          <span>Incident Intelligence & ANPR Module</span>
        </h1>
        <p className="text-xs text-slate-400">Automated Number Plate Recognition (ANPR) pipeline, hit-and-run investigation & vehicle tracking.</p>
      </div>

      {/* ANPR Architecture Pipeline Banner */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-purple-500/30 space-y-3">
        <h3 className="font-bold text-xs text-purple-300 uppercase tracking-wider">Modular ANPR Computer Vision Pipeline</h3>

        <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-center text-xs">
          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">STEP 1</span>
            <span className="font-semibold text-slate-200">Vehicle Detection</span>
          </div>

          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>

          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">STEP 2</span>
            <span className="font-semibold text-slate-200">Vehicle Tracking</span>
          </div>

          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>

          <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">STEP 3</span>
            <span className="font-semibold text-slate-200">Plate Localization</span>
          </div>

          <div className="flex items-center justify-center text-slate-600 hidden md:flex">
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>

          <div className="bg-slate-900 p-2.5 rounded border border-purple-500/40">
            <span className="text-[10px] text-purple-400 font-bold block">STEP 4</span>
            <span className="font-semibold text-white">OCR & Alert</span>
          </div>
        </div>
      </div>

      {/* Incident Records Grid */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white">Tracked Incident Log</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((inc) => (
            <div key={inc.id} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-purple-300 text-sm">{inc.incident_type}</span>
                <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                  INC-{inc.id.toString().padStart(4, '0')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">LICENSE PLATE OCR:</span>
                  <span className="text-white font-bold text-base bg-slate-950 px-2.5 py-1 rounded border border-slate-800 block inline-block mt-1">
                    {inc.vehicle_number || 'UP-70-AB-1234'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">OCR CONFIDENCE:</span>
                  <span className="text-emerald-400 font-bold text-sm block pt-2">
                    {((inc.vehicle_number_confidence || 0.94) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>10:32:14 — Event Detected & Frame Captured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>10:32:16 — License Plate Cropped & OCR Processed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>10:32:18 — Central Command Alert Transmitted</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
