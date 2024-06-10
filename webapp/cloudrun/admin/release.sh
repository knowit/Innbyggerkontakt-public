#!/bin/bash
cd "${0%/*}"

rm -rf src/packages
mkdir src/packages
cp -r ../../packages_source/python/innbyggerkontakt src/packages/innbyggerkontakt

docker build -t gcr.io/innbyggerkontakt-dev/admin .
docker push gcr.io/innbyggerkontakt-dev/admin:latest
