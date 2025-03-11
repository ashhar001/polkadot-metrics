// route.js
const express = require('express');
const router = express.Router();
const client = require('prom-client');
const { getStatusData } = require('./metrics');
const { getApi, getIsConnected } = require('./connection');

// Prometheus metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Status endpoint
router.get('/status', (req, res) => {
  res.json(getStatusData());
});

// Health check endpoint
router.get('/health', (req, res) => {
  const statusData = getStatusData();
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiConnected: getIsConnected() && getApi() && getApi().isConnected,
    lastMetricsUpdate: statusData.timestamp,
    connectionStatus: statusData.connectionStatus
  };

  if (statusData.lastError) {
    healthStatus.lastError = statusData.lastError;
  }
  res.status(healthStatus.apiConnected ? 200 : 503).json(healthStatus);
});

// Readiness endpoint
router.get('/ready', (req, res) => {
  if (getIsConnected() && getApi() && getApi().isConnected) {
    res.status(200).json({
      status: 'ready',
      lastUpdate: getStatusData().timestamp,
      connectionStatus: getStatusData().connectionStatus
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      connectionStatus: getStatusData().connectionStatus || 'disconnected',
      lastError: getStatusData().lastError
    });
  }
});

module.exports = router;
