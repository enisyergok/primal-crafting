#!/usr/bin/env bash
set -euo pipefail
mkdir -p build
exec > >(tee build/device-smoke.log) 2>&1
trap 'adb shell wm size reset >/dev/null 2>&1 || true; adb shell wm density reset >/dev/null 2>&1 || true' EXIT
adb install -r app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
for size in 720x1280 1080x2400 1600x2560 1280x720; do
  adb shell wm size "$size"
  adb shell wm density 320
  passed=0
  for attempt in 1 2; do
    set +e
    result=$(adb shell am instrument -w com.enisyergok.primalcrafting.test/com.enisyergok.primalcrafting.SmokeTest 2>&1)
    instrument_status=$?
    set -e
    echo "$size attempt $attempt: $result"
    if [ "$instrument_status" -eq 0 ] && echo "$result" | grep -Eq 'PASS: .*menus'; then
      passed=1
      break
    fi
    adb shell am force-stop com.enisyergok.primalcrafting || true
    adb shell pm clear com.enisyergok.primalcrafting || true
    adb shell dumpsys activity activities | tail -n 80 || true
    adb shell logcat -d -t 200 -v brief | tail -n 200 || true
    sleep 2
  done
  if [ "$passed" -ne 1 ]; then
    {
      echo "## Android smoke failure at $size"
      echo '```text'
      printf '%s\n' "$result"
      echo '```'
    } >> "${GITHUB_STEP_SUMMARY:-build/device-smoke-summary.md}"
    exit 1
  fi
  mkdir -p "build/screenshots/$size"
  adb pull /sdcard/Android/data/com.enisyergok.primalcrafting/files/. "build/screenshots/$size/"
done
adb shell wm size reset
adb shell wm density reset
