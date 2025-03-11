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



## AWS EKS Deployment

Follow these steps to deploy the application on AWS EKS:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/polkadot-metrics.git
   cd polkadot-metrics
   ```

2. **Configure AWS Credentials**:
   Navigate to `terraform/variables.tf` and update your AWS credentials:
   ```hcl
   # Example (Replace with your actual credentials)
   variable "access_key" {
      description = "AWS region to deploy resources"
      type        = string
      default     = "AKIAXXXXXXXXXXXXXXXX"
   }
   variable "secret_key" {
      description = "AWS region to deploy resources"
      type        = string
      default     = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
   }
   ```

3. **Deploy EKS Infrastructure**:
   ```bash
   cd terraform
   terraform init
   terraform fmt
   terraform plan
   terraform apply
   ```
   
   Wait for the infrastructure deployment to complete. The process typically takes 15-20 minutes.

4. **Configure kubectl for EKS**:
   After successful deployment, configure kubectl to connect to your EKS cluster:
   ```bash
   aws eks update-kubeconfig --region us-east-1 --name polkadot-eks-cluster
   ```

5. **Verify Deployment**:
   Check the status of your pods and services:
   ```bash
   kubectl get pods
   kubectl get svc
   ```

6. **Deploy Application using Helm**:
   ```bash
   helm install polkadot-metrics ./polkadot-metrics
   ```

7. **Access the Applications**:
   After deployment, check the `terraform output` for the following URLs:
   - Application URL: Access your Polkadot metrics application
      - Eg: `http:node_ip:31584`
   - Prometheus URL: Monitor your metrics
      - Eg: `http:node_ip:31585`
   - Grafana URL: Visualize your metrics with pre-configured dashboards
      - Eg: `http:node_ip:31586`

   Note: It might take a few minutes for the Node to be provisioned and the URLs to become accessible.

## Important Notes

- Ensure you have the AWS CLI installed and configured
- Keep your AWS credentials secure and never commit them to version control
- Remember to destroy the infrastructure when not needed to avoid unnecessary costs:
  ```bash
  terraform destroy
  ```



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

