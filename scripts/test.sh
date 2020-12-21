#!/bin/sh

echo "# grep -w PRETTY_NAME /etc/os-release"
grep -w PRETTY_NAME /etc/os-release

echo "# ls -la"
ls -la

echo "# echo \"Success!\" > test.txt"
echo "Success!" > test.txt

echo "# ping -q -c 1 github.com | grep -w packet"
ping -q -c 1 github.com | grep -w packet
