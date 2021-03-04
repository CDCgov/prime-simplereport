#!/bin/bash

echo "Running pre-commit hooks..."

cd frontend
echo "Running prettier and eslint..."
yarn precommit

cd ../backend
echo "Running spotless..."
./gradlew spotlessApply

echo "Pre-commit hooks completed."