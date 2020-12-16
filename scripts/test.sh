#!/bin/sh

echo "Test command: cat /etc/os-release | head -n 2"
cat /etc/os-release | head -n 2; echo

echo "Test command: pwd"
pwd; echo

echo "Test command: ls -la"
ls -la; echo

echo "Test command: echo \"Success!\" > test.txt"
echo "Success!" > test.txt
