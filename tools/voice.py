"""House narration for Beyond Everything films: edge-tts "Ryan" (en-GB-RyanNeural, +5%), one take per line,
with the dead air taken out so the lines flow like one read.

    python3 tools/voice.py FILM_DIR        (needs: pip install edge-tts numpy soundfile)

Writes FILM_DIR/voices/sXX.wav, dur.json and words.json ([word, start, end] relative to the line, first start = -0.6).

Why the trimming: edge-tts pads every take with ~0.2 s of silence at the start and ~0.8 s at the end, and puts
~0.9 s between two sentences inside one take. Films then added their own 0.4 s gap between lines, so the listener
heard 1.2-1.7 s of nothing between sentences (the "too much gap" in What If the Sun Vanished?). Here every take is
cut to HEAD s before the first sound and TAIL s after the last, and any pause inside a take longer than MAXP is
shortened to MAXP. Word times are remapped through the same cuts. Films should then use a small line gap
(LINE_GAP below, ~0.2 s) so the space between lines is about HEAD + TAIL + LINE_GAP = 0.4 s.
"""
import sys, json, os, asyncio, subprocess
import numpy as np, soundfile as sf
if os.path.exists("/root/.ccr/ca-bundle.crt"):
    import certifi; certifi.where = lambda: "/root/.ccr/ca-bundle.crt"
import edge_tts

VOICE, RATE = "en-GB-RyanNeural", "+5%"
HEAD, TAIL = .04, .14          # silence kept before the first and after the last sound of a take
MAXP = .30                     # longest pause allowed inside a take (sentence breaks); commas are shorter and stay
LINE_GAP = .20                 # suggested gap between takes in the film timeline
THR_DB = -42                   # below this (dBFS, 10 ms RMS) counts as silence
SR = 48000

def tighten(y, words):
    """Cut leading/trailing silence and shorten long inner pauses. Returns (audio, remapped words)."""
    hop = int(.01 * SR); n = len(y) // hop
    rms = np.sqrt(np.mean(y[:n * hop].reshape(n, hop) ** 2, 1) + 1e-12)
    loud = 20 * np.log10(rms) > THR_DB
    idx = np.flatnonzero(loud)
    if not len(idx): return y, words
    a, b = idx[0] * hop, min(len(y), (idx[-1] + 1) * hop)
    keep = [(max(0, a - int(HEAD * SR)), min(len(y), b + int(TAIL * SR)))]   # spans kept, in samples
    # silent runs inside [a, b]
    runs, i = [], idx[0]
    while i < idx[-1]:
        if not loud[i]:
            j = i
            while j < idx[-1] and not loud[j]: j += 1
            runs.append((i * hop, j * hop)); i = j
        else: i += 1
    cuts = []
    for s, e in runs:
        if (e - s) / SR > MAXP:
            m = int(MAXP * SR) // 2; cuts.append((s + m, e - m))
    spans, cur = [], keep[0][0]
    for s, e in cuts: spans.append((cur, s)); cur = e
    spans.append((cur, keep[0][1]))
    xf = int(.008 * SR); out = []
    for k, (s, e) in enumerate(spans):
        seg = y[s:e].copy()
        if k > 0: seg[:xf] *= np.linspace(0, 1, xf)
        if k < len(spans) - 1: seg[-xf:] *= np.linspace(1, 0, xf)
        out.append(seg)
    def remap(t):
        p = int(t * SR); acc = 0
        for s, e in spans:
            if p < s: return acc / SR
            if p <= e: return (acc + p - s) / SR
            acc += e - s
        return acc / SR
    return np.concatenate(out), [[w, remap(s), remap(e)] for w, s, e in words]

async def take(text, mp3):
    c = edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary"); b = []
    with open(mp3, "wb") as f:
        async for ch in c.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": b.append((ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7))
    return b

async def main(D):
    V = os.path.join(D, "voices"); os.makedirs(V, exist_ok=True)
    lines = json.load(open(os.path.join(D, "lines.json")))
    dur, words, raw = {}, {}, 0.
    for L in lines:
        mp3 = os.path.join(V, L["id"] + ".mp3"); b = await take(L.get("say", L["text"]), mp3)
        wav = mp3[:-4] + ".wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(SR), wav], check=True)
        y, _ = sf.read(wav); raw += len(y) / SR
        toks = L["text"].split()
        if len(toks) != len(b): print("MISMATCH", L["id"], len(toks), len(b), [x[0] for x in b])
        ws = [[w, *b[min(k, len(b) - 1)][1:]] for k, w in enumerate(toks)]
        y, ws = tighten(y.astype(np.float32), ws)
        sf.write(wav, y, SR)
        dur[L["id"]] = round(len(y) / SR, 3)
        words[L["id"]] = [[w, -0.6 if k == 0 else round(s, 3), round(e, 3)] for k, (w, s, e) in enumerate(ws)]
    json.dump(dur, open(os.path.join(V, "dur.json"), "w"), indent=1)
    json.dump(words, open(os.path.join(V, "words.json"), "w"), indent=0)
    print(dur); print("takes", round(raw, 2), "s raw ->", round(sum(dur.values()), 2), "s tightened")

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
