// connection.js
const { ApiPromise, WsProvider } = require('@polkadot/api');

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
    setTimeout(connectToPolkadot, 5000); // Retry after 5 seconds
  }
}

function getApi() {
  return api;
}

function getIsConnected() {
  return isConnected;
}

module.exports = {
  connectToPolkadot,
  getApi,
  getIsConnected
};
