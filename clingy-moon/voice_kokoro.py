"""Narration in the Moon-breakup voice: Kokoro-82M bm_george (en-gb), one take per line, word times from faster-whisper.
    python3 voice_kokoro.py MODEL_DIR      (MODEL_DIR holds kokoro-v1.0.onnx and voices-v1.0.bin; pip install kokoro-onnx faster-whisper soundfile)
Writes voices/vXX.wav, dur.json, words.json ([word, start, end] relative to the line, first start = -0.6)."""
import sys, os, json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
from faster_whisper import WhisperModel
HERE = os.path.dirname(os.path.abspath(__file__)); M = sys.argv[1]; V = os.path.join(HERE, 'voices'); os.makedirs(V, exist_ok=True)
k = Kokoro(os.path.join(M, 'kokoro-v1.0.onnx'), os.path.join(M, 'voices-v1.0.bin'))
asr = WhisperModel('small.en', device='cpu', compute_type='int8')
lines = json.load(open(os.path.join(HERE, 'lines.json'))); dur, words = {}, {}
only = sys.argv[2:]
if only:
    dur = json.load(open(os.path.join(V, 'dur.json'))); words = json.load(open(os.path.join(V, 'words.json')))
for L in lines:
    if only and L['id'] not in only: continue
    y, sr = k.create(L.get('say', L['text']), voice=L.get('voice', 'bm_george'), speed=L.get('speed', 1.06), lang=L.get('lang', 'en-gb'))
    y = np.asarray(y, np.float32); a = np.flatnonzero(np.abs(y) > .01)
    y = y[max(0, a[0] - int(.04 * sr)): a[-1] + int(.14 * sr)]
    p = os.path.join(V, L['id'] + '.wav'); sf.write(p, y, sr)
    import soxr; segs, _ = asr.transcribe(soxr.resample(y, sr, 16000).astype(np.float32), word_timestamps=True, language='en')
    w = [[x.word.strip(), round(x.start, 2), round(x.end, 2)] for s in segs for x in s.words]
    if w: w[0][1] = -0.6
    words[L['id']] = w; dur[L['id']] = round(len(y) / sr, 3)
    print(L['id'], dur[L['id']], ' '.join(x[0] for x in w))
json.dump(dur, open(os.path.join(V, 'dur.json'), 'w'), indent=1); json.dump(words, open(os.path.join(V, 'words.json'), 'w'), indent=1)
