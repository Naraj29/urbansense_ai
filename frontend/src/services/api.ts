import axios from 'axios';
import type { 
  Bus, 
  DetectionEvent, 
  Incident, 
  AnalyticsOverview, 
  SystemHealth 
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },

  // Buses
  getBuses: async (): Promise<Bus[]> => {
    const res = await api.get('/buses');
    return res.data;
  },
  getBus: async (id: number): Promise<Bus> => {
    const res = await api.get(`/buses/${id}`);
    return res.data;
  },

  // Events
  getEvents: async (params?: Record<string, any>): Promise<DetectionEvent[]> => {
    const res = await api.get('/events', { params });
    return res.data;
  },
  getEvent: async (id: number): Promise<DetectionEvent> => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  verifyEvent: async (id: number): Promise<DetectionEvent> => {
    const res = await api.post(`/events/${id}/verify`);
    return res.data;
  },
  assignEvent: async (id: number, data: { assigned_department: string; assigned_to?: string; action?: string; remarks?: string }): Promise<DetectionEvent> => {
    const res = await api.post(`/events/${id}/assign`, data);
    return res.data;
  },
  resolveEvent: async (id: number, remarks?: string): Promise<DetectionEvent> => {
    const res = await api.post(`/events/${id}/resolve`, null, { params: { remarks } });
    return res.data;
  },
  submitFeedback: async (id: number, feedback: 'Correct' | 'Incorrect'): Promise<DetectionEvent> => {
    const res = await api.post(`/events/${id}/feedback`, { feedback });
    return res.data;
  },

  // Incidents
  getIncidents: async (): Promise<Incident[]> => {
    const res = await api.get('/incidents');
    return res.data;
  },

  // Traffic & Road Conditions
  getTrafficOverview: async () => {
    const res = await api.get('/traffic');
    return res.data;
  },
  getODFlow: async () => {
    const res = await api.get('/traffic/od-flow');
    return res.data;
  },
  getRoadConditions: async () => {
    const res = await api.get('/road-conditions');
    return res.data;
  },

  // Analytics & Health
  getAnalyticsOverview: async (): Promise<AnalyticsOverview> => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getSystemHealth: async (): Promise<SystemHealth> => {
    const res = await api.get('/system-health');
    return res.data;
  },

  // Edge AI Simulator
  getEdgeConsoleStatus: async () => {
    const res = await api.get('/edge/status');
    return res.data;
  },
  toggleSimulation: async () => {
    const res = await api.post('/edge/toggle-simulation');
    return res.data;
  },
  triggerDemoEvent: async (event_type: string, severity: string = 'High', bus_id?: number) => {
    const res = await api.post('/edge/trigger-event', { event_type, severity, bus_id });
    return res.data;
  },
  setBusNetworkStatus: async (bus_id: number, network_status: string) => {
    const res = await api.post('/edge/set-network', { bus_id, network_status });
    return res.data;
  },

  // AI Detection Lab
  runAIInference: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/ai/inference', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};
