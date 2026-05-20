import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database Fallback Layer
let useFallbackDb = false;
let fallbackDbPath = path.join(__dirname, 'db_fallback.json');

// Initialize local DB file if it doesn't exist
if (!fs.existsSync(fallbackDbPath)) {
  fs.writeFileSync(fallbackDbPath, JSON.stringify({ logs: [], statsHistory: [] }, null, 2));
}

// Connect to MongoDB with auto-fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kubepulse';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('💚 MongoDB Connected successfully!');
  })
  .catch((err) => {
    console.log('⚠️ MongoDB Connection Failed. Enabling local JSON Fallback database.');
    useFallbackDb = true;
  });

// Schema Definitions (Only compiled if mongoose works)
let LogModel;
let AnomalyModel;
if (!useFallbackDb) {
  try {
    const logSchema = new mongoose.Schema({
      timestamp: { type: Date, default: Date.now },
      level: String,
      message: String,
      podName: String,
      namespace: String
    });
    LogModel = mongoose.model('Log', logSchema);

    const anomalySchema = new mongoose.Schema({
      timestamp: { type: Date, default: Date.now },
      type: String,
      severity: String,
      description: String,
      correlatedPods: [String],
      resolved: { type: Boolean, default: false }
    });
    AnomalyModel = mongoose.model('Anomaly', anomalySchema);
  } catch (e) {
    useFallbackDb = true;
  }
}

