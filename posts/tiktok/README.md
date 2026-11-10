# TikTok "5 amazing facts about …" carousel (daily, automatic)

Every day cron runs `daily.sh` at **08:00**, and again at **19:15** in case the PC was off in the morning (it only makes one carousel per day).
It takes the next unused topic from `topics.json`, renders 6 vertical slides (1080×1440, 3:4) and uploads them to Google Drive → **Beyond Everything - Daily Facts/tiktok/<date> <topic>/01.jpg … 06.jpg**.

- 01 = cover "5 AMAZING FACTS ABOUT <TOPIC>", 02–06 = facts #5 → #1 (the best fact is last).
- Local copies: `out/<date>_<topic>/`. Log: `daily.log`. Used topics: `used.txt`.
- When fewer than 3 topics are left, `REFILL-TOPICS.txt` appears — add more topics to `topics.json` (same shape: id, title, cover, 5 facts).
- Run by hand: `sh make.sh` (render only) or `sh daily.sh` (render + upload).
- Preview a slide in the browser via index.html `?topic=mars&slide=3`.
