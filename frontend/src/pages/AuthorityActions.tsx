import React, { useState, useEffect } from 'react';
import { CheckSquare, Filter, Eye } from 'lucide-react';
import { apiService } from '../services/api';
import type { DetectionEvent } from '../types';
import { EventDetailModal } from '../components/events/EventDetailModal';

export const AuthorityActions: React.FC = () => {
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await apiService.getEvents({ limit: 200 });
      setEvents(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== 'All' && ev.status !== statusFilter) return false;
    return true;
  });

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Assigned': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      case 'Verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Authority Action & Dispatch Management</span>
          </h1>
          <p className="text-xs text-slate-400">Inter-departmental dispatch workflow for road repairs, traffic regulation & public safety remediation.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="All">All Workflow States</option>
            <option value="New">New Unverified</option>
            <option value="Verified">Verified</option>
            <option value="Assigned">Assigned to Dept</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Workflow Progress Bar Overview */}
      <div className="grid grid-cols-5 gap-3 text-center text-xs">
        <div className="bg-[#1e293b] p-3 rounded-lg border border-amber-500/30">
          <span className="text-[10px] text-slate-500 block">STAGE 1</span>
          <span className="font-bold text-amber-400">NEW ({events.filter(e => e.status === 'New').length})</span>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-lg border border-blue-500/30">
          <span className="text-[10px] text-slate-500 block">STAGE 2</span>
          <span className="font-bold text-blue-400">VERIFIED ({events.filter(e => e.status === 'Verified').length})</span>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-lg border border-indigo-500/30">
          <span className="text-[10px] text-slate-500 block">STAGE 3</span>
          <span className="font-bold text-indigo-400">ASSIGNED ({events.filter(e => e.status === 'Assigned').length})</span>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-lg border border-purple-500/30">
          <span className="text-[10px] text-slate-500 block">STAGE 4</span>
          <span className="font-bold text-purple-400">IN PROGRESS ({events.filter(e => e.status === 'In Progress').length})</span>
        </div>
        <div className="bg-[#1e293b] p-3 rounded-lg border border-emerald-500/30">
          <span className="text-[10px] text-slate-500 block">STAGE 5</span>
          <span className="font-bold text-emerald-400">RESOLVED ({events.filter(e => e.status === 'Resolved').length})</span>
        </div>
      </div>

      {/* Events Action Table */}
      <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">Event & Severity</th>
                <th className="p-3">Bus & Route</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Assigned Department</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/60 transition">
                  <td className="p-3 font-semibold text-white">
                    {ev.event_type}
                    <span className="block text-[10px] text-slate-500 font-mono">Conf: {(ev.confidence * 100).toFixed(0)}%</span>
                  </td>
                  <td className="p-3 font-mono">{ev.bus_number || `BUS-${ev.bus_id}`}</td>
                  <td className="p-3 font-mono text-slate-400">{new Date(ev.timestamp).toLocaleString('en-IN')}</td>
                  <td className="p-3 font-semibold text-slate-200">
                    {ev.authority_actions?.[0]?.assigned_department || 'Road Maintenance'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${getStatusStyle(ev.status)}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 px-2.5 py-1 rounded transition flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Manage Action</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={fetchEvents}
      />
    </div>
  );
};
