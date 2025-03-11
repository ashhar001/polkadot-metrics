output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}


output "Application_Endpoint" {
  description = "URL to access the Application with port 31584"
  value       = format("http://%s:31584", data.aws_instances.eks_nodes.public_ips[0])
}

output "Prometheus_Endpoint" {
  description = "URL to access Prometheus with port 31585"
  value       = format("http://%s:31585", data.aws_instances.eks_nodes.public_ips[0])
}

output "Grafana_Endpoint" {
  description = "URL to access Grafana with port 31586"
  value       = format("http://%s:31586", data.aws_instances.eks_nodes.public_ips[0])
}

# Data source to get node information
data "aws_instances" "eks_nodes" {
  instance_tags = {
    "eks:cluster-name" = var.cluster_name
  }

  instance_state_names = ["running"]
}