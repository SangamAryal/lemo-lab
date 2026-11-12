"""stand-in for Lemo-Opuscar core/audio/sfx.py"""
import numpy as np
from scipy.signal import butter, sosfilt
SR = 48000
def _f(x, kind, f):
    x = np.asarray(x, np.float64); sos = butter(2, f, kind, fs=SR, output='sos')
    return sosfilt(sos, x, axis=-1)
def lp(x, f): return _f(x, 'lowpass', min(f, SR / 2 - 100))
def hp(x, f): return _f(x, 'highpass', f)
def bp(x, lo, hi): return _f(x, 'bandpass', [lo, min(hi, SR / 2 - 100)])
def add(buf, x, t, g=1., pan=0.):
    i = int(t * SR)
    if i >= len(buf): return
    x = np.asarray(x, np.float32)
    if x.ndim == 1:
        l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2); x = np.stack([x * l, x * r], 1) * 1.414
    n = min(len(x), len(buf) - i); buf[i:i + n] += x[:n] * g
def compress(x, thr=.2, ratio=3., att=.005, rel=.1):
    x = np.asarray(x, np.float64); env = np.abs(x); out = np.empty_like(env); e = 0.
    aa, rr = np.exp(-1 / (att * SR)), np.exp(-1 / (rel * SR))
    for j in range(0, len(env), 64):
        m = env[j:j + 64].max(); c = aa if m > e else rr; e = c * e + (1 - c) * m; out[j:j + 64] = e
    gain = np.where(out > thr, (thr + (out - thr) / ratio) / np.maximum(out, 1e-9), 1.)
    return x * gain
def limit(x, ceil=.95):
    x = np.asarray(x, np.float64); env = np.maximum.accumulate(np.zeros(1))  # simple look-ahead-free soft limiter
    pk = np.abs(x).max()
    if pk > ceil: x = np.tanh(x / ceil * 1.0) * ceil if pk < ceil * 3 else x / pk * ceil
    return x
