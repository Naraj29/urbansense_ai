import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { apiService } from '../services/api';

export const Analytics: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiService.getAnalyticsOverview();
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAnalytics();
  }, []);

  const timelineData = data?.daily_timeline || [
    { day: 'Mon', events: 14, resolved: 12 },
    { day: 'Tue', events: 18, resolved: 16 },
    { day: 'Wed', events: 22, resolved: 19 },
    { day: 'Thu', events: 27, resolved: 24 },
    { day: 'Fri', events: 31, resolved: 28 },
    { day: 'Sat', events: 25, resolved: 23 },
    { day: 'Sun', events: 19, resolved: 18 },
  ];

  const categoryData = [
    { name: 'Road Hazards', count: data?.event_distribution?.['Road Hazards'] || 48 },
    { name: 'Traffic', count: data?.event_distribution?.['Traffic'] || 32 },
    { name: 'Infrastructure', count: data?.event_distribution?.['Infrastructure'] || 24 },
    { name: 'Safety Incidents', count: data?.event_distribution?.['Safety Incidents'] || 16 },
  ];

  const feedbackAccuracy = data?.feedback_accuracy || {
    accuracy_percentage: 92.4,
    correct_detections: 46,
    incorrect_detections: 4
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <span>City-Wide Urban Intelligence Analytics</span>
        </h1>
        <p className="text-xs text-slate-400">Historical trend analysis, defect resolution latency & continuous model validation accuracy.</p>
      </div>

      {/* Model Accuracy Feedback Card */}
      <div className="bg-[#1e293b] p-6 rounded-xl border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Model Validation Accuracy</span>
          <p className="text-3xl font-extrabold text-white mt-1">{feedbackAccuracy.accuracy_percentage}%</p>
          <p className="text-xs text-emerald-400 mt-0.5">Based on Authority Remediation Feedback</p>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono">
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">CORRECT DETECTIONS</span>
            <span className="text-emerald-400 font-bold text-lg">{feedbackAccuracy.correct_detections}</span>
          </div>
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-center">
            <span className="text-slate-500 block text-[10px]">FALSE POSITIVES</span>
            <span className="text-red-400 font-bold text-lg">{feedbackAccuracy.incorrect_detections}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Detections vs Resolution Bar Chart */}
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white">Weekly Detections vs Resolutions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timelineData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                <Bar dataKey="events" fill="#3b82f6" name="Detections" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-[#1e293b] p-5 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white">Event Count by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
