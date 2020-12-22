#!/bin/sh

echo "# grep -w PRETTY_NAME /etc/os-release"
grep -w PRETTY_NAME /etc/os-release

echo "# ls -la"
ls -la

echo "# echo \"Success!\" > test.txt"
echo "Success!" > test.txt

echo "# host github.com | head -n 1"
host github.com | head -n 1
