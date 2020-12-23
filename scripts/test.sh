#!/bin/sh

echo "# grep -w PRETTY_NAME /etc/os-release"
grep -w PRETTY_NAME /etc/os-release

echo "# ls -la"
ls -la

echo "# echo \"Success!\" > test.txt"
echo "Success!" > test.txt
