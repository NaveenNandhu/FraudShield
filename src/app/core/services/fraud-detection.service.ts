import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, catchError, map } from 'rxjs';
import {
  Shipment,
  FraudAnalysis,
  RiskSignal,
  AuditEvent,
  FraudAlert,
  DashboardMetrics,
  RiskThresholds,
  ShipperBehaviorProfile,
  DemoScenario,
  ShipmentStatus,
  Decision,
  RiskLevel
} from '../models/fraud.model';

interface BackendSignal {
  signalType: string;
  severity: RiskLevel;
  scoreContribution: number;
  title: string;
  description: string;
  baseline: string;
  current: string;
}

interface BackendResponse {
  shipmentId: string;
  shipperId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  decision: Decision;
  signals: BackendSignal[];
  recommendedAction: string;
  engineVersion: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class FraudDetectionService {
  private http = inject(HttpClient);
  private readonly backendUrl = 'http://127.0.0.1:8000/api/fraud/analyze';

  // Signals for state
  readonly shipments = signal<Shipment[]>(this.getInitialShipments());
  readonly alerts = signal<FraudAlert[]>(this.getInitialAlerts());
  readonly auditLogs = signal<AuditEvent[]>(this.getInitialAuditLogs());
  readonly riskThresholds = signal<RiskThresholds>({
    lowMax: 30,
    mediumMax: 60,
    highMax: 80,
    criticalMax: 100
  });
  readonly activeScenario = signal<DemoScenario>('SUSPICIOUS');

  // Computed properties
  readonly totalBookingsCount = computed(() => this.shipments().length + 12445);
  readonly flaggedCount = computed(() => this.shipments().filter(s => s.analysis.riskScore > 60).length + 180);
  readonly underReviewCount = computed(() => this.shipments().filter(s => s.status === 'UNDER_REVIEW').length + 94);
  readonly blockedCount = computed(() => this.shipments().filter(s => s.status === 'BLOCKED').length + 40);

  /**
   * Calls FastAPI backend POST http://127.0.0.1:8000/api/fraud/analyze
   * Uses real booking form parameters for live ML risk scoring.
   */
  analyzeBooking(shipmentData: Partial<Shipment> & { bookingHour?: number; currentDailyBookings?: number }): Observable<FraudAnalysis> {
    // Construct FastAPI request payload using actual user form inputs
    const payload = {
      shipperId: shipmentData.shipperId || 'SHP-1024',
      origin: shipmentData.origin || 'Chennai Hub',
      destination: shipmentData.destination || 'Mumbai Hub',
      weight: Number(shipmentData.weight) || 8.0,
      declaredValue: Number(shipmentData.declaredValue) || 35000.0,
      serviceType: shipmentData.serviceType || 'Standard',
      bookingHour: shipmentData.bookingHour !== undefined ? Number(shipmentData.bookingHour) : new Date().getHours(),
      paymentMethod: shipmentData.paymentMethod || 'UPI Direct',
      currentDailyBookings: Number(shipmentData.currentDailyBookings) || 1
    };

    return this.http.post<BackendResponse>(this.backendUrl, payload).pipe(
      map(res => this.transformBackendResponse(res, shipmentData)),
      catchError(err => {
        console.warn('FastAPI backend offline or starting, executing fallback risk evaluation:', err);
        return of(this.generateMockAnalysis(shipmentData)).pipe(delay(1000));
      })
    );
  }

  private transformBackendResponse(res: BackendResponse, inputData: Partial<Shipment>): FraudAnalysis {
    const mappedSignals: RiskSignal[] = res.signals.map(s => ({
      id: s.signalType,
      category: this.mapSignalCategory(s.signalType),
      name: s.title,
      severity: s.severity,
      contribution: s.scoreContribution,
      description: s.description,
      historicalValue: s.baseline,
      currentValue: s.current
    }));

    const keyFindings = res.signals.map(s => s.description);

    let explanation = `FraudShield Engine (${res.engineVersion}) scored this booking ${res.riskScore}/100 (${res.riskLevel} RISK).`;
    if (res.signals.length > 0) {
      explanation += ` Primary factor: ${res.signals[0].description}`;
    } else {
      explanation = 'Shipment behavior is fully consistent with the shipper\'s historical activity profile.';
    }

    return {
      shipmentId: res.shipmentId,
      riskScore: res.riskScore,
      riskLevel: res.riskLevel,
      decision: res.decision,
      signals: mappedSignals,
      explanation,
      keyFindings: keyFindings.length > 0 ? keyFindings : ['Booking parameters match 30-day baseline profile.'],
      recommendedAction: res.recommendedAction,
      timestamp: res.timestamp,
      modelConfidence: 98.4,
      analyzedAt: new Date().toLocaleTimeString()
    };
  }

  private mapSignalCategory(signalType: string): 'BEHAVIORAL' | 'DESTINATION' | 'PACKAGE' | 'PAYMENT' | 'ACCOUNT' | 'VELOCITY' {
    if (signalType.includes('WEIGHT')) return 'PACKAGE';
    if (signalType.includes('DESTINATION')) return 'DESTINATION';
    if (signalType.includes('VELOCITY')) return 'VELOCITY';
    if (signalType.includes('PAYMENT')) return 'PAYMENT';
    if (signalType.includes('ACCOUNT')) return 'ACCOUNT';
    return 'BEHAVIORAL';
  }

  /**
   * Submits booking and creates shipment record with analysis
   */
  createBooking(shipmentData: Partial<Shipment>, analysis: FraudAnalysis): Observable<Shipment> {
    const newId = analysis.shipmentId || `FS-${Math.floor(10000 + Math.random() * 90000)}`;
    let initialStatus: ShipmentStatus = 'APPROVED';
    if (analysis.decision === 'HOLD') initialStatus = 'ON_HOLD';
    if (analysis.decision === 'BLOCK') initialStatus = 'BLOCKED';
    if (analysis.decision === 'VERIFY') initialStatus = 'UNDER_REVIEW';

    const newShipment: Shipment = {
      id: newId,
      shipperId: shipmentData.shipperId || 'SHP-1024',
      shipperName: shipmentData.shipperName || 'Rajesh Sharma',
      shipperEmail: shipmentData.shipperEmail || 'rajesh.sharma@apexlogistics.in',
      shipperCompany: shipmentData.shipperCompany || 'Apex Express Cargo Pvt Ltd',
      origin: shipmentData.origin || 'Chennai',
      destination: shipmentData.destination || 'Dubai',
      recipientName: shipmentData.recipientName || 'Al-Mansoor Trading LLC',
      recipientContact: shipmentData.recipientContact || '+971 4 398 2210',
      packageType: shipmentData.packageType || 'Industrial Components',
      weight: shipmentData.weight || 71,
      dimensions: shipmentData.dimensions || '40x30x20 cm',
      quantity: shipmentData.quantity || 1,
      declaredValue: shipmentData.declaredValue || 250000,
      currency: 'INR',
      serviceType: shipmentData.serviceType || 'EXPRESS',
      paymentMethod: shipmentData.paymentMethod || 'UPI',
      status: initialStatus,
      createdDate: 'Today',
      createdTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analysis
    };

    // Update state signals
    this.shipments.update(prev => [newShipment, ...prev]);

    // Create audit event
    this.addAuditEvent({
      id: `AUD-${Date.now()}`,
      shipmentId: newId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'FastAPI RiskEngine v1',
      actorRole: 'SYSTEM',
      action: `Risk calculated: ${analysis.riskScore}/100 (${analysis.riskLevel})`,
      riskScore: analysis.riskScore,
      reason: analysis.recommendedAction
    });

    if (analysis.riskScore >= 60) {
      this.addAlert({
        id: `ALT-${Date.now()}`,
        shipmentId: newId,
        shipperName: newShipment.shipperName,
        riskLevel: analysis.riskLevel,
        riskScore: analysis.riskScore,
        summary: analysis.explanation,
        timeAgo: 'Just now',
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        destination: newShipment.destination,
        declaredValue: newShipment.declaredValue
      });
    }

    return of(newShipment).pipe(delay(200));
  }

  updateShipmentDecision(
    shipmentId: string,
    newStatus: ShipmentStatus,
    newDecision: Decision,
    actorName: string,
    reason: string
  ): void {
    this.shipments.update(list =>
      list.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: newStatus,
            analysis: {
              ...s.analysis,
              decision: newDecision
            }
          };
        }
        return s;
      })
    );

    this.addAuditEvent({
      id: `AUD-${Date.now()}`,
      shipmentId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: actorName,
      actorRole: 'FRAUD_ANALYST',
      action: `Shipment status updated to ${newStatus}`,
      reason
    });
  }

  completeVerification(shipmentId: string, verificationMethod: string): Observable<boolean> {
    this.shipments.update(list =>
      list.map(s => {
        if (s.id === shipmentId) {
          return {
            ...s,
            status: 'VERIFIED',
            verifiedAt: new Date().toLocaleTimeString(),
            verificationMethod,
            analysis: {
              ...s.analysis,
              decision: 'ALLOW'
            }
          };
        }
        return s;
      })
    );

    this.addAuditEvent({
      id: `AUD-${Date.now()}`,
      shipmentId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'User / Shipper',
      actorRole: 'SHIPPER',
      action: `Verification completed via ${verificationMethod}`,
      reason: 'Shipper confirmed identity and shipment credentials'
    });

    return of(true).pipe(delay(400));
  }

  setScenario(scenario: DemoScenario): void {
    this.activeScenario.set(scenario);
  }

  updateRiskThresholds(newThresholds: RiskThresholds): void {
    this.riskThresholds.set(newThresholds);
  }

  getShipperBehaviorProfile(shipperId: string = 'SHP-1024'): ShipperBehaviorProfile {
    return {
      shipperId,
      shipperName: 'Rajesh Sharma',
      accountAgeDays: 412,
      totalHistoricalBookings: 184,
      avgWeightKg: 8.4,
      currentWeightKg: 71.0,
      avgDailyBookings: 12,
      currentDailyBookings: 63,
      frequentDestinations: ['Chennai', 'Bangalore', 'Coimbatore', 'Mumbai'],
      currentDestination: 'Dubai (UAE)',
      paymentMethodChangesLast30Days: 2,
      trustScore: 42
    };
  }

  getDashboardMetrics(): DashboardMetrics {
    return {
      totalBookings: 12450,
      flaggedBookings: 184,
      underReview: 97,
      blocked: 42,
      preventedLossAmount: 1840000,
      preventedLossCurrency: 'INR',
      fraudDetectionRate: 98.4,
      falsePositiveRate: 1.2,
      riskDistribution: {
        low: 11820,
        medium: 446,
        high: 142,
        critical: 42
      },
      trendData: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        total: [120, 85, 410, 890, 1120, 950, 480],
        flagged: [4, 12, 18, 42, 58, 32, 18],
        blocked: [1, 3, 4, 11, 14, 7, 2]
      },
      destinationHeatmap: [
        { destination: 'Dubai (UAE)', riskCount: 48, percentage: 26.0 },
        { destination: 'London Heathrow (UK)', riskCount: 34, percentage: 18.5 },
        { destination: 'Mumbai Port', riskCount: 29, percentage: 15.8 },
        { destination: 'Singapore', riskCount: 22, percentage: 12.0 },
        { destination: 'Delhi Hub', riskCount: 18, percentage: 9.8 }
      ],
      serviceTypeRisk: [
        { service: 'Same Day Express', riskPercentage: 64.2 },
        { service: 'Express Air Freight', riskPercentage: 28.5 },
        { service: 'Standard Ground', riskPercentage: 7.3 }
      ]
    };
  }

  private addAuditEvent(event: AuditEvent): void {
    this.auditLogs.update(logs => [event, ...logs]);
  }

  private addAlert(alert: FraudAlert): void {
    this.alerts.update(items => [alert, ...items]);
  }

  private generateMockAnalysis(data: Partial<Shipment>): FraudAnalysis {
    const timestamp = new Date().toISOString();
    const analyzedAt = new Date().toLocaleTimeString();

    const weight = Number(data.weight) || 8.0;
    const value = Number(data.declaredValue) || 35000;
    const dest = (data.destination || '').toLowerCase();

    const signals: RiskSignal[] = [];
    let score = 0;

    if (weight > 50) {
      score += 25;
      signals.push({
        id: 'WEIGHT_ANOMALY',
        category: 'PACKAGE',
        name: 'Extreme Package Weight Anomaly',
        severity: 'CRITICAL',
        contribution: 25,
        description: `Current shipment weight (${weight} kg) is significantly higher than shipper 30-day average (8.4 kg).`,
        historicalValue: '8.4 kg average',
        currentValue: `${weight} kg`
      });
    } else if (weight > 25) {
      score += 15;
      signals.push({
        id: 'WEIGHT_ANOMALY',
        category: 'PACKAGE',
        name: 'Unusual Shipment Weight Deviation',
        severity: 'HIGH',
        contribution: 15,
        description: `Current shipment weight (${weight} kg) exceeds account baseline average (8.4 kg).`,
        historicalValue: '8.4 kg average',
        currentValue: `${weight} kg`
      });
    }

    if (dest.includes('dubai') || dest.includes('uae') || dest.includes('london')) {
      score += 20;
      signals.push({
        id: 'DESTINATION_ANOMALY',
        category: 'DESTINATION',
        name: 'Unverified Destination Corridor',
        severity: 'HIGH',
        contribution: 20,
        description: `Destination '${data.destination}' is not present in account's historical route profile.`,
        historicalValue: 'Chennai, Mumbai, Bangalore',
        currentValue: data.destination || 'Unverified Route'
      });
    }

    if (value > 150000) {
      score += 10;
      signals.push({
        id: 'DECLARED_VALUE_ANOMALY',
        category: 'PACKAGE',
        name: 'High Monetary Exposure Spike',
        severity: 'HIGH',
        contribution: 10,
        description: `Declared value (₹${value.toLocaleString()}) is higher than 30-day baseline average.`,
        historicalValue: '₹35,000 average',
        currentValue: `₹${value.toLocaleString()}`
      });
    }

    let riskLevel: RiskLevel = 'LOW';
    let decision: Decision = 'ALLOW';
    let recommendedAction = 'Allow shipment to enter regular sorting and network transit workflow.';

    if (score >= 81) {
      riskLevel = 'CRITICAL';
      decision = 'BLOCK';
      recommendedAction = 'Block shipment immediately, freeze booking pipeline, and initiate fraud analyst investigation.';
    } else if (score >= 61) {
      riskLevel = 'HIGH';
      decision = 'HOLD';
      recommendedAction = 'Hold shipment at origin facility and request additional OTP/document verification.';
    } else if (score >= 31) {
      riskLevel = 'MEDIUM';
      decision = 'VERIFY';
      recommendedAction = 'Request routine shipper verification or review booking details.';
    }

    return {
      shipmentId: data.id || `FS-${Math.floor(10000 + Math.random() * 90000)}`,
      riskScore: score,
      riskLevel,
      decision,
      modelConfidence: 98.4,
      timestamp,
      analyzedAt,
      signals,
      explanation: signals.length > 0 
        ? `Risk score ${score}/100 (${riskLevel} RISK). Primary factor: ${signals[0].description}`
        : 'Shipment parameters match 30-day baseline profile.',
      keyFindings: signals.length > 0 ? signals.map(s => s.description) : ['Booking parameters match historical account profile.'],
      recommendedAction
    };
  }

  private getInitialShipments(): Shipment[] {
    return [
      {
        id: 'FS-10382',
        shipperId: 'SHP-1024',
        shipperName: 'Rajesh Sharma',
        shipperEmail: 'rajesh.sharma@apexlogistics.in',
        shipperCompany: 'Apex Express Cargo Pvt Ltd',
        origin: 'Chennai Hub',
        destination: 'Dubai (UAE)',
        recipientName: 'Al-Mansoor Trading LLC',
        recipientContact: '+971 4 398 2210',
        packageType: 'Industrial Components',
        weight: 71.0,
        dimensions: '80x60x50 cm',
        quantity: 3,
        declaredValue: 380000,
        currency: 'INR',
        serviceType: 'EXPRESS',
        paymentMethod: 'UPI',
        status: 'ON_HOLD',
        createdDate: 'Today',
        createdTime: '18:15',
        analysis: {
          shipmentId: 'FS-10382',
          riskScore: 91,
          riskLevel: 'HIGH',
          decision: 'HOLD',
          modelConfidence: 96.4,
          timestamp: new Date().toISOString(),
          analyzedAt: '18:15',
          signals: [
            {
              id: 'WEIGHT_ANOMALY',
              category: 'PACKAGE',
              name: 'Extreme Package Weight Anomaly',
              severity: 'CRITICAL',
              contribution: +25,
              description: 'Current shipment weight (71 kg) is 8.4x the shipper\'s 30-day average (8.4 kg).',
              historicalValue: '8.4 kg avg',
              currentValue: '71.0 kg'
            },
            {
              id: 'DESTINATION_ANOMALY',
              category: 'DESTINATION',
              name: 'Unverified Destination Corridor',
              severity: 'HIGH',
              contribution: +20,
              description: 'Destination Dubai is not present in account\'s historical route profile.',
              historicalValue: 'Chennai, Mumbai, Bangalore',
              currentValue: 'Dubai (UAE)'
            }
          ],
          explanation: 'This shipment differs significantly from the shipper\'s normal behavior. Package weight is 8.4x baseline and destination is unverified.',
          keyFindings: ['Current shipment weight is 8.4x higher than 30-day baseline.', 'Destination Dubai is newly added.'],
          recommendedAction: 'Hold shipment at origin facility and request additional OTP/document verification.'
        }
      },
      {
        id: 'FS-10377',
        shipperId: 'SHP-2048',
        shipperName: 'Vikram Enterprises',
        shipperEmail: 'vikram@vikram-ent.com',
        shipperCompany: 'Vikram Global Logistics',
        origin: 'Bangalore Cargo Hub',
        destination: 'London Heathrow (UK)',
        recipientName: 'Highland Direct Ltd',
        recipientContact: '+44 20 7946 0912',
        packageType: 'Consumer Electronics',
        weight: 145.0,
        dimensions: '120x80x90 cm',
        quantity: 10,
        declaredValue: 850000,
        currency: 'INR',
        serviceType: 'EXPRESS',
        paymentMethod: 'Offshore Pre-paid Card',
        status: 'BLOCKED',
        createdDate: 'Today',
        createdTime: '17:42',
        analysis: {
          shipmentId: 'FS-10377',
          riskScore: 97,
          riskLevel: 'CRITICAL',
          decision: 'BLOCK',
          modelConfidence: 99.1,
          timestamp: new Date().toISOString(),
          analyzedAt: '17:42',
          signals: [
            {
              id: 'PAYMENT_ANOMALY',
              category: 'PAYMENT',
              name: 'Unrecognized Payment Method',
              severity: 'CRITICAL',
              contribution: +30,
              description: 'Payment card issued in offshore jurisdiction differs from account record.',
              historicalValue: 'Corporate HDFC Card',
              currentValue: 'Offshore Prepaid Card'
            }
          ],
          explanation: 'Payment credential mismatch and abnormal booking velocity detected from a high-risk proxy IP network.',
          keyFindings: ['Offshore card BIN mismatch.', 'Declared value exceeds ₹8,50,000 threshold.'],
          recommendedAction: 'Block shipment immediately and initiate fraud analyst review.'
        }
      }
    ];
  }

  private getInitialAlerts(): FraudAlert[] {
    return [
      {
        id: 'ALT-9001',
        shipmentId: 'FS-10382',
        shipperName: 'Rajesh Sharma (Apex Express)',
        riskLevel: 'HIGH',
        riskScore: 91,
        summary: 'Multiple behavioral anomalies: 8.4x weight spike, unusual destination (Dubai), high booking velocity.',
        timeAgo: '2 minutes ago',
        timestamp: '18:15',
        read: false,
        destination: 'Dubai (UAE)',
        declaredValue: 380000
      }
    ];
  }

  private getInitialAuditLogs(): AuditEvent[] {
    return [
      {
        id: 'AUD-8801',
        shipmentId: 'FS-10382',
        timestamp: '18:15',
        actor: 'FastAPI RiskEngine v1',
        actorRole: 'SYSTEM',
        action: 'Fraud risk calculated: 91/100 (HIGH RISK)',
        riskScore: 91,
        reason: 'Automated ML inference triggered hold rule #HR-402'
      }
    ];
  }
}
