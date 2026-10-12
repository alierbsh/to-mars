"""Rasterise a binary STL terrain model (NASA 3D-printable DEM) into a 16-bit heightmap PNG.

Height is encoded as R = high byte, G = low byte (B = 0), normalised 0..65535 over the model's
relief, so the web client can decode with (r*256+g)/65535 from an 8-bit canvas.
Usage: python3 -I stl2height.py in.stl out.png N [crop_fraction]
"""
import struct, sys
import numpy as np
from PIL import Image

src, dst, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
crop = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
with open(src, 'rb') as f:
    f.read(80)
    count = struct.unpack('<I', f.read(4))[0]
    data = np.frombuffer(f.read(count * 50), dtype=np.uint8).reshape(count, 50)
tri = data[:, 12:48].copy().view('<f4').reshape(count, 3, 3)
v = tri.reshape(-1, 3)
x, y, z = v[:, 0], v[:, 1], v[:, 2]
print('triangles', count, 'x', x.min(), x.max(), 'y', y.min(), y.max(), 'z', z.min(), z.max())
# keep the inner crop fraction of the square (drops the printed border wall)
cx, cy = (x.min() + x.max()) / 2, (y.min() + y.max()) / 2
hw = (x.max() - x.min()) / 2 * crop
hh = (y.max() - y.min()) / 2 * crop
m = (np.abs(x - cx) <= hw) & (np.abs(y - cy) <= hh)
x, y, z = x[m], y[m], z[m]
ix = np.clip(((x - (cx - hw)) / (2 * hw) * (n - 1)).round().astype(int), 0, n - 1)
iy = np.clip(((y - (cy - hh)) / (2 * hh) * (n - 1)).round().astype(int), 0, n - 1)
grid = np.full((n, n), -np.inf)
np.maximum.at(grid, (iy, ix), z)
holes = ~np.isfinite(grid)
print('holes', int(holes.sum()), 'of', n * n)
# fill holes by iterative neighbour mean
g = np.where(holes, np.nan, grid)
for _ in range(64):
    if not np.isnan(g).any():
        break
    p = np.pad(g, 1, mode='edge')
    stack = np.stack([p[:-2, 1:-1], p[2:, 1:-1], p[1:-1, :-2], p[1:-1, 2:]])
    mean = np.nanmean(stack, axis=0)
    g = np.where(np.isnan(g), mean, g)
g = np.nan_to_num(g, nan=np.nanmin(g))
# the top surface sits above the base plate; strip the plate by clamping to the 1st percentile
lo = np.percentile(g, 0.5)
hi = g.max()
print('relief (model units)', lo, hi, 'extent', 2 * hw, 2 * hh)
hn = np.clip((g - lo) / (hi - lo), 0, 1)
# light 3x3 smoothing to hide rasterisation noise
p = np.pad(hn, 1, mode='edge')
hn = (p[:-2, :-2] + p[:-2, 1:-1] + p[:-2, 2:] + p[1:-1, :-2] + 4 * p[1:-1, 1:-1] + p[1:-1, 2:] + p[2:, :-2] + p[2:, 1:-1] + p[2:, 2:]) / 12
q = (hn * 65535).round().astype(np.uint32)
img = np.zeros((n, n, 3), dtype=np.uint8)
img[:, :, 0] = q >> 8
img[:, :, 1] = q & 255
# image row 0 = min y of the model (the STL's +y points south: Ma'adim Vallis ends up at the bottom = south)
Image.fromarray(img, 'RGB').save(dst, optimize=True)
print('wrote', dst)
