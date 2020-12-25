#!/bin/sh

set -x

grep -w PRETTY_NAME /etc/os-release

ls -la

echo "Success!" | tee test.txt
