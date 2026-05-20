import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Brain, 
  Cpu, 
  Database, 
  Server, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  Terminal, 
  HardDrive, 
  Network, 
  Layers, 
  ChevronRight, 
  BarChart2, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'console'
  const [simulationMode, setSimulationMode] = useState('NORMAL');
  const [clusterData, setClusterData] = useState(null);
  const [aiCorrelation, setAiCorrelation] = useState(null);
  const [logs, setLogs] = useState([]);
  const [selectedPod, setSelectedPod] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDeployment, setActiveDeployment] = useState('campus'); // 'campus' or 'town'
  const [isUsingClientFallback, setIsUsingClientFallback] = useState(false);
  const terminalEndRef = useRef(null);

  const BACKEND_URL = 'http://localhost:5000/api';

  // Client-Side Simulation Telemetry Fallback (For static hosting environments like Vercel)
  const runClientSideSimulationTick = (currentMode) => {
    // Mimics the telemetry updates inside React if the backend is offline
    const totalCpu = currentMode === 'BURSTY_WORKLOAD' ? 88 : currentMode === 'PVC_STORAGE_STRESS' ? 62 : currentMode === 'MEMORY_LEAK' ? 48 : 22;
    const totalMem = currentMode === 'MEMORY_LEAK' ? 78 : 45;
    const latency = currentMode === 'PVC_STORAGE_STRESS' ? 38.4 : 1.8;
    const writeIops = currentMode === 'PVC_STORAGE_STRESS' ? 380 : currentMode === 'BURSTY_WORKLOAD' ? 240 : 40;

    const mockState = {
      environment: activeDeployment === 'campus' ? 'Smart Campus Grid' : 'Smart Town Grid',
      nodeStatus: {
        hostname: 'edge-gateway-01.abb-town.internal',
        os: 'Ubuntu 22.04 LTS (K3s v1.28.2+k3s1 - Vercel Sandbox Mode)',
        cpuUsage: totalCpu,
        memoryUsage: totalMem,
        diskUsage: 38,
        networkIn: currentMode === 'BURSTY_WORKLOAD' ? 680 : 120,
        networkOut: currentMode === 'BURSTY_WORKLOAD' ? 490 : 98,
        pvcReadIops: currentMode === 'PVC_STORAGE_STRESS' ? 180 : 250,
        pvcWriteIops: writeIops,
        pvcLatencyMs: latency
      },
      namespaces: {
        'smart-campus-core': {
          pods: [
            {
              name: 'campus-api-gateway',
              status: 'Running',
              restarts: 0,
              cpu: currentMode === 'MULTI_SERVICE_DEPENDENCY' ? 72 : 15,
              memory: 120,
              network: { in: 80, out: 90 },
              pvc: { read: 5, write: 2, latency: 1.5 },
              logs: ['Routing external traffic to services', 'Health check OK'],
              dependency: ['auth-service', 'grid-database-0']
            },
            {
              name: 'student-portal-frontend',
              status: 'Running',
              restarts: 0,
              cpu: 5,
              memory: 95,
              network: { in: 15, out: 4 },
              pvc: { read: 0, write: 0, latency: 0.0 },
              logs: ['React static files served', 'Session verified'],
              dependency: ['campus-api-gateway']
            },
            {
              name: 'auth-service',
              status: 'Running',
              restarts: 0,
              cpu: currentMode === 'MULTI_SERVICE_DEPENDENCY' ? 95 : 8,
              memory: 150,
              network: { in: 25, out: 25 },
              pvc: { read: 12, write: 5, latency: 1.8 },
              logs: ['OAuth2 Provider Ready', 'Token validator running'],
              dependency: []
            }
          ]
        },
        'iot-smart-grid': {
          pods: [
            {
              name: 'smart-meters-ingestion',
              status: 'Running',
              restarts: 0,
              cpu: currentMode === 'BURSTY_WORKLOAD' ? 88 : 28,
              memory: 180,
              network: { in: currentMode === 'BURSTY_WORKLOAD' ? 650 : 240, out: 190 },
              pvc: { read: 10, write: 45, latency: 2.4 },
              logs: currentMode === 'BURSTY_WORKLOAD' 
                ? ['⚠️ WARNING: High influx of bursty IoT electric telemetry updates.', 'Processing 2500 pkg/sec.']
                : ['Listening on UDP 5090 for telemetry streams', 'Processing 450 meters/sec'],
              dependency: ['grid-database-0']
            },
            {
              name: 'grid-database-0',
              status: 'Running',
              restarts: 0,
              cpu: currentMode === 'PVC_STORAGE_STRESS' ? 48 : 32,
              memory: 340,
              network: { in: 180, out: 75 },
              pvc: { read: 80, write: writeIops, latency: latency },
              logs: currentMode === 'PVC_STORAGE_STRESS'
                ? ['🚨 CRITICAL: PVC storage write wait-queue full.', 'I/O wait time exceeded 35ms!']
                : ['Postgres engine listening', 'Autovacuum complete'],
              dependency: []
            },
            {
              name: 'grid-analytics-worker',
              status: currentMode === 'MEMORY_LEAK' ? 'Running' : 'Running',
              restarts: currentMode === 'MEMORY_LEAK' ? Math.floor(Date.now() / 30000) % 5 : 0,
              cpu: 18,
              memory: currentMode === 'MEMORY_LEAK' ? 480 : 210,
              network: { in: 35, out: 12 },
              pvc: { read: 55, write: 5, latency: 2.0 },
              logs: currentMode === 'MEMORY_LEAK'
                ? ['⚠️ WARNING: Cache allocation growth. Free Heap: < 12MB', '🚨 Eviction threshold critical.']
                : ['Loaded ML load-forecasting model v2.1', 'Computing trends'],
              dependency: ['grid-database-0']
            }
          ]
        },
        'water-management': {
          pods: [
            {
              name: 'pump-controller',
              status: currentMode === 'PVC_STORAGE_STRESS' ? 'Error' : 'Running',
              restarts: currentMode === 'PVC_STORAGE_STRESS' ? Math.floor(Date.now() / 10000) % 8 + 1 : 0,
              cpu: currentMode === 'PVC_STORAGE_STRESS' ? 1 : 12,
              memory: 85,
              network: { in: 8, out: 12 },
              pvc: { read: 2, write: 8, latency: currentMode === 'PVC_STORAGE_STRESS' ? 25 : 1.9 },
              logs: currentMode === 'PVC_STORAGE_STRESS'
                ? ['🚨 CRITICAL: Failed writing pressure log to grid-database-0.', 'Connection timed out. Rebooting.']
                : ['Pressure valve telemetry synced', 'Holding state at 4.2 bar'],
              dependency: ['campus-api-gateway', 'grid-database-0']
            },
            {
              name: 'leak-detection-agent',
              status: 'Running',
              restarts: 0,
              cpu: 10,
              memory: 98,
              network: { in: 12, out: 8 },
              pvc: { read: 8, write: 1, latency: 1.2 },
              logs: ['Acoustic sensor analytics pipeline open', 'No water deviations'],
              dependency: ['campus-api-gateway']
            }
          ]
        }
      }
    };

    setClusterData(mockState);

    // AI narrative fallbacks
    let correlation = {
      detected: false,
      confidence: 0,
      title: 'Healthy Grid Cluster Telemetry',
      severity: 'LOW',
      primaryCulprit: null,
      implicatedMetrics: [],
      causalityChain: '',
      remediationSteps: [],
      explanation: 'No anomalous activity detected. KubePulse AI neural models indicate standard operations.'
    };

    if (currentMode === 'BURSTY_WORKLOAD') {
      correlation = {
        detected: true,
        confidence: 94,
        title: 'Bursty Electricity Ingestion Influx Spiking CPU',
        severity: 'MEDIUM',
        primaryCulprit: 'smart-meters-ingestion',
        implicatedMetrics: ['CPU Usage', 'Network Ingress', 'PVC Writes'],
        causalityChain: 'High Smart Meter upload spikes -> Network Ingestion queues saturated -> Heavy DB writes on PostgreSQL',
        remediationSteps: [
          'Autoscale replica size of smart-meters-ingestion pod to 3 instances.',
          'Apply high-priority scheduler class (PriorityClass) to avoid eviction.',
          'Throttle network packets temporarily on UDP 5090.'
        ],
        explanation: 'Our AI model detected a 3x surge in UDP networking volume at smart-meters-ingestion. This correlates precisely with the 120% rise in database writing routines (grid-database-0). KubePulse correlated this network wave with rising core CPU usage across the IoT namespace.'
      };
    } else if (currentMode === 'PVC_STORAGE_STRESS') {
      correlation = {
        detected: true,
        confidence: 98,
        title: 'PVC Block Storage Thrashing Causing Cascading Failures',
        severity: 'CRITICAL',
        primaryCulprit: 'grid-database-0',
        implicatedMetrics: ['PVC Latency', 'Pod Restarts', 'Disk Operations'],
        causalityChain: 'PostgreSQL heavy page flushing -> Shared host NVMe controller saturation (Latency > 35ms) -> pump-controller database connection timed out -> pump-controller health check failed -> K3s scheduler restarts pod',
        remediationSteps: [
          'Migrate grid-database-0 to high-speed dedicated SSD storage classes.',
          'Introduce Redis caching layer to offload persistent telemetry disk reads.',
          'Increase HTTP healthcheck probe timeout parameter (timeoutSeconds: 8) in pump-controller spec.'
        ],
        explanation: 'ALERT: Severe PVC storage bottleneck! The persistent volume claim attached to grid-database-0 reached 38.4ms block write latency. Correlation analysis shows that pump-controller restarts began exactly 4 seconds after PVC storage latency exceeded the 15ms threshold, indicating a downstream dependency failure, rather than a bug in pump-controller.'
      };
    } else if (currentMode === 'MEMORY_LEAK') {
      correlation = {
        detected: true,
        confidence: 99,
        title: 'Fast Memory Leak Leading to Pod OOMKilled Restarts',
        severity: 'HIGH',
        primaryCulprit: 'grid-analytics-worker',
        implicatedMetrics: ['Memory Utilization', 'OOMKilled Crashes', 'Page Cache Allocation'],
        causalityChain: 'ML load forecasting worker cache leak -> Container RSS memory hits 512MB limit -> Linux kernel OOM killer triggers -> K3s schedules pod restart',
        remediationSteps: [
          'Fix leak inside telemetry-forecaster package in python app code.',
          'Temporarily adjust container memory limit from 512Mi to 1Gi.',
          'Force garbage collector cycle every 100 iterations inside forecasting worker.'
        ],
        explanation: 'KubePulse detected a linear, non-stabilizing memory consumption rate of +25MB/tick in grid-analytics-worker, with absolutely no change in CPU workload or network ingress volume. This is a classic signature of a memory leak, resulting in K3s node eviction under OutOfMemory status.'
      };
    } else if (currentMode === 'MULTI_SERVICE_DEPENDENCY') {
      correlation = {
        detected: true,
        confidence: 91,
        title: 'Cryptographic Thread Saturation on Auth Service',
        severity: 'HIGH',
        primaryCulprit: 'auth-service',
        implicatedMetrics: ['CPU Core Saturation', 'API Gateway Wait Time'],
        causalityChain: 'Multi-device user token validation surge -> auth-service CPU threads maxed out -> campus-api-gateway request buffers full -> Client timeouts',
        remediationSteps: [
          'Horizontally scale auth-service to distribute CPU-bound crypto hashing load.',
          'Implement OAuth token caching at the campus-api-gateway layer (Redis/Memcached).',
          'Configure connection-limiting policies on external gateways to buffer spikes.'
        ],
        explanation: 'The AI correlation maps a CPU core peak of 95% on auth-service as the direct antecedent to high request delays in campus-api-gateway. The bottleneck is the high computational weight of OAuth cryptographic token validations on the edge gateway CPU.'
      };
    }

    setAiCorrelation(correlation);

    // Mock logs
    const mockLogs = [
      { timestamp: new Date(), level: 'INFO', message: `[system] Running in browser sandbox demo mode.` },
      { timestamp: new Date(Date.now() - 3000), level: currentMode === 'PVC_STORAGE_STRESS' ? 'CRITICAL' : 'INFO', message: currentMode === 'PVC_STORAGE_STRESS' ? '[pump-controller] 🚨 Failed writing pressure log. Timeout.' : '[pump-controller] State synced at 4.2 bar' },
      { timestamp: new Date(Date.now() - 5000), level: currentMode === 'BURSTY_WORKLOAD' ? 'WARNING' : 'INFO', message: currentMode === 'BURSTY_WORKLOAD' ? '[smart-meters-ingestion] ⚠️ High packet wave. Ingesting 2500 pkg/sec' : '[smart-meters-ingestion] Processing 450 meters/sec' },
      { timestamp: new Date(Date.now() - 8000), level: 'INFO', message: '[campus-api-gateway] Gateway routing verified.' }
    ];
    setLogs(mockLogs);
  };

  // Poll cluster data when console view is active
  useEffect(() => {
    if (view !== 'console') return;

    let fallbackTimer;

    const fetchData = async () => {
      try {
        // Fetch Cluster telemetry
        const resStats = await fetch(`${BACKEND_URL}/cluster/status`);
        const stats = await resStats.json();
        setClusterData(stats.clusterState);
        setSimulationMode(stats.simulationMode);
        setIsUsingClientFallback(false);

        // Fetch AI correlation findings
        const resAi = await fetch(`${BACKEND_URL}/cluster/ai-correlation`);
        const ai = await resAi.json();
        setAiCorrelation(ai);

        // Fetch Event logs
        const resLogs = await fetch(`${BACKEND_URL}/cluster/logs`);
        const logEntries = await resLogs.json();
        setLogs(logEntries);
      } catch (err) {
        // Backend offline (e.g. Vercel static deployment)
        setIsUsingClientFallback(true);
        runClientSideSimulationTick(simulationMode);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [view, simulationMode, activeDeployment]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Trigger Anomaly on Backend or locally
  const triggerSimulation = async (mode) => {
    setSimulationMode(mode);
    if (isUsingClientFallback) {
      runClientSideSimulationTick(mode);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/cluster/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      const data = await res.json();
      if (data.success) {
        // Instant re-fetch logs
        const resLogs = await fetch(`${BACKEND_URL}/cluster/logs`);
        const logEntries = await resLogs.json();
        setLogs(logEntries);
      }
    } catch (err) {
      // Backend disconnected, fallback handles it
      setIsUsingClientFallback(true);
      runClientSideSimulationTick(mode);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get color depending on pod status
  const getPodStatusColor = (status) => {
    switch (status) {
      case 'Running': return 'var(--success)';
      case 'OOMKilled': return '#94A3B8';
      case 'Error':
      case 'CrashLoopBackOff': return 'var(--danger)';
      default: return 'var(--warning)';
    }
  };

  return (
    <div className="app-container">
      {/* 1. HEADER / NAVIGATION */}
      <header className="navbar">
        <a href="#hero" className="logo" onClick={() => setView('landing')}>
          <Brain className="animate-pulse-glow" style={{ color: 'var(--primary-light)' }} size={32} />
          <span>KubePulse <span style={{ color: 'var(--primary-light)' }}>AI</span></span>
        </a>
        
        <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {view === 'landing' && (
            <>
              <a href="#problem" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>The Problem</a>
              <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Features</a>
              <a href="#comparison" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500 }}>Technology Comparison</a>
            </>
          )}
          {view === 'landing' ? (
            <button className="btn-primary" onClick={() => setView('console')}>
              Launch Ops Console <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn-secondary" onClick={() => setView('landing')}>
              Back to Landing Page
            </button>
          )}
        </nav>
      </header>

      {/* 2. LANDING PAGE VIEW */}
      {view === 'landing' && (
        <main className="hero-gradient" style={{ flex: 1 }}>
          {/* HERO SECTION */}
          <section id="hero" style={{ padding: '5rem 2rem 3rem 2rem', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.08)', padding: '0.4rem 1rem', borderRadius: '999px', border: '1px solid rgba(59, 130, 246, 0.15)', marginBottom: '1.5rem' }}>
              <Sparkles size={14} style={{ color: 'var(--primary-light)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>ABB Hackathon Winner Concept</span>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
              Next-Gen Edge AI Correlation <br />
              <span className="gradient-text">For Single-Node K3s Clusters</span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: 1.6 }}>
              KubePulse AI correlates CPU spikes, memory leaks, bursty IoT workloads, and PVC storage stress in real-time, pinpointing cascading failures before your edge nodes crash. Built for smart university campuses and smart grids.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }} onClick={() => setView('console')}>
                Enter Interactive Simulation Dashboard <Sliders size={18} />
              </button>
              <a href="#problem" className="btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.05rem', textDecoration: 'none' }}>
                Explore Problem Scope
              </a>
            </div>
          </section>

          {/* DYNAMIC METRIC RING PREVIEW */}
          <section style={{ display: 'flex', justifyContent: 'center', padding: '0 2rem 4rem 2rem' }}>
            <div className="glass-card animate-float" style={{ maxWidth: '800px', width: '100%', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.12)' }}>
              <div>
                <Cpu size={36} style={{ color: 'var(--primary-light)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>2.1ms</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Base Disk I/O Latency</p>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <Brain size={36} style={{ color: 'var(--accent)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Real-Time</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>AI Causal Inference</p>
              </div>
              <div>
                <HardDrive size={36} style={{ color: 'var(--secondary)', marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>&lt;1.2%</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>CPU Node Footprint</p>
              </div>
            </div>
          </section>

          {/* PROBLEM SECTION (Z-PATTERN) */}
          <section id="problem" style={{ padding: '5rem 2rem', background: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>The Edge Kubernetes Challenge</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
                  Single-node clusters running K3s, MicroK8s, or lightweight environments power smart grids and town gateways. But when bursty workloads crash the system, tracing root causes is nearly impossible.
                </p>
              </div>

              {/* Row 1: Bursty Workloads (Text Left / Visual Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', background: 'rgba(59, 130, 246, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem' }}>
                    SCENARIO 1
                  </div>
                  <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Bursty IoT Workloads Splicing Pipelines</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    In a Smart Grid network, thousands of water and energy sensors upload telemetry concurrently. This causes massive ingestion queues to saturate UDP network streams. While legacy platforms show high CPU load, they fail to correlate this ingestion wave with secondary service delays.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> <span>Network wave tracking</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text)' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} /> <span>Automatic rate mitigation</span>
                    </div>
                  </div>
                </div>
                <div className="glass-card" style={{ padding: '2rem', background: '#F8FAFC', border: '1px solid rgba(226, 232, 240, 0.8)' }}>
                  {/* Mock Visual */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>IoT Sensor Stream Ingest</span>
                    <span className="badge badge-warning">Bursty (85% CPU)</span>
                  </div>
                  {/* Dynamic bar charts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>UDP Ingress Packets</span>
                        <span>4.5k p/s</span>
                      </div>
                      <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '85%', height: '100%', background: 'var(--warning)' }}></div>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Database WAL Queue Lock</span>
                        <span>Locked</span>
                      </div>
                      <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '92%', height: '100%', background: 'var(--danger)' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: PVC Storage Thrashing (Visual Left / Text Right) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                <div className="glass-card" style={{ padding: '2rem', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>PVC Volume (NVMe controller)</span>
                    <span className="badge badge-danger">38.4ms latency</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>I/O Write Wait-Queue</span>
                        <span>Extreme Stress</span>
                      </div>
                      <div style={{ height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: '95%', height: '100%', background: 'var(--danger)' }}></div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.8rem', color: 'var(--danger)' }}>
                      <strong>AI Correlation:</strong> Block storage wait-time delays are causing dependent microservices (API Gateways & Core Loops) to fail internal heartbeat probes and crash reboot.
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'inline-flex', background: 'rgba(239, 68, 68, 0.08)', padding: '0.35rem 0.75rem', borderRadius: '8px', color: 'var(--danger)', fontWeight: 600, fontSize: '0.8rem', marginBottom: '1rem' }}>
                    SCENARIO 2
                  </div>
                  <h3 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Shared PVC Storage Bottlenecks</h3>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                    In single-node gateways, microservices share the same physical drive. When a database performs a large persistent file write, NVMe write latency spikes. The API gateway, unable to write logs, times out and triggers a restart. Developers waste days inspecting the API gateway code, when the true culprit was disk I/O thrashing on the shared database drive!
                  </p>
                  <button className="btn-secondary" onClick={() => setView('console')}>
                    Run PVC Stress Test <Activity size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* TECHNOLOGY COMPARISON MATRIX */}
          <section id="comparison" style={{ padding: '5rem 2rem', background: '#F8FAFC', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>Why KubePulse AI is the Winning Pitch</h2>
                <p style={{ color: 'var(--text-muted)' }}>
                  Unlike generic tools that dump raw metrics, KubePulse correlates multiple layers inside lightweight edge setups out-of-the-box.
                </p>
              </div>

              <div className="glass-card" style={{ overflow: 'hidden', padding: '1rem' }}>
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th>Capability</th>
                      <th>KubePulse AI</th>
                      <th>Prometheus + Grafana</th>
                      <th>Goldilocks / VPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>Real-Time Cross-Resource Correlation</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Multi-Dimensional AI</td>
                      <td>❌ No, charts are segregated</td>
                      <td>❌ Static checks only</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>PVC Latency Dependency Tracing</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Direct Correlative Alerts</td>
                      <td>⚠️ Basic IOPS numbers only</td>
                      <td>❌ No storage metrics</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>Causality Engine & Explanation</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Interactive Explanations</td>
                      <td>❌ Requires manual triage</td>
                      <td>❌ None</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>Edge CPU & Memory Footprint</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>✅ Extremely Light (&lt;15MB)</td>
                      <td>⚠️ Medium (120-250MB)</td>
                      <td>⚠️ Heavy (Controller loops)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* CALL TO ACTION PITCH */}
          <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'linear-gradient(185deg, var(--primary-dark) 0%, var(--primary) 100%)', color: 'white' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>Witness KubePulse AI in Action</h2>
            <p style={{ maxWidth: '650px', margin: '0 auto 2.5rem auto', opacity: 0.9, lineHeight: 1.6 }}>
              Deploy our simulation dashboard. Trigger synthetic stress tests like PVC thrashing or memory leaks on simulated university grids and see our AI correlation map the exact causality in real-time.
            </p>
            <button className="btn-primary" style={{ background: 'white', color: 'var(--primary)', padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => setView('console')}>
              Launch Operations Console Dashboard
            </button>
          </section>

          {/* FOOTER */}
          <footer style={{ padding: '3rem 2rem', borderTop: '1px solid #E2E8F0', background: 'white' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <a href="#hero" className="logo" style={{ marginBottom: '1rem' }}>
                  <Brain style={{ color: 'var(--primary-light)' }} size={24} />
                  <span>KubePulse <span style={{ color: 'var(--primary-light)' }}>AI</span></span>
                </a>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '300px' }}>
                  Container automation analytics platform designed for the ABB Hackathon 2026. Custom engineering concept for edge smart grids.
                </p>
              </div>
              <div>
                <h5 style={{ marginBottom: '0.75rem' }}>Features</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>AI Correlation Engine</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Edge K3s Topography</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>PVC storage analysis</p>
              </div>
              <div>
                <h5 style={{ marginBottom: '0.75rem' }}>Smart Deployment Cases</h5>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>University Water Controller Grid</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Smart Town Electric Ingest</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>Single-Node Edge Clusters</p>
              </div>
            </div>
          </footer>
        </main>
      )}

      {/* 3. DASHBOARD VIEW */}
      {view === 'console' && (
        <main style={{ flex: 1, background: '#F1F5F9' }}>
          <div className="dashboard-grid">
            
            {/* PANEL 1: CONTROL CENTER & NODE STATUS */}
            <aside className="console-sidebar">
              
              {/* Trigger panel */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={18} style={{ color: 'var(--primary)' }} />
                  <span>Stress Test Simulator</span>
                </h3>
                
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Inject operational stress patterns directly into the cluster and observe the real-time AI response.
                </p>
                
                {isUsingClientFallback && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: '8px', padding: '0.6rem', fontSize: '0.7rem', color: '#15803D', marginBottom: '0.75rem' }}>
                    <Sparkles size={14} style={{ color: 'var(--success)', marginTop: '0.1rem', flexShrink: 0 }} />
                    <span><strong>Active:</strong> Static Sandbox Mode (No local server required!)</span>
                  </div>
                )}
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ 
                      justifyContent: 'flex-start',
                      borderColor: simulationMode === 'NORMAL' ? 'var(--success)' : '#CBD5E1',
                      background: simulationMode === 'NORMAL' ? '#EFF6FF' : 'white',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1rem'
                    }}
                    onClick={() => triggerSimulation('NORMAL')}
                    disabled={isLoading}
                  >
                    <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                    <span>Normal Operations</span>
                  </button>

                  <button 
                    className="btn-secondary" 
                    style={{ 
                      justifyContent: 'flex-start',
                      borderColor: simulationMode === 'BURSTY_WORKLOAD' ? 'var(--warning)' : '#CBD5E1',
                      background: simulationMode === 'BURSTY_WORKLOAD' ? '#FFFBEB' : 'white',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1rem'
                    }}
                    onClick={() => triggerSimulation('BURSTY_WORKLOAD')}
                    disabled={isLoading}
                  >
                    <Network size={16} style={{ color: 'var(--warning)' }} />
                    <span>Bursty IoT Workload</span>
                  </button>

                  <button 
                    className="btn-secondary" 
                    style={{ 
                      justifyContent: 'flex-start',
                      borderColor: simulationMode === 'PVC_STORAGE_STRESS' ? 'var(--danger)' : '#CBD5E1',
                      background: simulationMode === 'PVC_STORAGE_STRESS' ? '#FEF2F2' : 'white',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1rem'
                    }}
                    onClick={() => triggerSimulation('PVC_STORAGE_STRESS')}
                    disabled={isLoading}
                  >
                    <HardDrive size={16} style={{ color: 'var(--danger)' }} />
                    <span>PVC Storage Thrashing</span>
                  </button>

                  <button 
                    className="btn-secondary" 
                    style={{ 
                      justifyContent: 'flex-start',
                      borderColor: simulationMode === 'MEMORY_LEAK' ? 'var(--danger)' : '#CBD5E1',
                      background: simulationMode === 'MEMORY_LEAK' ? '#FEF2F2' : 'white',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1rem'
                    }}
                    onClick={() => triggerSimulation('MEMORY_LEAK')}
                    disabled={isLoading}
                  >
                    <TrendingUp size={16} style={{ color: 'var(--danger)' }} />
                    <span>Forecaster Memory Leak</span>
                  </button>

                  <button 
                    className="btn-secondary" 
                    style={{ 
                      justifyContent: 'flex-start',
                      borderColor: simulationMode === 'MULTI_SERVICE_DEPENDENCY' ? '#7C3AED' : '#CBD5E1',
                      background: simulationMode === 'MULTI_SERVICE_DEPENDENCY' ? '#F5F3FF' : 'white',
                      fontSize: '0.85rem',
                      padding: '0.6rem 1rem'
                    }}
                    onClick={() => triggerSimulation('MULTI_SERVICE_DEPENDENCY')}
                    disabled={isLoading}
                  >
                    <Layers size={16} style={{ color: '#7C3AED' }} />
                    <span>Auth Thread Lockout</span>
                  </button>
                </div>
              </div>

              {/* Node Status panel */}
              {clusterData && (
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server size={18} style={{ color: 'var(--primary)' }} />
                    <span>Edge Hardware Status</span>
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>OS / Node</span>
                        <span style={{ fontWeight: 600 }}>k3s-edge-01</span>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {clusterData.nodeStatus.os}
                      </p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Node CPU Core Load</span>
                        <strong>{clusterData.nodeStatus.cpuUsage}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${clusterData.nodeStatus.cpuUsage}%`, 
                          height: '100%', 
                          background: clusterData.nodeStatus.cpuUsage > 80 ? 'var(--danger)' : 'var(--primary)' 
                        }}></div>
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <span>Node Memory Load</span>
                        <strong>{clusterData.nodeStatus.memoryUsage}%</strong>
                      </div>
                      <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${clusterData.nodeStatus.memoryUsage}%`, 
                          height: '100%', 
                          background: clusterData.nodeStatus.memoryUsage > 80 ? 'var(--danger)' : 'var(--primary)' 
                        }}></div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                      <div style={{ background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PVC IOPS</span>
                        <h5 style={{ fontSize: '0.95rem' }}>{clusterData.nodeStatus.pvcWriteIops}</h5>
                      </div>
                      <div style={{ background: clusterData.nodeStatus.pvcLatencyMs > 10 ? '#FEF2F2' : '#F8FAFC', padding: '0.5rem', borderRadius: '8px', border: clusterData.nodeStatus.pvcLatencyMs > 10 ? '1px solid rgba(239,68,68,0.3)' : 'none' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>PVC Latency</span>
                        <h5 style={{ fontSize: '0.95rem', color: clusterData.nodeStatus.pvcLatencyMs > 10 ? 'var(--danger)' : 'var(--text)' }}>
                          {clusterData.nodeStatus.pvcLatencyMs} ms
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </aside>

            {/* PANEL 2: INTERACTIVE SVG TOPOLOGY MAP & LOGS */}
            <section className="console-center">
              
              {/* Cluster Topography Canvas */}
              <div className="glass-card" style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} style={{ color: 'var(--primary)' }} />
                      <span>Cluster Topology Map</span>
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Click on any container pod to inspect real-time metrics and configurations.
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Edge Context:</span>
                    <select 
                      value={activeDeployment} 
                      onChange={(e) => setActiveDeployment(e.target.value)}
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.75rem' }}
                    >
                      <option value="campus">University Smart Campus</option>
                      <option value="town">Town Smart Grid</option>
                    </select>
                  </div>
                </div>

                {/* SVG Visualizer Canvas */}
                <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden', minHeight: '380px' }}>
                  {clusterData ? (
                    <svg width="100%" height="100%" viewBox="0 0 700 380" style={{ display: 'block' }}>
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* 1. Namespace Box: smart-campus-core */}
                      <g>
                        <rect x="20" y="30" width="200" height="320" rx="10" fill="rgba(219, 234, 254, 0.15)" stroke="var(--primary-light)" strokeDasharray="3 3" />
                        <text x="30" y="50" fill="var(--primary-dark)" fontWeight="700" fontSize="10">NS: smart-campus-core</text>
                        
                        {/* Pods inside smart-campus-core */}
                        {clusterData.namespaces['smart-campus-core'].pods.map((pod, i) => {
                          const yOffset = 70 + (i * 90);
                          const isSelected = selectedPod && selectedPod.name === pod.name;
                          return (
                            <g key={pod.name} cursor="pointer" onClick={() => setSelectedPod(pod)}>
                              {/* Background Card */}
                              <rect 
                                x="35" 
                                y={yOffset} 
                                width="170" 
                                height="70" 
                                rx="8" 
                                fill={isSelected ? '#EFF6FF' : '#FFFFFF'} 
                                stroke={isSelected ? 'var(--primary-light)' : '#E2E8F0'} 
                                strokeWidth={isSelected ? 2 : 1}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.02))' }}
                              />
                              {/* Glowing Status Indicator */}
                              <circle cx="50" cy={yOffset + 35} r="6" fill={getPodStatusColor(pod.status)} className={pod.status !== 'Running' ? 'animate-pulse-glow' : ''} />
                              
                              {/* Pod details */}
                              <text x="68" y={yOffset + 24} fontWeight="600" fontSize="11" fill="var(--text)">{pod.name}</text>
                              <text x="68" y={yOffset + 40} fontSize="9" fill="var(--text-muted)">Restarts: {pod.restarts}</text>
                              <text x="68" y={yOffset + 54} fontSize="9" fill="var(--primary)" fontWeight="500">
                                CPU: {pod.cpu}% | MEM: {pod.memory}MB
                              </text>
                            </g>
                          )
                        })}
                      </g>

                      {/* Network Data pipes */}
                      <path d="M 220 135 H 280" fill="none" stroke="#93C5FD" strokeWidth="2" className="data-pipe" />
                      <path d="M 220 225 H 280" fill="none" stroke="#93C5FD" strokeWidth="2" className="data-pipe" />

                      {/* 2. Namespace Box: iot-smart-grid */}
                      <g>
                        <rect x="280" y="30" width="200" height="320" rx="10" fill="rgba(219, 234, 254, 0.15)" stroke="var(--primary-light)" strokeDasharray="3 3" />
                        <text x="290" y="50" fill="var(--primary-dark)" fontWeight="700" fontSize="10">NS: iot-smart-grid</text>

                        {/* Pods inside iot-smart-grid */}
                        {clusterData.namespaces['iot-smart-grid'].pods.map((pod, i) => {
                          const yOffset = 70 + (i * 90);
                          const isSelected = selectedPod && selectedPod.name === pod.name;
                          return (
                            <g key={pod.name} cursor="pointer" onClick={() => setSelectedPod(pod)}>
                              {/* Background Card */}
                              <rect 
                                x="295" 
                                y={yOffset} 
                                width="170" 
                                height="70" 
                                rx="8" 
                                fill={isSelected ? '#EFF6FF' : '#FFFFFF'} 
                                stroke={isSelected ? 'var(--primary-light)' : '#E2E8F0'} 
                                strokeWidth={isSelected ? 2 : 1}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.02))' }}
                              />
                              {/* Glowing Status Indicator */}
                              <circle cx="310" cy={yOffset + 35} r="6" fill={getPodStatusColor(pod.status)} className={pod.status !== 'Running' ? 'animate-pulse-glow' : ''} />

                              {/* Pod details */}
                              <text x="328" y={yOffset + 24} fontWeight="600" fontSize="11" fill="var(--text)">{pod.name}</text>
                              <text x="328" y={yOffset + 40} fontSize="9" fill="var(--text-muted)">Restarts: {pod.restarts}</text>
                              <text x="328" y={yOffset + 54} fontSize="9" fill="var(--primary)" fontWeight="500">
                                CPU: {pod.cpu}% | MEM: {pod.memory}MB
                              </text>
                            </g>
                          )
                        })}
                      </g>

                      {/* Connection to water controller */}
                      <path d="M 480 150 H 530" fill="none" stroke="#93C5FD" strokeWidth="2" className="data-pipe" />

                      {/* 3. Namespace Box: water-management */}
                      <g>
                        <rect x="530" y="30" width="150" height="320" rx="10" fill="rgba(219, 234, 254, 0.15)" stroke="var(--primary-light)" strokeDasharray="3 3" />
                        <text x="540" y="50" fill="var(--primary-dark)" fontWeight="700" fontSize="10">NS: water-management</text>

                        {/* Pods inside water-management */}
                        {clusterData.namespaces['water-management'].pods.map((pod, i) => {
                          const yOffset = 70 + (i * 90);
                          const isSelected = selectedPod && selectedPod.name === pod.name;
                          return (
                            <g key={pod.name} cursor="pointer" onClick={() => setSelectedPod(pod)}>
                              {/* Background Card */}
                              <rect 
                                x="540" 
                                y={yOffset} 
                                width="130" 
                                height="70" 
                                rx="8" 
                                fill={isSelected ? '#EFF6FF' : '#FFFFFF'} 
                                stroke={isSelected ? 'var(--primary-light)' : '#E2E8F0'} 
                                strokeWidth={isSelected ? 2 : 1}
                                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.02))' }}
                              />
                              {/* Glowing Status Indicator */}
                              <circle cx="555" cy={yOffset + 35} r="5" fill={getPodStatusColor(pod.status)} className={pod.status !== 'Running' ? 'animate-pulse-glow' : ''} />

                              {/* Pod details */}
                              <text x="568" y={yOffset + 24} fontWeight="600" fontSize="10" fill="var(--text)">{pod.name}</text>
                              <text x="568" y={yOffset + 40} fontSize="8" fill="var(--text-muted)">Restarts: {pod.restarts}</text>
                              <text x="568" y={yOffset + 52} fontSize="8" fill="var(--primary)" fontWeight="500">
                                CPU: {pod.cpu}%
                              </text>
                            </g>
                          )
                        })}
                      </g>
                    </svg>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1rem' }}>
                      <RefreshCw className="animate-spin-slow" size={32} />
                      <p>Connecting to Edge Kubernetes cluster simulation...</p>
                    </div>
                  )}
                </div>

                {/* Selected Pod Metadata Overlay drawer */}
                {selectedPod && (
                  <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <Database size={24} style={{ color: 'var(--primary)' }} />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', margin: 0 }}>Selected Pod: <code style={{ color: 'var(--primary-dark)' }}>{selectedPod.name}</code></h4>
                        <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          <span>Status: <strong style={{ color: getPodStatusColor(selectedPod.status) }}>{selectedPod.status}</strong></span>
                          <span>PVC Write: <strong>{selectedPod.pvc?.write || 0} IOPS</strong></span>
                          <span>Network Out: <strong>{selectedPod.network?.out || 0} MB/s</strong></span>
                        </div>
                      </div>
                    </div>
                    <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setSelectedPod(null)}>
                      Close Details
                    </button>
                  </div>
                )}
              </div>

              {/* Logs Terminal */}
              <div className="glass-card" style={{ padding: '1.25rem', height: '220px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Terminal size={16} />
                    <span>Real-Time Cluster Logs</span>
                  </h4>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Dynamic Polling (2s)</span>
                </div>
                
                <div className="terminal-console" style={{ flex: 1 }}>
                  {logs.length > 0 ? (
                    logs.map((log, idx) => (
                      <div key={idx} className={`terminal-line ${log.level}`}>
                        [{new Date(log.timestamp).toLocaleTimeString()}] [{log.level || 'INFO'}] {log.message}
                      </div>
                    ))
                  ) : (
                    <div style={{ opacity: 0.6 }}>Awaiting connection logs...</div>
                  )}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </section>

            {/* PANEL 3: COGNITIVE AI INSIGHTS DRAWER */}
            <aside className="console-drawer">
              {aiCorrelation ? (
                <div className="glass-card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
                  
                  {/* AI Status Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', background: '#F0FDF4', padding: '0.75rem', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                    <Brain className={aiCorrelation.detected ? 'animate-pulse-glow' : ''} size={28} style={{ color: aiCorrelation.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--success)' }} />
                    <div>
                      <h4 style={{ fontSize: '0.9rem', margin: 0 }}>KubePulse AI Model</h4>
                      <span className="badge badge-success" style={{ fontSize: '0.65rem', marginTop: '0.15rem' }}>
                        Brain Connected ({aiCorrelation.confidence}% Confidence)
                      </span>
                    </div>
                  </div>

                  {/* Core Diagnostic Narrative */}
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Health Diagnostic</span>
                      <h3 style={{ fontSize: '1.2rem', marginTop: '0.25rem', color: aiCorrelation.severity === 'CRITICAL' ? 'var(--danger)' : 'var(--text)' }}>
                        {aiCorrelation.title}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                        {aiCorrelation.explanation}
                      </p>
                    </div>

                    {/* Implicated Metrics Badges */}
                    {aiCorrelation.implicatedMetrics?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Implicated Resources</span>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {aiCorrelation.implicatedMetrics.map((met, idx) => (
                            <span key={idx} className="badge badge-info" style={{ fontSize: '0.65rem', background: 'rgba(59,130,246,0.08)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.15)' }}>
                              {met}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Causality Chain */}
                    {aiCorrelation.causalityChain && (
                      <div style={{ background: '#F8FAFC', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid var(--primary-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Dependency Causality Chain</span>
                        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text)' }}>
                          {aiCorrelation.causalityChain}
                        </p>
                      </div>
                    )}

                    {/* Remediation Checklists */}
                    {aiCorrelation.remediationSteps?.length > 0 && (
                      <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Auto-Remediation Plan</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                          {aiCorrelation.remediationSteps.map((step, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.75rem' }}>
                              <CheckCircle size={14} style={{ color: 'var(--success)', marginTop: '0.1rem', flexShrink: 0 }} />
                              <span style={{ color: 'var(--text-muted)' }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Optimizer recommendations card */}
                  <div style={{ marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '1rem' }}>
                    <div style={{ background: '#FFFBEB', border: '1px solid #FEF3C7', padding: '0.75rem', borderRadius: '10px', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <AlertTriangle size={16} style={{ color: 'var(--warning)', marginTop: '0.1rem', flexShrink: 0 }} />
                      <div>
                        <h5 style={{ fontSize: '0.8rem', margin: 0, color: '#B45309' }}>Resource Optimizer Suggestion</h5>
                        <p style={{ fontSize: '0.7rem', color: '#B45309', marginTop: '0.15rem' }}>
                          {simulationMode === 'NORMAL' 
                            ? "Cluster size is perfectly scaled. Auth service is running at 94% optimization." 
                            : "Memory limits on grid-analytics-worker are capped at 512MB. Consider scaling memory to 1GB to prevent OOM evictions."}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Awaiting telemetry metrics for correlation...
                </div>
              )}
            </aside>

          </div>
        </main>
      )}
    </div>
  );
}
