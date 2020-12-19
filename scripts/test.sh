#!/bin/sh

echo "# cat /etc/os-release | head -n 2"
cat /etc/os-release | head -n 2; echo

echo "# ls -la"
ls -la; echo

echo "# echo \"Success!\" > test.txt"
echo "Success!" > test.txt
