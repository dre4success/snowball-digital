#!/bin/bash

STACK_NAME=awsbootstrap
REGION=eu-west-1
CLI_PROFILE=dre4success

EC2_INSTANCE_TYPE=t3a.micro


# Deploy the CloudFormation template
echo -e "\n\n========= Deploying main.yml ========"
aws cloudformation deploy \
  --region $REGION \
  --profile $CLI_PROFILE \
  --stack-name $STACK_NAME \
  --template-file main.yml \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EC2InstanceType=$EC2_INSTANCE_TYPE

# If the deploy succeeded, show the DNS name of the created instance
if [ $? -eq 0 ]; then
	aws cloudformation list-exports \
		--profile dre4success
		--query "Exports[?Name=='InstanceEndpoint'].Value"
fi
