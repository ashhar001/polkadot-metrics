// metrics.js
const client = require('prom-client');

const CHAIN_LABEL = 'polkadot';

// Prometheus Gauges
const currentEraGauge = new client.Gauge({
  name: 'polkadot_current_era',
  help: 'Current era of the Polkadot network',
  labelNames: ['chain']
});

const validatorRewardGauge = new client.Gauge({
  name: 'polkadot_validator_reward_points',
  help: 'Reward points for validators in the current era',
  labelNames: ['chain', 'validator']
});

const sessionIndexGauge = new client.Gauge({
  name: 'polkadot_session_current_index',
  help: 'Current session index of the Polkadot network',
  labelNames: ['chain']
});

const systemBlockGauge = new client.Gauge({
  name: 'polkadot_system_block_number',
  help: 'Current block number of the Polkadot network',
  labelNames: ['chain']
});

// Global status data for /status endpoint
let statusData = {
  timestamp: null,
  currentEra: null,
  erasRewardPoints: {
    total: null,
    individual: {}
  }
};

// ------------------------------
// Helper Function: fetchWithTimeout
// ------------------------------
async function fetchWithTimeout(promise, timeoutMs, errorMsg) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    )
  ]);
}

// ------------------------------
// Update Prometheus Metrics
// ------------------------------
// Expects the current api instance and connection state.
async function updateMetrics(api, isConnected) {
  try {
    if (!api || !isConnected) {
      console.log('Skipping metrics update - API not ready');
      return;
    }

    const TIMEOUT = 10000; // 10-second timeout for API calls

    // Fetch current era (staking period)
    const currentEraOption = await fetchWithTimeout(
      api.query.staking.currentEra(),
      TIMEOUT,
      'Era query timeout'
    );
    const currentEra = currentEraOption.unwrapOr(0).toNumber();

    // Fetch reward points for current era
    const currentEraRewardPoints = await fetchWithTimeout(
      api.query.staking.erasRewardPoints(currentEra),
      TIMEOUT,
      'Reward points query timeout'
    );

    // Reset gauges before updating
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

    // Parallelize independent API calls: session index and block number
    const [currentSessionOption, currentBlockOption] = await Promise.all([
      fetchWithTimeout(api.query.session.currentIndex(), TIMEOUT, 'Session query timeout'),
      fetchWithTimeout(api.query.system.number(), TIMEOUT, 'System block query timeout')
    ]);

    const currentSession = currentSessionOption.toNumber();
    const currentBlock = currentBlockOption.toNumber();

    sessionIndexGauge.labels(CHAIN_LABEL).set(currentSession);
    systemBlockGauge.labels(CHAIN_LABEL).set(currentBlock);
    newStatusData.sessionIndex = currentSession;
    newStatusData.systemBlock = currentBlock;

    // Update global status data atomically
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
  }
}

module.exports = {
  updateMetrics,
  getStatusData: () => statusData,
  client // Exporting client in case routes need to access the Prometheus registry
};
