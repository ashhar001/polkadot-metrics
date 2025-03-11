module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = var.cluster_name
  cluster_version = "1.32"

  # Optional
  cluster_endpoint_public_access = true

  # Optional: Adds the current caller identity as an administrator via cluster access entry
  enable_cluster_creator_admin_permissions = true

  cluster_addons = {
    coredns                = {}
    eks-pod-identity-agent = {}
    kube-proxy             = {}
  }

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnets

  # Add security group rules to the main node security group
  node_security_group_additional_rules = {
    nodeport_tcp = {
      description = "NodePort Rules"
      protocol    = "tcp"
      from_port   = 30000
      to_port     = 32767
      type        = "ingress"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  eks_managed_node_groups = {
    eks_nodes = {
      desired_size = 1
      max_size     = 2
      min_size     = 1

      instance_type = "t3.xlarge"
      key_name      = var.key_pair
    }
  }

  tags = {
    Environment = "dev"
    Terraform   = "true"
  }
}

