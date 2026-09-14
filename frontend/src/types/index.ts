export type EventType = 
  | 'Pothole'
  | 'Damaged Road'
  | 'Waterlogging'
  | 'Missing Divider'
  | 'Missing Zebra Crossing'
  | 'Damaged Traffic Sign'
  | 'Traffic Congestion'
  | 'Vulnerable Pedestrian'
  | 'Rash Driving'
  | 'Hit and Run'
  | 'Road Obstruction';

export type EventSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type EventStatus = 'New' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved' | 'Rejected';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Camera {
  id: number;
  camera_type: 'Front' | 'Rear' | 'Left' | 'Right' | 'Cabin';
  status: 'Active' | 'Degraded' | 'Inactive';
  stream_url?: string;
}

export interface Bus {
  id: number;
  bus_number: string;
  route: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  latitude: number;
  longitude: number;
  last_seen: string;
  camera_count: number;
  network_status: 'Online' | 'Weak Network' | 'Offline';
  cameras?: Camera[];
}

export interface Incident {
  id: number;
  event_id: number;
  vehicle_number?: string;
  vehicle_number_confidence?: number;
  incident_type: string;
  evidence_url?: string;
  status: string;
}

export interface AuthorityAction {
  id: number;
  event_id: number;
  assigned_department: string;
  assigned_to?: string;
  action: string;
  status: string;
  remarks?: string;
  created_at: string;
  resolved_at?: string;
}

export interface DetectionEvent {
  id: number;
  bus_id: number;
  camera_id?: number;
  event_type: EventType;
  severity: EventSeverity;
  latitude: number;
  longitude: number;
  confidence: number;
  timestamp: string;
  evidence_url?: string;
  status: EventStatus;
  description?: string;
  feedback?: 'Correct' | 'Incorrect';
  bus_number?: string;
  route?: string;
  incident?: Incident;
  authority_actions?: AuthorityAction[];
}

export interface AnalyticsOverview {
  kpis: {
    active_buses: number;
    events_today: number;
    critical_alerts: number;
    road_issues: number;
    traffic_hotspots: number;
    open_incidents: number;
    resolved_issues: number;
  };
  event_distribution: Record<string, number>;
  severity_distribution: Record<string, number>;
  daily_timeline: Array<{ day: string; events: number; resolved: number }>;
  feedback_accuracy: {
    disclaimer: string;
    accuracy_percentage: number;
    correct_detections: number;
    incorrect_detections: number;
  };
}

export interface SystemHealth {
  services: {
    api_server: string;
    database: string;
    gis_service: string;
    ai_service: string;
    websocket: string;
    edge_buses: string;
    message_queue: string;
    storage: string;
  };
  telemetry: {
    last_sync: string;
    events_per_minute: number;
    average_latency_ms: number;
    pending_edge_events: number;
    system_uptime: string;
    active_ws_connections: number;
  };
}
