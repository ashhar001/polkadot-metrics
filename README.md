# Polkadot Metrics Exporter 📊

This project provides **on-chain metrics for the Polkadot network** using **Prometheus and Grafana** for monitoring.

## 🌟 Features
- ✅ Exposes **current era** and **reward points** metrics for validators.
- ✅ Exposes **session and system metrics**.
- ✅ **Production-ready Kubernetes deployment** with Prometheus and Grafana.
- ✅ **Autoscaling (HPA) support** for handling heavy load.

---

## 🚀 1. Deployment Options

### **🔹 Option 1: Deploy with Kubernetes**
```sh
kubectl apply -f k8s/
```
- This will deploy:
  - `polkadot-metrics` app
  - `prometheus` monitoring
  - `grafana` visualization
  - `hpa` for autoscaling

#### **Access Services**
| Service | Command |
|---------|---------|
| Prometheus UI | `kubectl port-forward service/prometheus 9090:9090` → [http://localhost:9090](http://localhost:9090) |
| Grafana UI | `kubectl port-forward service/grafana 3001:3000` → [http://localhost:3001](http://localhost:3001) |
| Application Metrics | `kubectl port-forward service/polkadot-metrics-svc 3000:3000` → [http://localhost:3000/metrics](http://localhost:3000/metrics) |

---

### **🔹 Option 2: Run Locally with Docker Compose**
```sh
docker compose up --build
```
- Prometheus: [http://localhost:9090](http://localhost:9090)
- Grafana: [http://localhost:3001](http://localhost:3001)

---

## 🌍 2. Visualizing Metrics in Grafana
1. Log into Grafana (`admin/admin` on first login).
2. Add **Prometheus** as a data source:
   - URL: `http://prometheus:9090`
3. Create a dashboard and add panels:
   - `polkadot_current_era`
   - `polkadot_validator_reward_points`
   - `polkadot_session_current_index`
   - `polkadot_system_block_number`

---

## 👩‍💻 3. Architecture Overview
```plaintext
+--------------------------------+
|  Polkadot-Metrics (Node.js)    |
|  - Exposes /metrics endpoint   |
|  - Exposes /status             |
+---------------+----------------+
                |
                v
+--------------------------------+
|  Prometheus                    |
|  - Scrapes /metrics data       |
|  - Stores time-series data     |
+---------------+----------------+
                |
                v
+--------------------------------+
|  Grafana                       |
|  - Queries Prometheus          |
|  - Displays visual dashboards  |
+--------------------------------+
```

---

## 🚀 4. Scaling for High Load
- **Horizontal Pod Autoscaling (HPA)**
  - Set to auto-scale based on CPU utilization.
  - View with:
    ```sh
    kubectl get hpa
    ```

---

