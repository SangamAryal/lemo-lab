import numpy as np
from scipy.signal import fftconvolve
from .sfx import SR
def room(x, size=.15, mix=.1):
    n = int(SR * (0.3 + size * 2)); rng = np.random.default_rng(3); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (0.05 + size * .4)); ir /= np.abs(ir).sum() ** .5 * 6
    return np.stack([fftconvolve(x[:, c], ir)[:len(x)] for c in range(x.shape[1])], 1).astype(np.float32)