// Fallback DB Helper Functions
function saveFallbackData(key, item) {
  try {
    const data = JSON.parse(fs.readFileSync(fallbackDbPath, 'utf8'));
    if (!data[key]) data[key] = [];
    data[key].push(item);
    // Keep max 200 items to avoid bloated files
    if (data[key].length > 200) data[key].shift();
    fs.writeFileSync(fallbackDbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving fallback data:', err);
  }
}

function getFallbackData(key) {
  try {
    const data = JSON.parse(fs.readFileSync(fallbackDbPath, 'utf8'));
    return data[key] || [];
  } catch (err) {
    return [];
  }
}

// KUBEPULSE EDGE K3s CLUSTER SIMULATOR STATE
let simulationMode = 'NORMAL'; // 'NORMAL', 'BURSTY_WORKLOAD', 'PVC_STORAGE_STRESS', 'MEMORY_LEAK', 'MULTI_SERVICE_DEPENDENCY'
let timeElapsed = 0;

// Internal pod structure
let clusterState = {
  environment: 'Smart Town Campus Grid',
  nodeStatus: {
    hostname: 'edge-gateway-01.abb-town.internal',
    os: 'Ubuntu 22.04 LTS (K3s v1.28.2+k3s1)',
    cpuUsage: 22,
    memoryUsage: 45,
    diskUsage: 38,
    networkIn: 120, // MB/s
    networkOut: 98, // MB/s
    pvcReadIops: 250,
    pvcWriteIops: 180,
    pvcLatencyMs: 2.1
  },
  namespaces: {
    'smart-campus-core': {
      pods: [
        {
          name: 'campus-api-gateway',
          status: 'Running',
          restarts: 0,
          cpu: 15, // percentage
          memory: 120, // MB
          disk: 10, // MB
          network: { in: 80, out: 90 },
          pvc: { read: 5, write: 2, latency: 1.5 },
          logs: ['Routing external traffic to student services', 'Health check OK'],
          dependency: ['auth-service', 'grid-database-0']
        },
        {
          name: 'student-portal-frontend',
          status: 'Running',
          restarts: 0,
          cpu: 5,
          memory: 95,
          disk: 2,
          network: { in: 15, out: 4 },
          pvc: { read: 0, write: 0, latency: 0.0 },
          logs: ['React static files served', 'Session verification listener active'],
          dependency: ['campus-api-gateway']
        },
        {
          name: 'auth-service',
          status: 'Running',
          restarts: 0,
          cpu: 8,
          memory: 150,
          disk: 5,
          network: { in: 25, out: 25 },
          pvc: { read: 12, write: 5, latency: 1.8 },
          logs: ['OAuth2 Provider Ready', 'Token validator running on port 8081'],
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
          cpu: 28,
          memory: 180,
          disk: 25,
          network: { in: 240, out: 190 },
          pvc: { read: 10, write: 45, latency: 2.4 },
          logs: ['Listening on UDP 5090 for telemetry streams', 'Processing 450 meters/sec'],
          dependency: ['grid-database-0']
        },
        {
          name: 'grid-database-0',
          status: 'Running',
          restarts: 0,
          cpu: 32,
          memory: 340,
          disk: 1800, // MB (PVC storage)
          network: { in: 180, out: 75 },
          pvc: { read: 80, write: 150, latency: 2.8 },
          logs: ['Postgres engine listening', 'Autovacuum complete', 'WalWriter active'],
          dependency: []
        },
        {
          name: 'grid-analytics-worker',
          status: 'Running',
          restarts: 0,
          cpu: 18,
          memory: 210,
          disk: 15,
          network: { in: 35, out: 12 },
          pvc: { read: 55, write: 5, latency: 2.0 },
          logs: ['Loaded ML load-forecasting model v2.1', 'Computing campus energy trends'],
          dependency: ['grid-database-0']
        }
      ]
    },
    'water-management': {
      pods: [
        {
          name: 'pump-controller',
          status: 'Running',
          restarts: 0,
          cpu: 12,
          memory: 85,
          disk: 4,
          network: { in: 8, out: 12 },
          pvc: { read: 2, write: 8, latency: 1.9 },
          logs: ['Pressure valve telemetry synced', 'Holding state at 4.2 bar'],
          dependency: ['campus-api-gateway', 'grid-database-0']
        },
        {
          name: 'leak-detection-agent',
          status: 'Running',
          restarts: 0,
          cpu: 10,
          memory: 98,
          disk: 2,
          network: { in: 12, out: 8 },
          pvc: { read: 8, write: 1, latency: 1.2 },
          logs: ['Acoustic sensor analytics pipeline open', 'No water deviations detected'],
          dependency: ['campus-api-gateway']
        }
      ]
    }
  }
};

// Simulation Loop Ticking
setInterval(() => {
  timeElapsed += 2;
  let totalCpu = 0;
  let totalMem = 0;
  let totalDisk = 0;
  let totalNetIn = 0;
  let totalNetOut = 0;
  let totalPvcRead = 0;
  let totalPvcWrite = 0;
  let maxPvcLatency = 1.2;

  // Track dynamic changes depending on simulationMode
  Object.keys(clusterState.namespaces).forEach((nsName) => {
    clusterState.namespaces[nsName].pods.forEach((pod) => {
      // 1. BASE FLUCTUATIONS
      let cpuChange = (Math.random() - 0.5) * 4;
      let memChange = (Math.random() - 0.5) * 6;
      let netInChange = (Math.random() - 0.5) * 8;
      let netOutChange = (Math.random() - 0.5) * 8;

      pod.cpu = Math.max(2, Math.min(98, Math.round(pod.cpu + cpuChange)));
      pod.memory = Math.max(30, Math.round(pod.memory + memChange));
      pod.network.in = Math.max(1, Math.round(pod.network.in + netInChange));
      pod.network.out = Math.max(1, Math.round(pod.network.out + netOutChange));

      // 2. MODAL BEHAVIOR INJECTOR
      if (simulationMode === 'BURSTY_WORKLOAD') {
        if (pod.name === 'smart-meters-ingestion') {
          pod.cpu = Math.max(85, Math.round(pod.cpu + 5));
          pod.network.in = Math.max(650, Math.round(pod.network.in + 30));
          pod.logs.push(`⚠️ WARNING: High influx of bursty electricity grid IoT updates. Ingesting 2500 pkg/sec.`);
        }
        if (pod.name === 'grid-database-0') {
          pod.cpu = Math.max(78, Math.round(pod.cpu + 3));
          pod.pvc.write = Math.max(220, Math.round(pod.pvc.write + 20));
          pod.pvc.latency = Math.max(6.5, pod.pvc.latency + 0.3);
          pod.logs.push(`⚠️ WARNING: Database transaction logs backlog building up on /var/lib/postgresql.`);
        }
      }

      else if (simulationMode === 'PVC_STORAGE_STRESS') {
        if (pod.name === 'grid-database-0') {
          pod.cpu = Math.max(45, Math.round(pod.cpu + 2));
          pod.pvc.write = Math.max(380, Math.round(pod.pvc.write + 35));
          pod.pvc.read = Math.max(180, Math.round(pod.pvc.read + 15));
          pod.pvc.latency = Math.max(38.5, pod.pvc.latency + 4.5); // Major storage delay
          pod.logs.push(`🚨 CRITICAL: PVC storage write wait-queue full. I/O block latency exceeded 35ms!`);
        }
        // Cascading failures on pods dependent on grid-database-0
        if (pod.name === 'pump-controller') {
          // It relies on grid-database-0, since db write times out, controller fails healthcheck
          if (Math.random() > 0.65) {
            pod.status = 'Error';
            pod.restarts += 1;
            pod.cpu = 1;
            pod.logs.push(`🚨 CRITICAL: Failed writing pressure log to grid-database-0. Connection timed out. Node scheduler rebooting pod.`);
            
            const logEntry = {
              timestamp: new Date(),
              level: 'CRITICAL',
              message: `Pod pump-controller restarted. Reason: Storage I/O cascade timeout.`,
              podName: 'pump-controller',
              namespace: 'water-management'
            };
            if (useFallbackDb) saveFallbackData('logs', logEntry);
            else LogModel.create(logEntry).catch(() => {});
          } else {
            pod.status = 'Running';
          }
        }
        if (pod.name === 'campus-api-gateway') {
          pod.cpu = Math.max(50, Math.round(pod.cpu + 4));
          pod.logs.push(`⚠️ WARNING: Route /api/v1/energy delayed. Upstream response time: 2400ms (due to DB PVC stress)`);
        }
      }

      else if (simulationMode === 'MEMORY_LEAK') {
        if (pod.name === 'grid-analytics-worker') {
          // Linearly leak memory
          pod.memory = Math.round(pod.memory + 25);
          pod.cpu = Math.max(40, Math.round(pod.cpu + 1));
          pod.logs.push(`⚠️ WARNING: Cache allocation growth in forecasting engine. Free Heap size: < 12MB.`);
          
          if (pod.memory > 500) {
            pod.status = 'OOMKilled';
            pod.restarts += 1;
            pod.memory = 60; // Reset after crash
            pod.cpu = 2;
            pod.logs.push(`🚨 CRITICAL: Container grid-analytics-worker ran out of memory (OOMKilled, Limit: 512MB). Node scheduler rebooted pod.`);

            const logEntry = {
              timestamp: new Date(),
              level: 'FATAL',
              message: `Container grid-analytics-worker crashed. Reason: OutOfMemory (OOMKilled). Limit exceeded.`,
              podName: 'grid-analytics-worker',
              namespace: 'iot-smart-grid'
            };
            if (useFallbackDb) saveFallbackData('logs', logEntry);
            else LogModel.create(logEntry).catch(() => {});
          } else {
            if (pod.memory > 120) pod.status = 'Running';
          }
        }
      }

      else if (simulationMode === 'MULTI_SERVICE_DEPENDENCY') {
        if (pod.name === 'auth-service') {
          pod.cpu = Math.max(90, Math.round(pod.cpu + 6));
          pod.network.in = Math.max(280, Math.round(pod.network.in + 15));
          pod.logs.push(`🚨 CRITICAL: Cryptographic verification threads saturated. Bounded pool exhausted.`);
        }
        if (pod.name === 'campus-api-gateway') {
          pod.cpu = Math.max(68, Math.round(pod.cpu + 5));
          pod.logs.push(`⚠️ WARNING: Dependency lock on auth-service is slowing gateway routing. Requests queuing.`);
        }
        if (pod.name === 'student-portal-frontend') {
          pod.logs.push(`⚠️ WARNING: User login timeout reported for auth.smart-campus.edu`);
        }
      }

      else {
        // NORMAL MODE RECOVERY
        pod.status = 'Running';
        if (pod.name === 'grid-database-0') {
          pod.pvc.latency = Math.max(1.5, pod.pvc.latency - 3.5);
          pod.pvc.write = Math.max(40, pod.pvc.write - 15);
          pod.pvc.read = Math.max(25, pod.pvc.read - 10);
        }
        if (pod.name === 'grid-analytics-worker' && pod.memory > 250) {
          pod.memory = 210;
        }
        if (pod.logs.length > 8) pod.logs.shift();
      }

      // Sum metrics
      totalCpu += pod.cpu;
      totalMem += pod.memory;
      totalNetIn += pod.network.in;
      totalNetOut += pod.network.out;
      totalPvcRead += pod.pvc.read;
      totalPvcWrite += pod.pvc.write;
      maxPvcLatency = Math.max(maxPvcLatency, pod.pvc.latency);
    });
  });

  // Calculate Node metrics as an average/accumulation
  clusterState.nodeStatus.cpuUsage = Math.min(99, Math.round(totalCpu / 8 + 10));
  clusterState.nodeStatus.memoryUsage = Math.min(99, Math.round((totalMem / 1600) * 100)); // Assumes 16GB edge gateway node
  clusterState.nodeStatus.networkIn = Math.round(totalNetIn);
  clusterState.nodeStatus.networkOut = Math.round(totalNetOut);
  clusterState.nodeStatus.pvcReadIops = Math.round(totalPvcRead);
  clusterState.nodeStatus.pvcWriteIops = Math.round(totalPvcWrite);
  clusterState.nodeStatus.pvcLatencyMs = Math.round(maxPvcLatency * 10) / 10;

  // Store history metrics
  const statsSnapshot = {
    timestamp: new Date(),
    mode: simulationMode,
    nodeStatus: { ...clusterState.nodeStatus }
  };
  if (useFallbackDb) saveFallbackData('statsHistory', statsSnapshot);
  // Optional MongoDB logger here...

}, 2000);

// API 1: Fetch Cluster Status
app.get('/api/cluster/status', (req, res) => {
  res.json({
    simulationMode,
    clusterState,
    timeElapsed
  });
});

// API 2: Trigger Simulated Stress Anomalies
app.post('/api/cluster/trigger', (req, res) => {
  const { mode } = req.body;
  const validModes = ['NORMAL', 'BURSTY_WORKLOAD', 'PVC_STORAGE_STRESS', 'MEMORY_LEAK', 'MULTI_SERVICE_DEPENDENCY'];
  
  if (!validModes.includes(mode)) {
    return res.status(400).json({ error: `Invalid simulation mode. Choose from: ${validModes.join(', ')}` });
  }

  simulationMode = mode;

  // Log the trigger event
  const logEntry = {
    timestamp: new Date(),
    level: 'INFO',
    message: `Simulation mode altered to: ${mode} by administrator dynamic trigger.`,
    podName: 'system-orchestrator',
    namespace: 'kube-system'
  };
  if (useFallbackDb) saveFallbackData('logs', logEntry);
  else LogModel.create(logEntry).catch(() => {});

  res.json({ success: true, newMode: mode });
});

// API 3: AI Correlation Engine
app.get('/api/cluster/ai-correlation', (req, res) => {
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

  if (simulationMode === 'BURSTY_WORKLOAD') {
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
        'Throttle network packets temporarily on UDP 5090 using local ingress policies.'
      ],
      explanation: 'Our AI model detected a 3x surge in UDP networking volume at smart-meters-ingestion. This correlates precisely with the 120% rise in database writing routines (grid-database-0). KubePulse correlated this network wave with rising core CPU usage across the IoT namespace.'
    };
  }

  else if (simulationMode === 'PVC_STORAGE_STRESS') {
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
        'Increase HTTP healthcheck probe timeout parameter (timeoutSeconds: 8) in pump-controller spec to buffer database latencies.'
      ],
      explanation: 'ALERT: Severe PVC storage bottleneck! The persistent volume claim attached to grid-database-0 reached 38ms block write latency. Correlation analysis shows that pump-controller restarts began exactly 4 seconds after PVC storage latency exceeded the 15ms threshold, indicating a downstream dependency failure, rather than a bug in pump-controller.'
    };
  }

  else if (simulationMode === 'MEMORY_LEAK') {
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
  }

  else if (simulationMode === 'MULTI_SERVICE_DEPENDENCY') {
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

  res.json(correlation);
});

