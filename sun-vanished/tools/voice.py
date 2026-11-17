"""Ryan voice (en-GB-RyanNeural, +5%) for every line via edge-tts -> voices/sXX.wav, dur.json, words.json (exact word times).
   python tools/voice.py .      (needs: pip install edge-tts; on the cloud proxy it reads /root/.ccr/ca-bundle.crt)"""
import sys, json, os, asyncio, subprocess, certifi
if os.path.exists("/root/.ccr/ca-bundle.crt"): certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts
D = sys.argv[1]; V = os.path.join(D, "voices")
lines = json.load(open(os.path.join(D, "lines.json")))
async def one(L):
    c = edge_tts.Communicate(L["text"], "en-GB-RyanNeural", rate="+5%", boundary="WordBoundary")
    mp3 = os.path.join(V, L["id"] + ".mp3"); b = []
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": b.append((ch["text"], ch["offset"]/1e7, (ch["offset"]+ch["duration"])/1e7))
    return mp3, b
async def main():
    dur, words = {}, {}
    for L in lines:
        mp3, b = await one(L)
        wav = mp3[:-4] + ".wav"
        subprocess.run(["ffmpeg","-v","error","-y","-i",mp3,"-ac","1","-ar","48000",wav], check=True)
        d = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",wav],capture_output=True,text=True).stdout)
        toks = L["text"].split()
        if len(toks) != len(b): print("MISMATCH", L["id"], len(toks), len(b), [x[0] for x in b])
        out = []
        for k, w in enumerate(toks):
            _, s, e = b[min(k, len(b)-1)]
            out.append([w, -0.6 if k == 0 else round(s,3), round(e,3)])
        dur[L["id"]] = round(d,3); words[L["id"]] = out
    json.dump(dur, open(os.path.join(V,"dur.json"),"w"), indent=1)
    json.dump(words, open(os.path.join(V,"words.json"),"w"), indent=0)
    print(dur, round(sum(dur.values()),2))
asyncio.run(main())
