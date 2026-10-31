#!/bin/bash
# runs every test suite; prints a summary line per suite
cd "$(dirname "$0")/.."
for t in soiltest v8test savetest v11test decortest phonetest padtest growtest colltest gentest racktest smoketest shoptest helptest $EXTRA; do
  [ -f tools/$t.cjs ] || continue
  out=$(timeout 900 node tools/$t.cjs 2>&1); c=$?
  echo "== $t exit=$c :: $(echo "$out" | grep -E 'passed|[0-9]+/[0-9]+' | tail -1) :: fails: $(echo "$out" | grep -c '^FAIL')"
  echo "$out" | grep '^FAIL' | head -5
done