// API 4: Fetch Recent Cluster Logs
app.get('/api/cluster/logs', (req, res) => {
  let logs = [];
  if (useFallbackDb) {
    logs = getFallbackData('logs');
  } else {
    // We would query MongoDB
  }
  
  // Mix in standard runtime logs of pods dynamically so there is always a rich stream of data!
  const systemLogs = [];
  Object.keys(clusterState.namespaces).forEach((ns) => {
    clusterState.namespaces[ns].pods.forEach((pod) => {
      pod.logs.forEach((log) => {
        systemLogs.push({
          timestamp: new Date(Date.now() - Math.random() * 60000),
          level: log.includes('🚨') ? 'CRITICAL' : log.includes('⚠️') ? 'WARNING' : 'INFO',
          message: `[${pod.name}] ${log}`,
          podName: pod.name,
          namespace: ns
        });
      });
    });
  });

  // Sort logs by time
  const combinedLogs = [...logs, ...systemLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(combinedLogs.slice(0, 30));
});

// API 5: Fetch Node Metric History
app.get('/api/cluster/history', (req, res) => {
  if (useFallbackDb) {
    const history = getFallbackData('statsHistory');
    res.json(history.slice(-30));
  } else {
    res.json([]);
  }
});

// Root Page
app.get('/', (req, res) => {
  res.send('KubePulse AI Backend Simulator - Connected & Running.');
});

// Start Server
app.listen(PORT, () => {
  console.log(`📡 Backend Simulation Engine running on http://localhost:${PORT}`);
});
