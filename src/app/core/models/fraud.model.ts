export type UserRole = 'SHIPPER' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type Decision = 'ALLOW' | 'VERIFY' | 'HOLD' | 'BLOCK';

export type ShipmentStatus = 'APPROVED' | 'UNDER_REVIEW' | 'ON_HOLD' | 'BLOCKED' | 'VERIFIED';

export type ServiceType = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
  accountStatus: 'VERIFIED' | 'COMPROMISED_RISK' | 'NEW';
  avatarUrl?: string;
  phone?: string;
}

export interface RiskSignal {
  id: string;
  category: 'BEHAVIORAL' | 'DESTINATION' | 'PACKAGE' | 'PAYMENT' | 'ACCOUNT' | 'VELOCITY';
  name: string;
  severity: RiskLevel;
  contribution: number;
  description: string;
  historicalValue?: string;
  currentValue?: string;
}

export interface FraudAnalysis {
  shipmentId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: Decision;
  signals: RiskSignal[];
  explanation: string;
  keyFindings: string[];
  recommendedAction: string;
  timestamp: string;
  modelConfidence: number;
  analyzedAt: string;
}

export interface Shipment {
  id: string;
  shipperId: string;
  shipperName: string;
  shipperEmail: string;
  shipperCompany?: string;
  origin: string;
  destination: string;
  recipientName: string;
  recipientContact: string;
  packageType: string;
  weight: number; // in kg
  dimensions: string; // e.g., 40x30x20 cm
  quantity: number;
  declaredValue: number; // in INR / USD
  currency: string;
  serviceType: ServiceType;
  paymentMethod: string;
  status: ShipmentStatus;
  createdDate: string;
  createdTime: string;
  analysis: FraudAnalysis;
  verifiedAt?: string;
  verificationMethod?: string;
}

export interface ShipperBehaviorProfile {
  shipperId: string;
  shipperName: string;
  accountAgeDays: number;
  totalHistoricalBookings: number;
  avgWeightKg: number;
  currentWeightKg: number;
  avgDailyBookings: number;
  currentDailyBookings: number;
  frequentDestinations: string[];
  currentDestination: string;
  paymentMethodChangesLast30Days: number;
  trustScore: number; // 0-100
}

export interface AuditEvent {
  id: string;
  shipmentId: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  riskScore?: number;
  reason?: string;
  details?: string;
}

export interface FraudAlert {
  id: string;
  shipmentId: string;
  shipperName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  summary: string;
  timeAgo: string;
  timestamp: string;
  read: boolean;
  destination: string;
  declaredValue: number;
}

export interface DashboardMetrics {
  totalBookings: number;
  flaggedBookings: number;
  underReview: number;
  blocked: number;
  preventedLossAmount: number;
  preventedLossCurrency: string;
  fraudDetectionRate: number; // e.g. 98.4%
  falsePositiveRate: number; // e.g. 1.2%
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  trendData: {
    labels: string[];
    total: number[];
    flagged: number[];
    blocked: number[];
  };
  destinationHeatmap: { destination: string; riskCount: number; percentage: number }[];
  serviceTypeRisk: { service: string; riskPercentage: number }[];
}

export interface RiskThresholds {
  lowMax: number;      // 0 - 30
  mediumMax: number;   // 31 - 60
  highMax: number;     // 61 - 80
  criticalMax: number; // 81 - 100
}

export type DemoScenario = 'LEGITIMATE' | 'SUSPICIOUS' | 'FRAUDULENT';
