#!/bin/sh
# Daily job: render the next "Did you know?" photo and upload them to Google Drive with rclone.
# cron runs it at 08:00 and again at 19:15 as a fallback. Today's photos are made only once (marker .made-YYYY-MM-DD).
# Any of today's photos that are not uploaded yet (.up-<file> markers) are retried on every run.
HERE=/home/sangam/lemo-lab/posts/daily; FOLDER="Beyond Everything - Daily Facts/facebook"; DAY=$(date +%F)
export HOME=/home/sangam PATH=/usr/local/bin:/usr/bin:/bin
cd "$HERE" || exit 1
{
  echo "=== $(date '+%F %T')"
  if [ -f "$HERE/.made-$DAY" ]; then echo "today's photos already made"
  else
    OUT=$(sh "$HERE/make.sh" 1 2>&1); echo "$OUT"
    echo "$OUT" | grep -q '\.jpg$' && touch "$HERE/.made-$DAY"
    echo "$OUT" | grep 'WARNING_FACTS_LEFT\|NO_FACTS_LEFT' > "$HERE/REFILL-FACTS.txt" || rm -f "$HERE/REFILL-FACTS.txt"
  fi
  for f in "$HERE"/out/"$DAY"_*.jpg; do                            # upload whatever of today's photos isn't up yet
    [ -f "$f" ] || continue; b=$(basename "$f"); [ -f "$HERE/.up-$b" ] && continue
    for i in 1 2 3 4 5 6; do                                        # rclone's shared Google quota is often busy: retry with back-off
      if rclone copy "$f" "gdrive:$FOLDER" --retries 3 --low-level-retries 20 2>/dev/null; then touch "$HERE/.up-$b"; echo "uploaded $b (try $i)"; break; fi
      [ $i = 6 ] && echo "UPLOAD FAILED $b (will retry on the next run; the file is in $HERE/out)"; sleep 60
    done
  done
} >> "$HERE/daily.log" 2>&1
