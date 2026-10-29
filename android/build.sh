#!/bin/sh
# Builds the APK inside Docker. Usage: ./build.sh [gradle tasks...]
# Default: unit tests + debug APK -> app/build/outputs/apk/debug/app-debug.apk
set -e
cd "$(dirname "$0")"
docker build --platform linux/amd64 -t doctorpanic-android .
docker run --rm --platform linux/amd64 \
    -v "$(cd .. && pwd)":/src \
    -v doctorpanic-gradle:/home/gradle/.gradle \
    -w /src/android \
    doctorpanic-android gradle --no-daemon "${@:-testDebugUnitTest}" assembleDebug
