#!/bin/sh
#
# Requirements: Azure Cli, Terraform
# This script will upgrade all terraform modules to the latest version based on contraints in the _config.tf files

az login

TERRAFORM_DIRS="dev dev/persistent dev2 dev2/persistent dev3 dev3/persistent dev4 dev4/persistent dev5 dev5/persistent dev6 dev6/persistent dev7 dev7/persistent test test/persistent demo demo/persistent training training/persistent stg stg/persistent pentest pentest/persistent prod prod/persistent global"

terraform fmt -recursive

for d in $TERRAFORM_DIRS
do
    echo "Initializing/formatting/validating $d";
    (cd $d && rm .terraform.lock.hcl && terraform init -upgrade -backend=false && terraform validate)
done
