# Daily "Did you know?" photos → Google Drive

- **Schedule:** cron at 08:00, plus a fallback run at 19:15 for days the computer was off in the morning (`crontab -l` to see them, `crontab -e` to change or remove). Photos are made only once per day (marker `.made-YYYY-MM-DD`). Any of today's photos that didn't upload (no `.up-<file>` marker) are retried on the next run.
- **What it does:** `daily.sh` runs `make.sh 2`. That renders the next 2 unused facts from `facts.json` into `out/`, marks them used in `used.txt`, and uploads them with rclone to Drive → "Beyond Everything - Daily Facts/facebook". Everything is logged to `daily.log`.
- **Facts:** 30 checked facts with sources in `facts.json` (15 days). When fewer than 10 are left, `REFILL-FACTS.txt` appears, so ask Claude to add more.
  Fields: id, head (headline), stat (gold line), sub (small line), motif (planet · sun · moon · earth · earthmoon · compare · dino · fish · bignum), optional color/ring/spot/big/small/core/station, source.
- **Run it now by hand:** `sh daily.sh`
- **If uploads keep failing** ("rateLimitExceeded" in daily.log), the rclone app's shared Google quota is busy. Set up your own Google client ID: https://rclone.org/drive/#making-your-own-client-id
- **Note:** if the computer is off at both 08:00 and 19:15, that day is skipped. The next run continues with the next facts.
