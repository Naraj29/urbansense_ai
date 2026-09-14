import React, { useState } from 'react';
import { X, CheckCircle, Clock, MapPin, Bus as BusIcon, Camera, AlertTriangle, ShieldCheck, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import type { DetectionEvent } from '../../types';
import { apiService } from '../../services/api';

interface EventDetailModalProps {
  event: DetectionEvent | null;
  onClose: () => void;
  onEventUpdated: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, onEventUpdated }) => {
  if (!event) return null;

  const [selectedDept, setSelectedDept] = useState('Road Maintenance');
  const [assignee, setAssignee] = useState('Field Unit #04');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'Correct' | 'Incorrect' | null>(event.feedback || null);

  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      await apiService.verifyEvent(event.id);
      onEventUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await apiService.assignEvent(event.id, {
        assigned_department: selectedDept,
        assigned_to: assignee,
        action: 'Dispatched for Action',
        remarks: remarks || `Dispatched to ${selectedDept}`
      });
      onEventUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    setIsSubmitting(true);
    try {
      await apiService.resolveEvent(event.id, remarks || 'Issue successfully resolved.');
      onEventUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedback = async (val: 'Correct' | 'Incorrect') => {
    try {
      await apiService.submitFeedback(event.id, val);
      setFeedbackState(val);
      onEventUpdated();
    } catch (e) {
      console.error(e);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'High': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'In Progress': return 'bg-purple-500/20 text-purple-400 border-purple-500/40';
      case 'Assigned': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
      case 'Verified': return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#1e293b] border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#1e293b] z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 text-blue-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">{event.event_type}</h3>
                <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded border font-mono ${getStatusBadge(event.status)}`}>
                  {event.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Event ID: EVT-{event.id.toString().padStart(5, '0')} | Bus: {event.bus_number || `BUS-${event.bus_id}`} ({event.route})</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Visual Evidence & Telemetry */}
          <div className="space-y-4">
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950 relative group">
              <img
                src={event.evidence_url || '/static/evidence/demo_pothole.jpg'}
                alt={event.event_type}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&q=80');
                }}
              />
              <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur text-emerald-400 text-xs px-2.5 py-1 rounded border border-slate-700 font-mono">
                Confidence: {(event.confidence * 100).toFixed(1)}%
              </div>
              <div className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur text-slate-300 text-[11px] px-2.5 py-1 rounded border border-slate-700 font-mono">
                CAM-01 [FRONT] | 30 FPS
              </div>
            </div>

            {/* Incident ANPR Overlay (If applicable) */}
            {event.incident && (
              <div className="bg-slate-900/80 p-4 rounded-lg border border-purple-500/30 font-mono space-y-2">
                <div className="flex items-center justify-between text-purple-400 text-xs font-bold">
                  <span>AUTOMATED ANPR PIPELINE</span>
                  <span className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-[10px]">PLATE DETECTED</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">LICENSE PLATE:</span>
                    <span className="text-white font-bold text-sm bg-slate-950 px-2 py-1 rounded border border-slate-800 block">
                      {event.incident.vehicle_number || 'UP-70-AB-1234'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">OCR CONFIDENCE:</span>
                    <span className="text-emerald-400 font-bold block pt-1">
                      {((event.incident.vehicle_number_confidence || 0.94) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Event Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/50 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-slate-500 text-[10px]">GPS LOCATION</p>
                  <p className="font-mono">{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-slate-500 text-[10px]">TIMESTAMP</p>
                  <p className="font-mono">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-300">
                <BusIcon className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-slate-500 text-[10px]">BUS & ROUTE</p>
                  <p className="font-semibold">{event.bus_number || `BUS-${event.bus_id}`}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-300">
                <Camera className="w-4 h-4 text-emerald-400" />
                <div>
                  <p className="text-slate-500 text-[10px]">EDGE DEVICE</p>
                  <p className="font-mono">NVIDIA Jetson AGX Node #0{event.bus_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Description & Authority Action Workflow */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Detection Description</h4>
                <p className="text-sm text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  {event.description || `${event.event_type} identified with ${(event.confidence * 100).toFixed(0)}% AI confidence score.`}
                </p>
              </div>

              {/* Authority Actions & Assignment Workflow */}
              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Authority Action Workflow</span>
                </h4>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">Assign Department & Inspector:</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 mb-2"
                  >
                    <option value="Road Maintenance">Road Maintenance Department</option>
                    <option value="Traffic Authority">Traffic Control Authority</option>
                    <option value="Municipal Corporation">Municipal Civil Corporation</option>
                    <option value="Public Safety">Public Safety & Enforcement</option>
                  </select>

                  <input
                    type="text"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="Field Inspector / Duty Unit"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-slate-400 block">Remarks / Operational Notes:</label>
                  <textarea
                    rows={2}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter dispatch instructions or repair status..."
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Workflow Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  {event.status === 'New' && (
                    <button
                      onClick={handleVerify}
                      disabled={isSubmitting}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded transition"
                    >
                      Verify Detection
                    </button>
                  )}

                  {['New', 'Verified'].includes(event.status) && (
                    <button
                      onClick={handleAssign}
                      disabled={isSubmitting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded transition flex items-center justify-center space-x-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Assign Department</span>
                    </button>
                  )}

                  {['Assigned', 'In Progress', 'Verified'].includes(event.status) && (
                    <button
                      onClick={handleResolve}
                      disabled={isSubmitting}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded transition flex items-center justify-center space-x-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Model Validation Feedback Loop */}
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Continuous Model Improvement Feedback</span>
                  <span className="text-[10px] text-slate-500">Prototype Validation</span>
                </div>
                <p className="text-[11px] text-slate-400">Was this Edge AI detection accurate?</p>
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    onClick={() => handleFeedback('Correct')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
                      feedbackState === 'Correct'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Correct Detection</span>
                  </button>

                  <button
                    onClick={() => handleFeedback('Incorrect')}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-semibold flex items-center justify-center space-x-1.5 border transition ${
                      feedbackState === 'Incorrect'
                        ? 'bg-red-500/20 text-red-400 border-red-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>False Positive</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
