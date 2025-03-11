variable "region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "access_key" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "secret_key" {
  description = "AWS region to deploy resources"
  type        = string
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
  default     = "polkadot-eks-cluster"
}

variable "vpc_name" {
  description = "Name for the VPC"
  type        = string
  default     = "polkadot-eks-vpc"
}

variable "key_pair" {
  description = "The key pair name for EC2 instances in the EKS node group"
  type        = string
  default     = "polka-aws-key"
}

variable "app_image" {
  description = "Container image for the Node.js application"
  type        = string
  default     = "ashhar001/polkadot-metrics:v8"
}
