#!/bin/sh

echo "# cat /etc/os-release | head -n 2"
cat /etc/os-release | head -n 2

echo "# ls -la"
ls -la

echo "# echo \"Success!\" > test.txt"
echo "Success!" > test.txt

echo "# ping -q -c 1 github.com | tail -n 2"
ping -q -c 1 github.com | tail -n 2
