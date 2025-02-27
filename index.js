const express = require('express');
const { ApiPromise, WsProvider } = require('@polkadot/api');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;
const CHAIN_LABEL = 'polkadot'; // Change as needed



// Gauge for the current era
const currentEraGauge = new client.Gauge({
  name: 'polkadot_current_era',
  help: 'Current era of the Polkadot network',
  labelNames: ['chain']
});

// Gauge for validator reward points (one per validator)
const validatorRewardGauge = new client.Gauge({
  name: 'polkadot_validator_reward_points',
  help: 'Reward points for validators in the current era',
  labelNames: ['chain', 'validator']
});

// Gauge for the current session index
const sessionIndexGauge = new client.Gauge({
  name: 'polkadot_session_current_index',
  help: 'Current session index of the Polkadot network',
  labelNames: ['chain']
});

// Gauge for the current block number (system)
const systemBlockGauge = new client.Gauge({
  name: 'polkadot_system_block_number',
  help: 'Current block number of the Polkadot network',
  labelNames: ['chain']
});


// Global status data for the /status endpoint
let statusData = {
  timestamp: null,
  currentEra: null,
  erasRewardPoints: {
    total: null,
    individual: {}
  }
};

let api = null;
let isConnected = false;

async function connectToPolkadot() {
    try {
        const provider = new WsProvider('wss://polkadot.api.onfinality.io/public-ws');
        
        api = await ApiPromise.create({ provider });
        
        api.on('disconnected', async () => {
            isConnected = false;
            console.log('Disconnected from Polkadot API, attempting to reconnect...');
            await connectToPolkadot();
        });

        api.on('connected', () => {
            isConnected = true;
            console.log('Connected to Polkadot API');
        });

        await api.isReady;
        isConnected = true;
        console.log('API is ready');
    } catch (error) {
        console.error('Connection error:', error);
        isConnected = false;
        // Retry connection after delay
        setTimeout(connectToPolkadot, 5000);
    }
}



async function updateMetrics() {
  try {
    if (!api || !isConnected) {
      console.log('Skipping metrics update - API not ready');
      return;
    }

    const currentEraOption = await Promise.race([
      api.query.staking.currentEra(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Era query timeout')), 10000)
      )
    ]);
    const currentEra = currentEraOption.unwrapOr(0).toNumber();

    const currentEraRewardPoints = await Promise.race([
      api.query.staking.erasRewardPoints(currentEra),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Reward points query timeout')), 10000)
      )
    ]);

    // Reset Prometheus gauges before updating
    currentEraGauge.reset();
    validatorRewardGauge.reset();

    // Update current era gauge
    currentEraGauge.labels(CHAIN_LABEL).set(currentEra);

    const { total, individual } = currentEraRewardPoints;

    // Prepare new status data object
    const newStatusData = {
      timestamp: new Date().toISOString(),
      currentEra: currentEra,
      erasRewardPoints: {
        total: total.toString(),
        individual: {},
      },
      connectionStatus: 'connected'
    };

    // Update metrics for each validator
    individual.forEach((points, validatorId) => {
      const pointsNumber = points.toNumber();
      validatorRewardGauge.labels(CHAIN_LABEL, validatorId.toString()).set(pointsNumber);
      newStatusData.erasRewardPoints.individual[validatorId.toString()] = pointsNumber;
    });

    // SESSION METRICS
    const currentSessionOption = await Promise.race([
      api.query.session.currentIndex(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Session query timeout')), 10000)
      )
    ]);
    const currentSession = currentSessionOption.toNumber();
    sessionIndexGauge.labels(CHAIN_LABEL).set(currentSession);
    newStatusData.sessionIndex = currentSession;

    //  SYSTEM METRICS
    const currentBlockOption = await Promise.race([
      api.query.system.number(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('System block query timeout')), 10000)
      )
    ]);
    const currentBlock = currentBlockOption.toNumber();
    systemBlockGauge.labels(CHAIN_LABEL).set(currentBlock);
    newStatusData.systemBlock = currentBlock;

    // Atomically update the global status data
    statusData = newStatusData;

    console.log(`Metrics updated successfully at ${statusData.timestamp}`);
  } catch (error) {
    console.error('Error updating metrics:', error);
    statusData = {
      ...statusData,
      timestamp: new Date().toISOString(),
      connectionStatus: 'error',
      lastError: error.message
    };

    // Trigger reconnection if API issues are detected
    if (!isConnected || error.message.includes('timeout')) {
      console.log('Detected API issues, attempting reconnection...');
      isConnected = false;
      await connectToPolkadot();
    }
  }
}


function startMetricsUpdateInterval() {
  // Initial delay before first update
  setTimeout(async () => {
    await updateMetrics(); // initial call
    
    // Set up the regular interval
    setInterval(async () => {
      await updateMetrics();
    }, 30000);
  }, 5000); // 5 second initial delay
}

// Expose the /metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Expose the /status endpoint with JSON data
app.get('/status', (req, res) => {
  res.json(statusData);
});

// Health check endpoint
app.get('/health', (req, res) => {
    const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiConnected: isConnected && api && api.isConnected,
        lastMetricsUpdate: statusData.timestamp,
        connectionStatus: statusData.connectionStatus
    };
    
    if (statusData.lastError) {
        healthStatus.lastError = statusData.lastError;
    }
    
    res.status(healthStatus.apiConnected ? 200 : 503).json(healthStatus);
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
    if (isConnected && api && api.isConnected) {
        res.status(200).json({ 
            status: 'ready',
            lastUpdate: statusData.timestamp,
            connectionStatus: statusData.connectionStatus
        });
    } else {
        res.status(503).json({ 
            status: 'not ready',
            connectionStatus: statusData.connectionStatus || 'disconnected',
            lastError: statusData.lastError
        });
    }
});

// Start the server after initializing the API connection and metric updates
async function startServer() {
  await connectToPolkadot();
  startMetricsUpdateInterval();
  
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  process.exit(0);
});

startServer();