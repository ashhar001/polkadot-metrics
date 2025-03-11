
// index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const { connectToPolkadot, getApi, getIsConnected } = require('./connection');
const { updateMetrics } = require('./metrics');
const routes = require('./route');

// Use the routes defined in route.js
app.use('/', routes);

// Start the server and initialize the Polkadot connection and metrics updates
async function startServer() {
  await connectToPolkadot();
  
  // Start metrics update interval after a short delay
  setTimeout(async () => {
    await updateMetrics(getApi(), getIsConnected());
    setInterval(async () => {
      await updateMetrics(getApi(), getIsConnected());
    }, 30000); // Update every 30 seconds
  }, 5000); // 5-second initial delay

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
}

process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  process.exit(0);
});

startServer();
