#!/bin/bash

echo "git config --global --add safe.directory /app"
git config --global --add safe.directory /app

yarn dev
