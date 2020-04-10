#!/bin/bash -xe
source /home/ubuntu/.bash_profile
[ -d "/home/ubuntu/app/release" ] && \
cd /home/ubuntu/app/release && \
npm run start