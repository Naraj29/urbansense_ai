import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Filter, Layers, Bus as BusIcon, Eye } from 'lucide-react';
import { apiService } from '../services/api';
import type { DetectionEvent, Bus } from '../types';
import { EventDetailModal } from '../components/events/EventDetailModal';

// Custom Leaflet Icons using SVG Data URI
const createCustomIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="${color}" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`;
  return L.icon({
    iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const busIcon = L.icon({
  iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="1.5"><rect width="16" height="16" x="4" y="3" rx="2"/><path d="M4 11h16"/><path d="M6 19v2"/><path d="M18 19v2"/><circle cx="8" cy="15" r="1" fill="#fff"/><circle cx="16" cy="15" r="1" fill="#fff"/></svg>')}`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

export const GISUrbanMap: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [showBuses, setShowBuses] = useState<boolean>(true);

  const fetchData = async () => {
    try {
      const [busesData, eventsData] = await Promise.all([
        apiService.getBuses(),
        apiService.getEvents({ limit: 200 })
      ]);
      setBuses(busesData);
      setEvents(eventsData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== 'All' && ev.event_type !== selectedCategory) return false;
    if (selectedSeverity !== 'All' && ev.severity !== selectedSeverity) return false;
    return true;
  });

  const getMarkerColor = (ev: DetectionEvent) => {
    if (ev.severity === 'Critical') return '#ef4444';
    if (ev.severity === 'High') return '#f59e0b';
    if (ev.event_type === 'Pothole') return '#d97706';
    if (ev.event_type === 'Traffic Congestion') return '#3b82f6';
    return '#8b5cf6';
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative overflow-hidden">
      {/* Top Filter Bar */}
      <div className="bg-[#1e293b] border-b border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 z-10 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-slate-300 font-bold text-sm">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>GIS URBAN MAP LAYERS</span>
          </div>

          <div className="flex items-center space-x-2 border-l border-slate-700 pl-4 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Detection Types</option>
              <option value="Pothole">Potholes</option>
              <option value="Damaged Road">Damaged Roads</option>
              <option value="Waterlogging">Waterlogging</option>
              <option value="Traffic Congestion">Traffic Congestion</option>
              <option value="Missing Divider">Missing Dividers</option>
              <option value="Rash Driving">Rash Driving</option>
              <option value="Hit and Run">Hit & Run Incidents</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Layer Toggles & Active Count */}
        <div className="flex items-center space-x-4 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-300">
            <input
              type="checkbox"
              checked={showBuses}
              onChange={(e) => setShowBuses(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-blue-600 focus:ring-0"
            />
            <BusIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>Show Bus Fleet ({buses.length})</span>
          </label>

          <div className="bg-slate-900 px-3 py-1.5 rounded border border-slate-800 text-slate-400 font-mono">
            Displaying <span className="text-white font-bold">{filteredEvents.length}</span> Active GIS Markers
          </div>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="flex-1 w-full h-full relative z-0">
        <MapContainer
          center={[25.4525, 81.8349]}
          zoom={13}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Bus Markers */}
          {showBuses && buses.map((bus) => (
            <Marker
              key={`bus-${bus.id}`}
              position={[bus.latitude, bus.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div className="p-1 space-y-1 font-sans text-xs">
                  <div className="font-bold text-blue-400 flex items-center space-x-1">
                    <BusIcon className="w-3.5 h-3.5" />
                    <span>{bus.bus_number}</span>
                  </div>
                  <p className="text-slate-300 font-mono text-[11px]">{bus.route}</p>
                  <p className="text-slate-400 text-[10px]">Status: <span className="text-emerald-400 font-semibold">{bus.status}</span></p>
                  <p className="text-slate-400 text-[10px]">Network: <span className="text-blue-300">{bus.network_status}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Detection Event Markers */}
          {filteredEvents.map((ev) => (
            <Marker
              key={`event-${ev.id}`}
              position={[ev.latitude, ev.longitude]}
              icon={createCustomIcon(getMarkerColor(ev))}
            >
              <Popup>
                <div className="p-1.5 space-y-2 font-sans text-xs min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-white text-sm">{ev.event_type}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      ev.severity === 'Critical' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {ev.severity}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{ev.description || 'Defect detected by Edge AI camera.'}</p>
                  <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                    <p>Bus: {ev.bus_number || `BUS-${ev.bus_id}`}</p>
                    <p>Confidence: {(ev.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold py-1 px-2 rounded transition flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Evidence & Actions</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEventUpdated={fetchData}
      />
    </div>
  );
};
