provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = [local.account_ids[terraform.workspace]]
  default_tags {
    tags = {
      Environment     = terraform.workspace
      TerraformSource = "sba-gov-yumi/terraform"
      ManagedBy       = "terraform"
    }
  }
}

terraform {
  backend "s3" {
    bucket         = "sbagovlower-terraform-remote-state"
    region               = "us-east-1"
    dynamodb_table       = "terraform-state-locktable"
    acl                  = "bucket-owner-full-control"
    key                  = "yumi.terraform.tfstate"
    workspace_key_prefix = "yumi"
  }
}

data "aws_caller_identity" "current" {}
data "aws_region" "region" {}
locals {
  region       = data.aws_region.region.name
  account_id   = data.aws_caller_identity.current.account_id
  account_name = "upper"
  account_ids = {
    default = "230968663929" #Only upper
  }
}
