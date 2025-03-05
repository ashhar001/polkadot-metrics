# Polkadot Metrics Exporter

This repository provides a simple Node.js application that connects to the Polkadot network, scrapes key metrics, and exposes them in a Prometheus-compatible format. The project includes a Helm chart (`polkadot-metrics`) for easy deployment on a Minikube cluster, along with pre-configured services for Grafana and Prometheus.

## Features

- **Polkadot Network Metrics**:
  - **Current Era**: The current era of the Polkadot network.
  - **Validator Reward Points**: Exposes one metric per validator, with each validator's reward points.
  - **Session Index**: Current session index.
  - **System Block Number**: The latest block number.
- **Endpoints**:
  - `/metrics`: Prometheus scrape endpoint.
  - `/status`: JSON status output with details of metrics and connection status.
  - `/health` and `/ready`: Health and readiness check endpoints.

## Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/) installed on your machine.
- [Helm](https://helm.sh/docs/intro/install/) installed.
- [kubectl](https://kubernetes.io/docs/reference/kubectl/overview/) configured for your Minikube cluster.
- Node.js (if you plan to run the application locally outside of Kubernetes).

## Installation & Deployment

Follow these steps to run the application locally on Minikube:

1. **Clone the Repository**:

   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. **Install the Helm Chart**: Deploy the application along with Grafana and Prometheus:

   ```bash
   helm install polkadot-metrics ./polkadot-metrics
   ```

3. **Verify Pod and Service Status**:

   - Check the pods:
     ```bash
     kubectl get pods
     ```
   - Check the services:
     ```bash
     kubectl get svc
     ```

4. **Access Grafana**: Open Grafana in your browser using:

   ```bash
   minikube service grafana
   ```

   - Use the default Grafana credentials (usually `admin`/`admin`) if prompted.
   - Configure dashboards to visualize metrics.

5. **Access Prometheus**: Open Prometheus in your browser:

   ```bash
   minikube service prometheus
   ```

   - You can explore metrics like `polkadot_validator_reward_points` in the Prometheus UI.

6. **Access the Polkadot Metrics Exporter**: Open the Node.js application's endpoint:

   ```bash
   minikube service polkadot-metrics
   ```

   - Visit `/metrics` for raw Prometheus metrics.
   - Visit `/status` for a JSON overview of the current metrics.
   - Visit `/health` or `/ready` for health/readiness checks.

## Local Development (Optional)

If you prefer to run the application locally without Kubernetes:

1. **Install Dependencies**:

   ```bash
   npm install
   ```

2. **Start the Application**:

   ```bash
   npm run start
   ```

3. **Access the Endpoints**:

   - [http://localhost:3000/metrics](http://localhost:3000/metrics)
   - [http://localhost:3000/status](http://localhost:3000/status)

Make sure you have a stable internet connection as the application connects to the Polkadot network via `wss://polkadot.api.onfinality.io/public-ws`.


