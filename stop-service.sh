#!/bin/bash -xe
source /home/ubuntu/.profile
[ -d "/home/ubuntu/app/release" ] && \
cd /home/ubuntu/app/release && \
npm stop