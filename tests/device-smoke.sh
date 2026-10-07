#!/usr/bin/env bash
set -euo pipefail
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
for size in 720x1280 1080x2400 1600x2560 1280x720; do
  adb shell wm size "$size"
  adb shell wm density 320
  result=$(adb shell am instrument -w com.enisyergok.primalcrafting.test/com.enisyergok.primalcrafting.SmokeTest)
  echo "$size: $result"
  echo "$result" | grep -q 'PASS: menus'
  mkdir -p "build/screenshots/$size"
  adb pull /sdcard/Android/data/com.enisyergok.primalcrafting/files/. "build/screenshots/$size/"
done
adb shell wm size reset
adb shell wm density reset
