#!/bin/sh
# Daily job: render the next "5 amazing facts about …" TikTok carousel (6 slides) and upload it to Google Drive
# (Drive folder "Beyond Everything - Daily Facts/tiktok/<date> <topic>"). cron runs it at 08:00 and again at 19:15 as a fallback.
# Today's carousel is made only once (marker .made-YYYY-MM-DD); an upload that failed is retried on every run (.up-<folder>).
HERE=/home/sangam/lemo-lab/posts/tiktok; DAY=$(date +%F)
export HOME=/home/sangam PATH=/usr/local/bin:/usr/bin:/bin
cd "$HERE" || exit 1
{
  echo "=== $(date '+%F %T')"
  if [ -f "$HERE/.made-$DAY" ]; then echo "today's carousel already made"
  else
    OUT=$(sh "$HERE/make.sh" 2>&1); echo "$OUT"
    echo "$OUT" | grep -q "/out/${DAY}_" && touch "$HERE/.made-$DAY"
    echo "$OUT" | grep 'WARNING_TOPICS_LEFT\|NO_TOPICS_LEFT' > "$HERE/REFILL-TOPICS.txt" || rm -f "$HERE/REFILL-TOPICS.txt"
  fi
  for d in "$HERE"/out/"$DAY"_*; do
    [ -d "$d" ] || continue; b=$(basename "$d"); [ -f "$HERE/.up-$b" ] && continue
    dest="gdrive:Beyond Everything - Daily Facts/tiktok/$DAY ${b#${DAY}_}"
    for i in 1 2 3 4 5 6; do                                        # rclone's shared Google quota is often busy: retry with back-off
      if rclone copy "$d" "$dest" --retries 3 --low-level-retries 20 2>/dev/null; then touch "$HERE/.up-$b"; echo "uploaded $b (try $i)"; break; fi
      [ $i = 6 ] && echo "UPLOAD FAILED $b (will retry on the next run; the files are in $d)"; sleep 60
    done
  done
} >> "$HERE/daily.log" 2>&1
